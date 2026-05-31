const { json } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

function hidePrivateBirthDate(booking) {
  if (!booking.visitor_birth_date_private) return booking;
  const sanitized = { ...booking, visitor_birth_date: null };
  if (!sanitized.filter_request || sanitized.filter_request === "none") return sanitized;
  try {
    const context = JSON.parse(sanitized.filter_request);
    if (context?.kind === "relationship_context") {
      sanitized.filter_request = JSON.stringify({ ...context, birth_date: "非公開", birth_date_private: true });
    }
  } catch (_) {
    // Keep the original text if old data is not JSON.
  }
  return sanitized;
}

exports.handler = async (event) => {
  try {
    const owner = await requireOwner(event);
    const bookings = await sb(`bookings?owner_id=${eq(owner.id)}&order=start_at.desc&limit=50`);
    return json(200, { bookings: (bookings || []).map(hidePrivateBirthDate) });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
