const { json } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

// Google カレンダー連携を解除（トークン削除）。ログインとは独立した「連携解除」。
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const owner = await requireOwner(event);
    await sb(`google_connections?owner_id=${eq(owner.id)}`, { method: "DELETE" }).catch(() => {});
    await sb(`google_calendar_tokens?owner_id=${eq(owner.id)}`, { method: "DELETE" }).catch(() => {});
    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
