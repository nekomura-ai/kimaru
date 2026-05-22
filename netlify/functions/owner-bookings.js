const { json } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

exports.handler = async (event) => {
  try {
    const owner = await requireOwner(event);
    const bookings = await sb(`bookings?owner_id=${eq(owner.id)}&order=start_at.desc&limit=50`);
    return json(200, { bookings });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
