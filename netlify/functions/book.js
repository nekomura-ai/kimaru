const { json, readJson } = require("./_lib/response");
const { sb, defaultOwner } = require("./_lib/supabase");
const { createCalendarEvent } = require("./_lib/google");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = readJson(event);
    if (!body.start || !body.end || !body.visitor_email || !body.visitor_name) return json(400, { error: "Missing booking fields" });
    const owner = await defaultOwner();
    if (!owner) return json(400, { error: "Owner is not set. Please login with Google first." });
    const rows = await sb("bookings", {
      method: "POST",
      body: JSON.stringify({
        owner_id: owner.id,
        visitor_name: body.visitor_name,
        visitor_email: body.visitor_email,
        topic: body.topic || "",
        filter_request: body.filter_request || "none",
        start_at: body.start,
        end_at: body.end,
        status: "confirmed",
      }),
    });
    const booking = rows[0];
    const eventResult = await createCalendarEvent(owner.id, booking).catch((error) => ({ error: error.message }));
    if (eventResult?.id) {
      await sb(`bookings?id=eq.${booking.id}`, { method: "PATCH", body: JSON.stringify({ google_event_id: eventResult.id }) });
    }
    return json(200, { ok: true, booking, google: eventResult });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
