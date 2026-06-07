const { json, readJson } = require("./_lib/response");
const { requireProOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

exports.handler = async (event) => {
  try {
    const owner = await requireProOwner(event);
    if (event.httpMethod === "GET") {
      const logs = await sb(`appointment_logs?owner_id=${eq(owner.id)}&order=created_at.desc&limit=50`);
      return json(200, { logs });
    }
    if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
    const body = readJson(event);
    if (!body.visitor_email || !body.notes) return json(400, { error: "相手のメールアドレスとメモは必須です" });
    const rows = await sb("appointment_logs", {
      method: "POST",
      body: JSON.stringify({ owner_id: owner.id, visitor_email: body.visitor_email, notes: body.notes, keywords: body.keywords || "", next_action: body.next_action || "" }),
    });
    return json(200, { ok: true, log: rows[0] });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
