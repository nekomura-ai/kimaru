const { json, readJson } = require("./_lib/response");
const { findOwnerByEmail } = require("./_lib/supabase");
const { sessionCookie, verifyPassword } = require("./_lib/crypto");

// メール+パスワードでログイン（決定3）。
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = readJson(event);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return json(400, { error: "メールアドレスとパスワードを入力してください" });

    const owner = await findOwnerByEmail(email);
    if (!owner || !owner.password_hash || !verifyPassword(password, owner.password_hash)) {
      return json(401, { error: "メールアドレスまたはパスワードが違います" });
    }
    return json(200, { ok: true, owner: { id: owner.id, email: owner.email, name: owner.name, plan: owner.plan } }, { "Set-Cookie": sessionCookie(owner.id) });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
