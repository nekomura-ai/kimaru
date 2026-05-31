const { json, readJson } = require("./_lib/response");
const { optional } = require("./_lib/config");
const { sb, eq, findOwnerByEmail } = require("./_lib/supabase");

function header(event, name) {
  const headers = event.headers || {};
  return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "";
}

function eventId(body) {
  return body.event_id || body.id || body.data?.id || body.data?.object?.payment?.id || "";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const secret = optional("SQUARE_WEBHOOK_SHARED_SECRET");
  if (!secret) return json(503, { error: "Square webhook is not configured" });
  const received = header(event, "x-kimaru-webhook-secret");
  if (received !== secret) return json(401, { error: "Unauthorized" });

  try {
    const body = readJson(event);
    const eventType = String(body.type || body.event_type || "");
    const email = String(
      body.email ||
      body.data?.object?.payment?.buyer_email_address ||
      body.data?.object?.subscription?.customer_email ||
      ""
    ).trim().toLowerCase();
    const shouldGrantPro = /payment|subscription/i.test(eventType) && email;
    const owner = email ? await findOwnerByEmail(email) : null;

    if (shouldGrantPro && owner) {
      await sb(`owners?id=${eq(owner.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ plan: "pro", updated_at: new Date().toISOString() }),
      });
    }

    await sb("payment_events", {
      method: "POST",
      body: JSON.stringify({
        owner_id: owner?.id || null,
        provider: "square",
        provider_event_id: eventId(body),
        event_type: eventType,
        raw_payload: body,
      }),
    }).catch(() => null);

    return json(200, { ok: true, pro_granted: Boolean(shouldGrantPro && owner) });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
