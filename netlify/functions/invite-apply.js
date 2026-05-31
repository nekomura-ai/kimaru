const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");
const { optional } = require("./_lib/config");

const proCodes = new Set([
  "JF7YAIN40EQL",
  "NEKO20240222",
]);
const CODE_RE = /^[A-Z0-9_-]{6,40}$/;

function clientIp(event) {
  const headers = event.headers || {};
  return String(headers["x-forwarded-for"] || headers["X-Forwarded-For"] || "").split(",")[0].trim();
}

function isCatKeyAdmin(event, body = {}) {
  const secret = optional("CAT_KEY_ADMIN_SECRET", optional("ADMIN_SECRET", ""));
  if (!secret) return false;
  const headers = event.headers || {};
  const authorization = headers.authorization || headers.Authorization || "";
  const querySecret = event.queryStringParameters?.secret || "";
  return authorization === `Bearer ${secret}` || querySecret === secret || body.secret === secret;
}

async function auditCatKey(event, payload) {
  try {
    await sb("cat_key_events", {
      method: "POST",
      body: JSON.stringify({
        owner_id: payload.owner_id || null,
        email: payload.email || "",
        action: payload.action,
        code: payload.code || "",
        ip_address: clientIp(event),
        user_agent: String(event.headers?.["user-agent"] || event.headers?.["User-Agent"] || "").slice(0, 300),
        metadata: payload.metadata || {},
      }),
    });
  } catch (_) {
    // Audit logging should not block the user flow if the migration has not run yet.
  }
}

async function listOwners(event) {
  if (!isCatKeyAdmin(event)) return json(401, { error: "Unauthorized" });
  const owners = await sb("owners?select=id,email,name,plan,invite_code,cat_key_disabled,created_at&order=created_at.desc&limit=200");
  return json(200, { owners });
}

async function updateOwnerCatKey(event) {
  const body = readJson(event);
  if (!isCatKeyAdmin(event, body)) return json(401, { error: "Unauthorized" });
  const ownerId = String(body.owner_id || "").trim();
  const action = String(body.action || "revoke");
  if (!ownerId) return json(400, { error: "Missing owner_id" });
  if (!["revoke", "restore"].includes(action)) return json(400, { error: "Invalid action" });
  const patch = action === "restore"
    ? { cat_key_disabled: false }
    : { plan: "free", invite_code: "", cat_key_disabled: true };
  const rows = await sb(`owners?id=${eq(ownerId)}`, { method: "PATCH", body: JSON.stringify(patch) });
  await auditCatKey(event, { owner_id: ownerId, email: rows[0]?.email || "", action: `admin_${action}`, metadata: { source: "cat-key-admin" } });
  return json(200, { ok: true, owner: rows[0] });
}

exports.handler = async (event) => {
  try {
    if (event.queryStringParameters?.admin === "cat-key") {
      if (event.httpMethod === "GET") return listOwners(event);
      if (event.httpMethod === "POST") return updateOwnerCatKey(event);
      return json(405, { error: "Method not allowed" });
    }

    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
    const owner = await requireOwner(event);
    if (owner.cat_key_disabled) {
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "blocked_apply" });
      return json(403, { error: "Cat Key is disabled for this account." });
    }
    const body = readJson(event);
    const code = String(body.code || "").trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "invalid_format", code });
      return json(400, { error: "Invalid invite code" });
    }
    if (!proCodes.has(code)) {
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "invalid_code", code });
      return json(400, { error: "Invalid invite code" });
    }
    const rows = await sb(`owners?id=${eq(owner.id)}`, { method: "PATCH", body: JSON.stringify({ plan: "pro", invite_code: code }) });
    await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "apply_success", code });
    return json(200, { ok: true, owner: rows[0] });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
