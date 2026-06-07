const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

const FIELDS = [
  "profile_name",
  "profile_email",
  "profile_title",
  "profile_strengths",
  "profile_style",
  "profile_offer",
  "profile_values",
  "profile_goal",
];

function cleanProfile(input) {
  const out = {};
  FIELDS.forEach((field) => {
    if (input[field] != null) out[field] = String(input[field]).slice(0, 4000);
  });
  return out;
}

function safeParse(text) {
  try {
    const parsed = JSON.parse(text || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

async function findProfile(ownerId) {
  const rows = await sb(`profiles?owner_id=${eq(ownerId)}&limit=1`);
  return rows[0] || null;
}

async function upsert(payload, existing) {
  if (existing) {
    return sb(`profiles?id=${eq(existing.id)}`, { method: "PATCH", body: JSON.stringify(payload) });
  }
  return sb("profiles", { method: "POST", body: JSON.stringify(payload) });
}

exports.handler = async (event) => {
  try {
    const owner = await requireOwner(event);

    if (event.httpMethod === "GET") {
      const row = await findProfile(owner.id);
      const profile = row ? (row.data && Object.keys(row.data).length ? row.data : safeParse(row.bio)) : {};
      return json(200, { profile });
    }

    if (event.httpMethod === "POST") {
      const data = cleanProfile(readJson(event));
      const existing = await findProfile(owner.id);
      const base = { owner_id: owner.id, display_name: data.profile_name || owner.name || "" };
      try {
        const saved = await upsert({ ...base, data }, existing);
        return json(200, { ok: true, profile: saved[0]?.data || data });
      } catch (error) {
        // `data` 列が未マイグレーションの環境向けフォールバック（bio に JSON 保存）
        if (!String(error.message || "").includes("data")) throw error;
        await upsert({ ...base, bio: JSON.stringify(data) }, existing);
        return json(200, { ok: true, profile: data });
      }
    }

    return json(405, { error: "許可されていない操作です" });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
