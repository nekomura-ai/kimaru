const { json, readJson } = require("./_lib/response");
const { sb } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = readJson(event);
    if (!body.email || !body.name) return json(400, { error: "Name and email are required" });
    const rows = await sb("free_signups", {
      method: "POST",
      body: JSON.stringify({ name: body.name, email: body.email, purpose: body.purpose || "" }),
    });
    return json(200, { ok: true, signup: rows[0] });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
