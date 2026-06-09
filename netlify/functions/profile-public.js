const { json } = require("./_lib/response");
const { sb, eq } = require("./_lib/supabase");

// 公開プロフィール取得（#176）。認証不要・誰でも閲覧可。owner の slug で引く。
// profile_public === 'off' の場合のみ非公開。公開する項目はホワイトリストで限定（goal/email等の内部情報は出さない）。
const PUBLIC_FIELDS = [
  "profile_name",
  "profile_title",
  "profile_headline",
  "profile_bio_rich",
  "profile_accent_color",
  "profile_strengths",
  "profile_offer",
  "profile_values",
  "profile_links",
];

function safeParse(text) {
  try {
    const parsed = JSON.parse(text || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "許可されていない操作です" });
  const q = event.queryStringParameters || {};
  const slug = String(q.slug || q.u || "").trim().toLowerCase();
  if (!slug) return json(400, { error: "プロフィールが指定されていません" });
  try {
    const owners = await sb(`owners?slug=${eq(slug)}&select=id,name,slug&limit=1`);
    const owner = owners[0];
    if (!owner) return json(404, { error: "プロフィールが見つかりません" });
    const rows = await sb(`profiles?owner_id=${eq(owner.id)}&limit=1`);
    const row = rows[0] || {};
    const data = row.data && typeof row.data === "object" && Object.keys(row.data).length ? row.data : safeParse(row.bio);
    if (data.profile_public === "off") return json(404, { error: "このプロフィールは非公開です" });
    const profile = {};
    PUBLIC_FIELDS.forEach((f) => { if (data[f] != null && data[f] !== "") profile[f] = data[f]; });
    if (!profile.profile_name) profile.profile_name = owner.name || "";
    return json(200, { profile, slug: owner.slug });
  } catch (error) {
    return json(500, { error: "サーバーでエラーが発生しました。時間をおいて再度お試しください。" });
  }
};
