const { json, readJson } = require("./_lib/response");
const { sb, defaultOwner } = require("./_lib/supabase");
const { createCalendarEvent } = require("./_lib/google");

function parseRelationshipContext(value) {
  if (!value || value === "none") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed?.kind === "relationship_context" ? parsed : null;
  } catch (_) {
    return null;
  }
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
    if (!body.start || !body.end || !body.visitor_email || !body.visitor_name) return json(400, { error: "Missing booking fields" });
    const owner = await defaultOwner();
    if (!owner) return json(400, { error: "Owner is not set. Please login with Google first." });
    const relationshipContext = parseRelationshipContext(body.filter_request);
    const bookingPayload = {
      owner_id: owner.id,
      visitor_name: body.visitor_name,
      visitor_email: body.visitor_email,
      guest_name: body.visitor_name,
      guest_email: body.visitor_email,
      topic: body.topic || "",
      filter_request: body.filter_request || "none",
      start_at: body.start,
      end_at: body.end,
      start_time: body.start,
      end_time: body.end,
      location_type: body.location_type || "google_meet",
      status: "confirmed",
    };
    if (relationshipContext) {
      bookingPayload.visitor_birth_date = relationshipContext.birth_date || null;
      bookingPayload.visitor_birth_date_private = body.birth_date_private === "yes" || body.birth_date_private === true;
      bookingPayload.birthday_message_opt_in = Boolean(relationshipContext.birthday_message_opt_in);
      bookingPayload.relationship_profile = relationshipContext.profile || {};
    }
    const rows = await createBooking(bookingPayload);
    const booking = rows[0];
    const eventResult = await createCalendarEvent(owner.id, booking).catch((error) => ({ error: error.message }));
    if (eventResult?.id) {
      await sb(`bookings?id=eq.${booking.id}`, { method: "PATCH", body: JSON.stringify({ google_event_id: eventResult.id, meeting_url: eventResult.hangoutLink || "" }) });
    }
    return json(200, { ok: true, booking, google: eventResult });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
