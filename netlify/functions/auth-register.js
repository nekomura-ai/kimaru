const { json, readJson } = require("./_lib/response");
const { sb, eq, findOwnerByEmail } = require("./_lib/supabase");
const { sessionCookie, hashPassword } = require("./_lib/crypto");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max = 254) {
  return String(value || "").trim().slice(0, max);
}

function makeSlug(email) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24) || "user";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

// メール+パスワードでアカウント登録（決定3）。ログインとカレンダー連携は分離（[features/25]）。
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const body = readJson(event);
    const name = clean(body.name, 100);
    const email = clean(body.email).toLowerCase();
    const password = String(body.password || "");
    if (!email || !EMAIL_RE.test(email)) return json(400, { error: "メールアドレスの形式が正しくありません" });
    if (password.length < 8) return json(400, { error: "パスワードは8文字以上にしてください" });

    const existing = await findOwnerByEmail(email);
    if (existing && existing.password_hash) return json(409, { error: "このメールアドレスは既に登録済みです" });

    const passwordHash = hashPassword(password);
    let owner;
    if (existing) {
      // Google等で作成済みのアカウントにパスワードを設定（ログイン方式の追加）
      const rows = await sb(`owners?id=${eq(existing.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ password_hash: passwordHash, name: name || existing.name }),
      });
      owner = rows[0];
    } else {
      const rows = await sb("owners", {
        method: "POST",
        body: JSON.stringify({ email, name, plan: "free", slug: makeSlug(email), password_hash: passwordHash }),
      });
      owner = rows[0];
    }
    return json(200, { ok: true, owner: { id: owner.id, email: owner.email, name: owner.name, plan: owner.plan } }, { "Set-Cookie": sessionCookie(owner.id) });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
