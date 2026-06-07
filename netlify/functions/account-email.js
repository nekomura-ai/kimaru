const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq, findOwnerByEmail } = require("./_lib/supabase");
const { verifyPassword } = require("./_lib/crypto");

// メールアドレス変更。メール+パスワード登録ユーザーのみ（現パスワードで本人確認）。
// Google ログインのユーザー（password_hash 無し）はメールが Google 側管理のため不可。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
  try {
    const owner = await requireOwner(event);
    if (!owner.password_hash) {
      return json(403, { error: "Googleログインのアカウントはメールアドレスを変更できません（Google側で管理されています）。" });
    }
    const body = readJson(event);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!EMAIL_RE.test(email)) return json(400, { error: "メールアドレスの形式が正しくありません" });
    if (!verifyPassword(password, owner.password_hash)) return json(401, { error: "現在のパスワードが正しくありません" });
    if (email === String(owner.email || "").toLowerCase()) return json(400, { error: "現在のメールアドレスと同じです" });
    const existing = await findOwnerByEmail(email);
    if (existing && existing.id !== owner.id) return json(409, { error: "このメールアドレスは既に使われています" });
    const rows = await sb(`owners?id=${eq(owner.id)}`, { method: "PATCH", body: JSON.stringify({ email }) });
    return json(200, { ok: true, email: rows[0]?.email || email });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.statusCode ? error.message : "サーバーでエラーが発生しました。時間をおいて再度お試しください。" });
  }
};
