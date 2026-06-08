const { required } = require("./config");

function headers() {
  const key = required("SUPABASE_SERVICE_ROLE_KEY");
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function sb(path, options = {}) {
  const url = `${required("SUPABASE_URL").replace(/\/$/, "")}/rest/v1/${path}`;
  const response = await fetch(url, { headers: { ...headers(), Prefer: "return=representation", ...(options.headers || {}) }, ...options });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.hint || "データの取得・保存に失敗しました");
  return data;
}

const eq = (value) => `eq.${encodeURIComponent(value)}`;

async function findOwnerByEmail(email) {
  const rows = await sb(`owners?email=${eq(email)}&limit=1`);
  return rows[0] || null;
}

async function findOwnerById(id) {
  const rows = await sb(`owners?id=${eq(id)}&limit=1`);
  return rows[0] || null;
}

async function defaultOwner() {
  const rows = await sb("owners?select=*&order=created_at.asc&limit=1");
  return rows[0] || null;
}

async function upsertOwner(profile) {
  const existing = await findOwnerByEmail(profile.email);
  if (existing) {
    const rows = await sb(`owners?id=${eq(existing.id)}`, { method: "PATCH", body: JSON.stringify(profile) });
    return rows[0];
  }
  const rows = await sb("owners", { method: "POST", body: JSON.stringify({ ...profile, plan: "free", slug: profile.slug || "demo" }) });
  return rows[0];
}

async function ensureDefaultBookingPage(owner) {
  const rows = await sb(`booking_pages?owner_id=${eq(owner.id)}&slug=${eq(owner.slug || "demo")}&limit=1`);
  if (rows[0]) return rows[0];
  const created = await sb("booking_pages", {
    method: "POST",
    body: JSON.stringify({ owner_id: owner.id, slug: owner.slug || "demo", title: "キマルでの面談", duration_minutes: 30, active: true }),
  });
  return created[0];
}

module.exports = { sb, eq, findOwnerByEmail, findOwnerById, defaultOwner, upsertOwner, ensureDefaultBookingPage };
