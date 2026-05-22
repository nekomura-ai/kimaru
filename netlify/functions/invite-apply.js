const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

const proCodes = new Set(["JF7YAIN40EQL"]);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const owner = await requireOwner(event);
    const body = readJson(event);
    const code = String(body.code || "").trim().toUpperCase();
    if (!proCodes.has(code)) return json(400, { error: "Invalid invite code" });
    const rows = await sb(`owners?id=${eq(owner.id)}`, { method: "PATCH", body: JSON.stringify({ plan: "pro", invite_code: code }) });
    return json(200, { ok: true, owner: rows[0] });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
