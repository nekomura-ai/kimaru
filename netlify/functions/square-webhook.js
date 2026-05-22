const { json, readJson } = require("./_lib/response");
const { optional } = require("./_lib/config");
const { sb, eq } = require("./_lib/supabase");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const secret = optional("SQUARE_WEBHOOK_SHARED_SECRET");
  if (secret && event.headers["x-kimaru-webhook-secret"] !== secret) return json(401, { error: "Unauthorized" });
  try {
    const body = readJson(event);
    const email = body.email || body.data?.object?.payment?.buyer_email_address;
    if (email) {
      await sb(`owners?email=${eq(email)}`, { method: "PATCH", body: JSON.stringify({ plan: "pro" }) });
    }
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
