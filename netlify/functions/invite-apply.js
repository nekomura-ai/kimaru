const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");
const { optional } = require("./_lib/config");
const { verifyAdminSession } = require("./_lib/crypto");

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
  // 運営セッション（/operator-login で発行）があれば許可。
  if (verifyAdminSession(event)) return true;
  // 後方互換: 共有管理キーの Bearer / クエリ / body 直送も許可。
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
  if (!isCatKeyAdmin(event)) return json(401, { error: "認証が必要です" });
  const owners = await sb("owners?select=id,email,name,plan,invite_code,cat_key_disabled,cat_key_pending,created_at&order=created_at.desc&limit=200").catch(() =>
    sb("owners?select=id,email,name,plan,invite_code,cat_key_disabled,created_at&order=created_at.desc&limit=200"));
  const events = await sb("cat_key_events?select=id,owner_id,email,action,code,ip_address,user_agent,metadata,created_at&order=created_at.desc&limit=50").catch(() => []);
  return json(200, { owners, events });
}

async function updateOwnerCatKey(event) {
  const body = readJson(event);
  if (!isCatKeyAdmin(event, body)) return json(401, { error: "認証が必要です" });
  const ownerId = String(body.owner_id || "").trim();
  const action = String(body.action || "revoke");
  if (!ownerId) return json(400, { error: "owner_id が指定されていません" });
  if (!["revoke", "restore", "approve", "reject"].includes(action)) return json(400, { error: "操作が不正です" });
  const patchByAction = {
    approve: { plan: "pro", cat_key_pending: false, cat_key_disabled: false },
    reject: { cat_key_pending: false, invite_code: "" },
    restore: { cat_key_disabled: false },
    revoke: { plan: "free", invite_code: "", cat_key_disabled: true, cat_key_pending: false },
  };
  const patch = patchByAction[action];
  const rows = await sb(`owners?id=${eq(ownerId)}`, { method: "PATCH", body: JSON.stringify(patch) });
  await auditCatKey(event, { owner_id: ownerId, email: rows[0]?.email || "", action: `admin_${action}`, metadata: { source: "cat-key-admin" } });
  return json(200, { ok: true, owner: rows[0] });
}

exports.handler = async (event) => {
  try {
    if (event.queryStringParameters?.admin === "cat-key") {
      if (event.httpMethod === "GET") return listOwners(event);
      if (event.httpMethod === "POST") return updateOwnerCatKey(event);
      return json(405, { error: "許可されていない操作です" });
    }

    if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
    const owner = await requireOwner(event);
    if (owner.cat_key_disabled) {
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "blocked_apply" });
      return json(403, { error: "このアカウントではCat Keyを利用できません" });
    }
    const body = readJson(event);
    const code = String(body.code || "").trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "invalid_format", code });
      return json(400, { error: "招待コード（Cat Key）が正しくありません" });
    }
    if (!proCodes.has(code)) {
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "invalid_code", code });
      return json(400, { error: "招待コード（Cat Key）が正しくありません" });
    }
    // 承認制（決定 2026-06-03）: 即時付与せず「承認待ち」にする。運営がコンソールで承認するとproになる。
    try {
      const rows = await sb(`owners?id=${eq(owner.id)}`, { method: "PATCH", body: JSON.stringify({ cat_key_pending: true, invite_code: code }) });
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "apply_pending", code });
      return json(200, { ok: true, pending: true, owner: rows[0] });
    } catch (error) {
      // cat_key_pending 列が未マイグレーションの環境では従来どおり即時付与（運用を止めない）
      if (!String(error.message || "").includes("cat_key_pending")) throw error;
      const rows = await sb(`owners?id=${eq(owner.id)}`, { method: "PATCH", body: JSON.stringify({ plan: "pro", invite_code: code }) });
      await auditCatKey(event, { owner_id: owner.id, email: owner.email, action: "apply_success", code });
      return json(200, { ok: true, pending: false, owner: rows[0] });
    }
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
