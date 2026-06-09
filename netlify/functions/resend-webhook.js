const { json, readJson } = require("./_lib/response");
const { optional } = require("./_lib/config");
const { addEmailSuppression } = require("./_lib/supabase");

// Resend の配信イベント Webhook（決定13: 苦情率0.3%未満維持＋自動サプレッション）。
// bounce / complaint(spam) を受け取った宛先を配信停止リストに登録し、以後の営業メールを止める。
// RESEND_WEBHOOK_SECRET 設定時は x-kimaru-webhook-secret ヘッダの一致を要求（簡易検証）。

function header(event, name) {
  const headers = event.headers || {};
  return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "";
}

function extractEmail(data) {
  if (!data) return "";
  const candidate = data.email || data.recipient || (Array.isArray(data.to) ? data.to[0] : data.to) || "";
  return String(candidate || "").trim().toLowerCase();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });

  const secret = optional("RESEND_WEBHOOK_SECRET", "");
  if (secret) {
    const received = header(event, "x-kimaru-webhook-secret");
    if (received !== secret) return json(401, { error: "認証が必要です" });
  }

  try {
    const body = readJson(event);
    const type = String(body.type || body.event_type || "").toLowerCase();
    const email = extractEmail(body.data || body);

    let reason = "";
    if (/bounce/.test(type)) reason = "bounce";
    else if (/complain|spam/.test(type)) reason = "complaint";

    if (email && reason) {
      await addEmailSuppression(email, reason).catch(() => null);
    }
    return json(200, { ok: true, suppressed: Boolean(email && reason), reason: reason || null });
  } catch (error) {
    return json(200, { ok: true, suppressed: false });
  }
};
