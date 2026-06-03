const { json, readJson } = require("./_lib/response");
const { sb, defaultOwner } = require("./_lib/supabase");
const { createCalendarEvent } = require("./_lib/google");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = readJson(event);
    const visitorName = clean(body.visitor_name, 100);
    const visitorEmail = clean(body.visitor_email, 254).toLowerCase();
    const start = parseDate(body.start);
    const end = parseDate(body.end);
    if (!start || !end || !visitorEmail || !visitorName) return json(400, { error: "Missing booking fields" });
    if (!EMAIL_RE.test(visitorEmail)) return json(400, { error: "Invalid email address" });
    if (start >= end) return json(400, { error: "Invalid booking time" });
    const now = new Date();
    const maxFuture = new Date(now);
    maxFuture.setMonth(maxFuture.getMonth() + 6);
    if (start < now || start > maxFuture) return json(400, { error: "Booking time is outside the allowed range" });

    const owner = await defaultOwner();
    if (!owner) return json(400, { error: "Owner is not set. Please login with Google first." });
    const relationshipContext = parseRelationshipContext(body.filter_request);
    const birthDatePrivate = body.birth_date_private === "yes" || body.birth_date_private === true;
    const storedRelationshipContext = sanitizePrivateBirthDate(relationshipContext, birthDatePrivate);
    const bookingPayload = {
      owner_id: owner.id,
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
      bookingPayload.visitor_birth_date = relationshipContext.birth_date || null;
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

    const eventResult = await createCalendarEvent(owner.id, booking).catch((error) => ({ error: error.message }));
    if (eventResult?.id) {
      await sb(`bookings?id=eq.${booking.id}`, { method: "PATCH", body: JSON.stringify({ google_event_id: eventResult.id, meeting_url: eventResult.hangoutLink || "" }) });
    }
    return json(200, { ok: true, booking, google: eventResult });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
