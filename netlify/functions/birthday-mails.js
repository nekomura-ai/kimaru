const { json } = require("./_lib/response");
const { optional } = require("./_lib/config");
const { sb, eq } = require("./_lib/supabase");

function todayInTokyo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function monthDay(dateString) {
  if (!dateString) return "";
  const parts = String(dateString).split("-");
  if (parts.length < 3) return "";
  return `${parts[1]}-${parts[2]}`;
}

function parseRelationshipContext(value) {
  if (!value || value === "none") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed?.kind === "relationship_context" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function getBirthdayData(booking) {
  const context = parseRelationshipContext(booking.filter_request);
  const birthDate = booking.visitor_birth_date || context?.birth_date || "";
  const optIn = Boolean(booking.birthday_message_opt_in || context?.birthday_message_opt_in);
  const profile = Object.keys(booking.relationship_profile || {}).length ? booking.relationship_profile : context?.profile || {};
  return { birthDate, optIn, profile };
}

function buildMessage(booking, profile) {
  const name = booking.visitor_name || booking.guest_name || "";
  const displayName = name ? `${name}さん` : "こんにちは";
  const text = profile?.birthday_message || `${displayName}、お誕生日おめでとうございます。新しい一年が、挑戦したいことに一歩近づく時間になりますように。`;
  return {
    subject: `${displayName}へ、お誕生日おめでとうございます`,
    text,
  };
}

function isAuthorized(event) {
  const secret = optional("BIRTHDAY_CRON_SECRET", optional("CRON_SECRET", ""));
  if (!secret) return true;
  const headers = event.headers || {};
  const authorization = headers.authorization || headers.Authorization || "";
  const querySecret = event.queryStringParameters?.secret || "";
  return authorization === `Bearer ${secret}` || querySecret === secret;
}

async function getProOwnerIds() {
  try {
    const rows = await sb("owners?select=id,plan&plan=eq.pro&limit=10000");
    return new Set((rows || []).map((owner) => owner.id).filter(Boolean));
  } catch (_) {
    return new Set();
  }
}

async function alreadyDelivered(bookingId, deliveryDate) {
  try {
    const rows = await sb(`birthday_message_deliveries?booking_id=${eq(bookingId)}&delivery_date=${eq(deliveryDate)}&limit=1`);
    return Boolean(rows[0]);
  } catch (_) {
    return false;
  }
}

async function markDelivered(bookingId, deliveryDate, providerMessageId, status, errorMessage = "") {
  try {
    await sb("birthday_message_deliveries", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId, delivery_date: deliveryDate, provider_message_id: providerMessageId || "", status, error_message: errorMessage }),
    });
  } catch (_) {
    // Keep the birthday job non-fatal if the optional delivery table has not been applied yet.
  }
}

async function sendViaResend({ to, subject, text }) {
  const apiKey = optional("RESEND_API_KEY", "");
  const from = optional("BIRTHDAY_EMAIL_FROM", "");
  const replyTo = optional("BIRTHDAY_EMAIL_REPLY_TO", "");
  if (!apiKey || !from) return { skipped: true, reason: "Missing RESEND_API_KEY or BIRTHDAY_EMAIL_FROM" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "Birthday email send failed");
  return { id: data.id || "" };
}

exports.handler = async (event) => {
  if (!["GET", "POST"].includes(event.httpMethod)) return json(405, { error: "Method not allowed" });
  if (!isAuthorized(event)) return json(401, { error: "Unauthorized" });

  const today = todayInTokyo();
  const todayMonthDay = monthDay(today);
  const dryRun = event.queryStringParameters?.dry_run === "1" || event.queryStringParameters?.dry_run === "true";

  try {
    const [bookings, proOwnerIds] = await Promise.all([
      sb("bookings?select=*&status=eq.confirmed&order=created_at.desc&limit=1000"),
      getProOwnerIds(),
    ]);
    const due = [];
    for (const booking of bookings || []) {
      if (!proOwnerIds.has(booking.owner_id || booking.user_id)) continue;
      const { birthDate, optIn, profile } = getBirthdayData(booking);
      if (!optIn || monthDay(birthDate) !== todayMonthDay) continue;
      const message = buildMessage(booking, profile);
      due.push({ booking, birthDate, profile, message });
    }

    const results = [];
    for (const item of due) {
      const booking = item.booking;
      const to = booking.visitor_email || booking.guest_email || "";
      if (!to) {
        results.push({ booking_id: booking.id, status: "skipped", reason: "Missing visitor email" });
        continue;
      }
      if (await alreadyDelivered(booking.id, today)) {
        results.push({ booking_id: booking.id, to, status: "skipped", reason: "Already delivered today" });
        continue;
      }
      if (dryRun) {
        results.push({ booking_id: booking.id, to, status: "dry_run", subject: item.message.subject, text: item.message.text });
        continue;
      }
      try {
        const sent = await sendViaResend({ to, ...item.message });
        if (sent.skipped) {
          results.push({ booking_id: booking.id, to, status: "dry_run", reason: sent.reason, subject: item.message.subject, text: item.message.text });
          continue;
        }
        await markDelivered(booking.id, today, sent.id, "sent");
        results.push({ booking_id: booking.id, to, status: "sent", provider_message_id: sent.id });
      } catch (error) {
        await markDelivered(booking.id, today, "", "failed", error.message);
        results.push({ booking_id: booking.id, to, status: "failed", error: error.message });
      }
    }

    return json(200, { ok: true, date: today, pro_owner_count: proOwnerIds.size, due_count: due.length, results });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
