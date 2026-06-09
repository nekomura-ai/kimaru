const { json } = require("./_lib/response");
const { verifyMailUnsubToken } = require("./_lib/crypto");
const { addEmailSuppression } = require("./_lib/supabase");

// 営業メールの配信停止エンドポイント（決定13）。
// - GET  : メール本文のリンク（?e=&t=）。トークン検証→サプレッション登録→確認HTML。
// - POST : RFC 8058 ワンクリック解除（メールクライアントの自動POST）。同じく登録して 200。
// 取引メール（予約確認・リマインダー）は対象外で、引き続き届く。

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlPage(status, title, message) {
  return {
    statusCode: status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    body: `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>`
      + `<body style="font-family:system-ui,sans-serif;max-width:520px;margin:48px auto;padding:0 16px;line-height:1.8;color:#1f2430">`
      + `<h1 style="font-size:20px">${escapeHtml(title)}</h1><p>${message}</p></body></html>`,
  };
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const email = String(params.e || "").trim().toLowerCase();
  const token = String(params.t || "");
  const valid = Boolean(email) && verifyMailUnsubToken(email, token);

  if (event.httpMethod === "POST") {
    if (!valid) return json(400, { error: "リンクが無効です" });
    await addEmailSuppression(email, "unsubscribe").catch(() => null);
    return json(200, { ok: true });
  }

  if (event.httpMethod === "GET") {
    if (!valid) {
      return htmlPage(400, "リンクが無効です", "お手数ですが、メール本文の配信停止リンクをもう一度お試しください。");
    }
    await addEmailSuppression(email, "unsubscribe").catch(() => null);
    return htmlPage(
      200,
      "配信を停止しました",
      `${escapeHtml(email)} 宛ての案内メールの配信を停止しました。<br>予約確認・リマインダーなどの大切なお知らせは引き続きお届けします。`,
    );
  }

  return json(405, { error: "許可されていない操作です" });
};
