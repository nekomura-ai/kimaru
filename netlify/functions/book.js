const { json, readJson } = require("./_lib/response");
const { sb, eq, defaultOwner, findOwnerById } = require("./_lib/supabase");
const { createCalendarEvent } = require("./_lib/google");
const { optional } = require("./_lib/config");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOCATION_LABELS = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  in_person: "対面",
  phone: "電話",
  custom_url: "オンライン",
  later: "後日連絡",
};

function formatJst(iso) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch (_) {
    return iso;
  }
}

// 予約完了メール（任意）。カレンダー招待が主だが、独自の確認メールも送る。Resend 未設定ならスキップ。
async function sendBookingConfirmation({ to, owner, booking, meetingUrl, locationValue }) {
  const apiKey = optional("RESEND_API_KEY", "");
  const from = optional("BOOKING_EMAIL_FROM", optional("BIRTHDAY_EMAIL_FROM", ""));
  const replyTo = optional("BOOKING_EMAIL_REPLY_TO", optional("BIRTHDAY_EMAIL_REPLY_TO", ""));
  if (!to || !apiKey || !from) return { skipped: true };
  const ownerName = owner?.name || owner?.email || "担当者";
  const when = formatJst(booking.start_at || booking.start_time);
  const lines = [
    `${booking.visitor_name || ""}さん`,
    "",
    "ご予約ありがとうございます。以下の内容で確定しました。",
    `お相手: ${ownerName}`,
    `日時: ${when}`,
    `開催方法: ${LOCATION_LABELS[booking.location_type] || booking.location_type || "オンライン"}`,
  ];
  if (meetingUrl) lines.push(`ミーティング: ${meetingUrl}`);
  if (locationValue) lines.push(`場所/案内: ${locationValue}`);
  lines.push("", "当日お会いできるのを楽しみにしています。");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `予約が確定しました（${when}）`, text: lines.join("\n"), ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "確認メールの送信に失敗しました");
  return { id: data.id || "" };
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseRelationshipContext(value) {
  if (!value || value === "none") return null;
  if (String(value).length > 12000) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed?.kind === "relationship_context" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function sanitizePrivateBirthDate(context, isPrivate) {
  if (!context || !isPrivate) return context;
  return { ...context, birth_date: "非公開", birth_date_private: true };
}

async function createBooking(payload) {
  try {
    return await sb("bookings", { method: "POST", body: JSON.stringify(payload) });
  } catch (error) {
    const message = String(error.message || "");
    const isMissingNewColumn = ["visitor_birth_date", "visitor_birth_date_private", "birthday_message_opt_in", "relationship_profile"].some((column) => message.includes(column));
    if (!isMissingNewColumn) throw error;
    const { visitor_birth_date, visitor_birth_date_private, birthday_message_opt_in, relationship_profile, ...fallbackPayload } = payload;
    return sb("bookings", { method: "POST", body: JSON.stringify(fallbackPayload) });
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
  try {
    const body = readJson(event);
    const visitorName = clean(body.visitor_name, 100);
    const visitorEmail = clean(body.visitor_email, 254).toLowerCase();
    const start = parseDate(body.start);
    const end = parseDate(body.end);
    if (!start || !end || !visitorEmail || !visitorName) return json(400, { error: "必須項目が未入力です（時間枠・お名前・メールアドレスをご確認ください）" });
    if (!EMAIL_RE.test(visitorEmail)) return json(400, { error: "メールアドレスの形式が正しくありません" });
    if (start >= end) return json(400, { error: "予約時間が正しくありません" });
    const now = new Date();
    const maxFuture = new Date(now);
    maxFuture.setMonth(maxFuture.getMonth() + 6);
    if (start < now || start > maxFuture) return json(400, { error: "予約できる期間外の日時です" });

    // owner_slug で予約ページ＋オーナーを解決（無ければ既定オーナー）。
    const slug = String(body.owner_slug || "").trim().toLowerCase();
    let owner = null;
    let bookingPage = null;
    if (slug && slug !== "demo") {
      const pages = await sb(`booking_pages?slug=${eq(slug)}&limit=1`).catch(() => []);
      bookingPage = pages[0] || null;
      if (bookingPage) owner = await findOwnerById(bookingPage.owner_id);
    }
    if (!owner) owner = await defaultOwner();
    if (!owner) return json(400, { error: "予約先が設定されていません。発行者がGoogleでログインしているかご確認ください" });
    const relationshipContext = parseRelationshipContext(body.filter_request);
    const birthDatePrivate = body.birth_date_private === "yes" || body.birth_date_private === true;
    const storedRelationshipContext = sanitizePrivateBirthDate(relationshipContext, birthDatePrivate);
    const bookingPayload = {
      owner_id: owner.id,
      booking_page_id: bookingPage?.id || null,
      visitor_name: visitorName,
      visitor_email: visitorEmail,
      guest_name: visitorName,
      guest_email: visitorEmail,
      topic: clean(body.topic, 2000),
      filter_request: storedRelationshipContext ? JSON.stringify(storedRelationshipContext) : clean(body.filter_request || "none", 12000),
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      location_type: clean(body.location_type || "google_meet", 40),
      status: "confirmed",
    };
    if (relationshipContext) {
      // visitor_birth_date は date 型。非公開や不正値（"非公開"等）は入れず null にする。
      // 公開かつ YYYY-MM-DD 形式のときだけ日付を保存。非公開の旨は filter_request(JSON) と private フラグに保持。
      const rawBirth = String(relationshipContext.birth_date || "");
      const validBirth = !birthDatePrivate && /^\d{4}-\d{2}-\d{2}$/.test(rawBirth) ? rawBirth : null;
      bookingPayload.visitor_birth_date = validBirth;
      bookingPayload.visitor_birth_date_private = birthDatePrivate;
      bookingPayload.birthday_message_opt_in = Boolean(relationshipContext.birthday_message_opt_in);
      bookingPayload.relationship_profile = relationshipContext.profile || {};
    }
    const rows = await createBooking(bookingPayload);
    const booking = rows[0];

    // 事前アンケート回答を保存（questionnaire_answers）。失敗してもブッキングは成立させる。
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (booking?.id && answers.length) {
      const answerRows = answers
        .map((answer) => ({
          booking_id: booking.id,
          question_id: answer.question_id || null,
          answer_text: clean(answer.answer_text, 2000),
        }))
        .filter((answer) => answer.answer_text);
      if (answerRows.length) {
        await sb("questionnaire_answers", { method: "POST", body: JSON.stringify(answerRows) }).catch(() => {});
      }
    }

    // カレンダー予定の説明文に「事前アンケート（質問と回答）」を載せる。
    const qa = answers
      .filter((a) => a && a.answer_text)
      .map((a) => `Q. ${clean(a.question_text, 200) || "質問"}\nA. ${clean(a.answer_text, 2000)}`)
      .join("\n\n");
    booking.calendar_description = [
      qa ? `【事前アンケート】\n${qa}` : (booking.topic ? `相談内容: ${booking.topic}` : ""),
      "— キマルで予約された面談です。",
    ].filter(Boolean).join("\n\n");

    const eventResult = await createCalendarEvent(owner.id, booking).catch((error) => ({ error: error.message }));
    if (eventResult?.id) {
      await sb(`bookings?id=eq.${booking.id}`, { method: "PATCH", body: JSON.stringify({ google_event_id: eventResult.id, meeting_url: eventResult.hangoutLink || "" }) });
    }

    // 予約完了メール（任意・非致命）。
    const meetingUrl = eventResult?.hangoutLink || booking.meeting_url || "";
    await sendBookingConfirmation({ to: visitorEmail, owner, booking, meetingUrl, locationValue: clean(body.location_value, 500) }).catch(() => {});

    return json(200, { ok: true, booking, google: eventResult });
  } catch (error) {
    return json(500, { error: "サーバーでエラーが発生しました。時間をおいて再度お試しください。" });
  }
};
