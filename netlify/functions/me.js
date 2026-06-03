const { json } = require("./_lib/response");
const { currentOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

exports.handler = async (event) => {
  try {
    const owner = await currentOwner(event);
    let calendarConnected = false;
    if (owner) {
      try {
        const rows = await sb(`google_connections?owner_id=${eq(owner.id)}&select=id&limit=1`);
        calendarConnected = Boolean(rows[0]);
      } catch (_) {
        calendarConnected = false;
      }
    }
    return json(200, { owner, calendar_connected: calendarConnected });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
