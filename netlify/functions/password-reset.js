const { json, readJson } = require("./_lib/response");
const { sb, eq } = require("./_lib/supabase");
const { verifyTimedToken, hashPassword } = require("./_lib/crypto");

const ONE_HOUR = 60 * 60 * 1000;

// パスワード再設定の実行（#72）。署名トークン（1時間有効）を検証して password_hash を更新。
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
  try {
    const body = readJson(event);
    const id = String(body.id || "").trim();
    const ts = String(body.ts || "").trim();
    const token = String(body.t || body.token || "");
    const password = String(body.password || "");
    if (!verifyTimedToken("pwreset", id, ts, token, ONE_HOUR)) {
      return json(400, { error: "リンクが無効か期限切れです。お手数ですが、もう一度お申し込みください。" });
    }
    if (password.length < 8) return json(400, { error: "パスワードは8文字以上にしてください" });
    await sb(`owners?id=${eq(id)}`, { method: "PATCH", body: JSON.stringify({ password_hash: hashPassword(password) }) });
    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.statusCode ? error.message : "サーバーでエラーが発生しました。時間をおいて再度お試しください。" });
  }
};
