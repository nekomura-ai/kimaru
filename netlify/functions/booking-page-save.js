const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

const allowedDurations = new Set([30, 45, 60]);
const allowedBuffers = new Set([0, 15, 30]);
const allowedRanges = new Set([1, 3, 6]);
const allowedLocationTypes = new Set(["in_person", "google_meet", "zoom", "phone", "custom_url", "later"]);

function intValue(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeQuestion(question, index) {
  return {
    question_text: String(question.question_text || "").trim(),
    is_required: Boolean(question.is_required),
    sort_order: index + 1,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const owner = await requireOwner(event);
    const body = readJson(event);
    const isPro = owner.plan === "pro";

    const duration = intValue(body.duration_minutes, 30);
    const bufferBefore = intValue(body.buffer_before_minutes, 0);
    const bufferAfter = intValue(body.buffer_after_minutes, 0);
    const requestedRange = intValue(body.booking_range_months, 3);
    const bookingRange = isPro ? requestedRange : Math.min(requestedRange, 3);
    const locationType = allowedLocationTypes.has(body.location_type) ? body.location_type : "google_meet";
    const questions = Array.isArray(body.questions) ? body.questions.map(normalizeQuestion).filter((q) => q.question_text) : [];
    const questionLimit = isPro ? 5 : 2;

    if (!allowedDurations.has(duration)) return json(400, { error: "Duration must be 30, 45, or 60 minutes" });
    if (!allowedBuffers.has(bufferBefore) || !allowedBuffers.has(bufferAfter)) return json(400, { error: "Buffer must be 0, 15, or 30 minutes" });
    if (!allowedRanges.has(requestedRange)) return json(400, { error: "Booking range must be 1, 3, or 6 months" });
    if (!isPro && requestedRange > 3) return json(403, { error: "Free plan can publish up to 3 months ahead" });
    if (questions.length > questionLimit) return json(403, { error: `Your plan supports up to ${questionLimit} questionnaire questions` });

    const payload = {
      owner_id: owner.id,
      slug: owner.slug || "demo",
      title: String(body.title || "Kimaru meeting").trim(),
      description: String(body.description || "").trim(),
      duration_minutes: duration,
      buffer_before_minutes: bufferBefore,
      buffer_after_minutes: bufferAfter,
      booking_range_months: bookingRange,
      location_type: locationType,
      location_value: String(body.location_value || "").trim(),
      active: body.is_active !== false,
      is_active: body.is_active !== false,
    };

    const existing = await sb(`booking_pages?owner_id=${eq(owner.id)}&slug=${eq(payload.slug)}&limit=1`);
    const saved = existing[0]
      ? await sb(`booking_pages?id=${eq(existing[0].id)}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await sb("booking_pages", { method: "POST", body: JSON.stringify(payload) });
    const bookingPage = saved[0];

    await sb(`questionnaire_questions?booking_page_id=${eq(bookingPage.id)}`, { method: "DELETE" });
    if (questions.length) {
      await sb("questionnaire_questions", {
        method: "POST",
        body: JSON.stringify(questions.map((question) => ({ ...question, booking_page_id: bookingPage.id }))),
      });
    }

    return json(200, { ok: true, booking_page: bookingPage, question_limit: questionLimit });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
