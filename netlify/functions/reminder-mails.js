const { json } = require("./_lib/response");
const { optional } = require("./_lib/config");
const { sb, eq } = require("./_lib/supabase");

// 予約開始の約22分前にゲストへ「お相手プロフィール付き」リマインダーメールを送る。
// スケジューラ（Netlify Scheduled Functions / 外部cron）から ~5分間隔で叩く想定。
const LEAD_MINUTES = 22;
const WINDOW_MINUTES = 5; // 実行間隔ぶんの送信ウィンドウ

function isAuthorized(event) {
  const secret = optional("REMINDER_CRON_SECRET", optional("CRON_SECRET", ""));
  if (!secret) return true;
  const headers = event.headers || {};
  const authorization = headers.authorization || headers.Authorization || "";
  const querySecret = event.queryStringParameters?.secret || "";
  return authorization === `Bearer ${secret}` || querySecret === secret;
}

function formatJst(iso) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch (_) {
    return iso;
  }
}

async function ownerMap() {
  try {
    const rows = await sb("owners?select=id,name,email,plan&limit=10000");
    return new Map((rows || []).map((owner) => [owner.id, owner]));
  } catch (_) {
    return new Map();
  }
}

async function ownerProfile(ownerId) {
  try {
    const rows = await sb(`profiles?owner_id=${eq(ownerId)}&limit=1`);
    const row = rows[0];
    if (!row) return {};
    return row.data && Object.keys(row.data).length ? row.data : {};
  } catch (_) {
    return {};
  }
}

// 無料版は基本リマインダー（相手名＋会議URL）。Pro はお相手プロフィール付き。
function buildMessage(booking, owner, profile, isPro) {
  const guestName = booking.visitor_name || booking.guest_name || "";
  const greeting = guestName ? `${guestName}さん` : "こんにちは";
  const ownerName = profile.profile_name || owner?.name || owner?.email || "お相手";
  const when = formatJst(booking.start_at || booking.start_time);
  const lines = [
    `${greeting}`,
    "",
    `まもなく ${ownerName} との面談です（開始予定: ${when}）。`,
  ];
  if (booking.meeting_url) lines.push(`ミーティング: ${booking.meeting_url}`);
  if (isPro) {
    lines.push("", "― お相手のプロフィール ―", ownerName + (profile.profile_title ? ` / ${profile.profile_title}` : ""));
    if (profile.profile_strengths) lines.push(`強み: ${profile.profile_strengths}`);
    if (profile.profile_offer) lines.push(`提供できること: ${profile.profile_offer}`);
    if (profile.profile_values) lines.push(`大切にしていること: ${profile.profile_values}`);
  }
  lines.push("", "良い時間になりますように。");
  return { subject: `まもなく面談です（${when}）`, text: lines.join("\n") };
}

async function alreadySent(bookingId) {
  try {
    const rows = await sb(`reminder_deliveries?booking_id=${eq(bookingId)}&limit=1`);
    return Boolean(rows[0]);
  } catch (_) {
    return false;
  }
}

async function markSent(bookingId, providerMessageId, status, errorMessage = "") {
  try {
    await sb("reminder_deliveries", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId, provider_message_id: providerMessageId || "", status, error_message: errorMessage }),
    });
  } catch (_) {
    // 配信記録テーブル未適用でもジョブは止めない
  }
}

async function sendViaResend({ to, subject, text }) {
  const apiKey = optional("RESEND_API_KEY", "");
  const from = optional("REMINDER_EMAIL_FROM", optional("BIRTHDAY_EMAIL_FROM", ""));
  const replyTo = optional("REMINDER_EMAIL_REPLY_TO", optional("BIRTHDAY_EMAIL_REPLY_TO", ""));
  if (!apiKey || !from) return { skipped: true, reason: "Missing RESEND_API_KEY or REMINDER_EMAIL_FROM" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "リマインドメールの送信に失敗しました");
  return { id: data.id || "" };
}

// 送信処理の本体。HTTP ハンドラと Scheduled Function（reminder-scheduled.js）の双方から呼ぶ。
async function run(dryRun) {
  const now = new Date();
  const from = new Date(now.getTime() + (LEAD_MINUTES - WINDOW_MINUTES) * 60 * 1000);
  const to = new Date(now.getTime() + LEAD_MINUTES * 60 * 1000);

  const bookings = await sb(
    `bookings?select=*&status=eq.confirmed&start_at=gte.${encodeURIComponent(from.toISOString())}&start_at=lte.${encodeURIComponent(to.toISOString())}&order=start_at.asc&limit=500`
  );
  const owners = await ownerMap();

  const results = [];
  for (const booking of bookings || []) {
    const recipient = booking.visitor_email || booking.guest_email || "";
    if (!recipient) {
      results.push({ booking_id: booking.id, status: "skipped", reason: "Missing visitor email" });
      continue;
    }
    if (await alreadySent(booking.id)) {
      results.push({ booking_id: booking.id, to: recipient, status: "skipped", reason: "Already sent" });
      continue;
    }
    const owner = owners.get(booking.owner_id || booking.user_id);
    const isPro = owner?.plan === "pro";
    const profile = isPro ? await ownerProfile(booking.owner_id || booking.user_id) : {};
    const message = buildMessage(booking, owner, profile, isPro);
    if (dryRun) {
      results.push({ booking_id: booking.id, to: recipient, status: "dry_run", subject: message.subject, text: message.text });
      continue;
    }
    try {
      const sent = await sendViaResend({ to: recipient, ...message });
      if (sent.skipped) {
        results.push({ booking_id: booking.id, to: recipient, status: "dry_run", reason: sent.reason, subject: message.subject, text: message.text });
        continue;
      }
      await markSent(booking.id, sent.id, "sent");
      results.push({ booking_id: booking.id, to: recipient, status: "sent", provider_message_id: sent.id });
    } catch (error) {
      await markSent(booking.id, "", "failed", error.message);
      results.push({ booking_id: booking.id, to: recipient, status: "failed", error: error.message });
    }
  }

  return { ok: true, window: { from: from.toISOString(), to: to.toISOString() }, due_count: (bookings || []).length, results };
}

exports.run = run;

exports.handler = async (event) => {
  if (!["GET", "POST"].includes(event.httpMethod)) return json(405, { error: "許可されていない操作です" });
  if (!isAuthorized(event)) return json(401, { error: "認証が必要です" });
  const dryRun = event.queryStringParameters?.dry_run === "1" || event.queryStringParameters?.dry_run === "true";
  try {
    return json(200, await run(dryRun));
  } catch (error) {
    return json(500, { error: error.message });
  }
};
