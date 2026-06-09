const { json } = require("./_lib/response");
const { sb, eq } = require("./_lib/supabase");
const { verifyTimedToken } = require("./_lib/crypto");

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function htmlPage(status, title, message) {
  return {
    statusCode: status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    body: `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>`
      + `<body style="font-family:system-ui,sans-serif;max-width:520px;margin:48px auto;padding:0 16px;line-height:1.8;color:#1f2430">`
      + `<h1 style="font-size:20px">${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a href="/dashboard.html">キマルを開く</a></p></body></html>`,
  };
}

// メール確認（#73）。署名トークン（7日有効）を検証して owners.email_verified を立てる。確認は任意・非ブロッキング。
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "許可されていない操作です" });
  const p = event.queryStringParameters || {};
  const id = String(p.id || "").trim();
  const ts = String(p.ts || "").trim();
  const token = String(p.t || "");
  if (!verifyTimedToken("emailverify", id, ts, token, SEVEN_DAYS)) {
    return htmlPage(400, "リンクが無効です", "確認リンクが無効か期限切れです。再度お試しください。");
  }
  await sb(`owners?id=${eq(id)}`, { method: "PATCH", body: JSON.stringify({ email_verified: true }) }).catch(() => null);
  return htmlPage(200, "メールアドレスを確認しました", "ご登録ありがとうございます。メールアドレスの確認が完了しました。");
};
