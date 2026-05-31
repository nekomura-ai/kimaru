const { json, readJson } = require("./_lib/response");
const { sb } = require("./_lib/supabase");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGE_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = readJson(event);
    const name = clean(body.name, 100);
    const email = clean(body.email, 254).toLowerCase();
    const language = clean(body.language || "ja", 20);
    if (!name || !email) return json(400, { error: "Name and email are required" });
    if (!EMAIL_RE.test(email)) return json(400, { error: "Invalid email address" });
    if (!LANGUAGE_RE.test(language)) return json(400, { error: "Invalid language" });

    const rows = await sb("free_signups", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        purpose: clean(body.purpose, 2000),
        invite_code: clean(body.invite_code, 80),
        language,
      }),
    });
    return json(200, { ok: true, signup: rows[0] });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
