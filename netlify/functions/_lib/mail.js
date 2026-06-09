const { optional } = require("./config");

// Resend 経由のメール送信（予約系の共通ヘルパ）。
// RESEND_API_KEY と差出人(*_EMAIL_FROM) が未設定なら送信せずスキップ（dry-run 相当）。
async function sendMail({ to, subject, text }) {
  const apiKey = optional("RESEND_API_KEY", "");
  const from = optional("BOOKING_EMAIL_FROM", optional("BIRTHDAY_EMAIL_FROM", ""));
  const replyTo = optional("BOOKING_EMAIL_REPLY_TO", optional("BIRTHDAY_EMAIL_REPLY_TO", ""));
  if (!to || !apiKey || !from) return { skipped: true };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "メールの送信に失敗しました");
  return { id: data.id || "" };
}

module.exports = { sendMail };
