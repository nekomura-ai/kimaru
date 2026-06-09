const { optional } = require("./config");

// メール送信の共通ヘルパ。優先順位: Gmail SMTP（アプリパスワード）→ Resend → 未設定ならスキップ。
// 当面は Gmail で無料運用し、有料顧客が増えたら独自ドメイン+Resend に移行する想定（env を入れるだけで切替）。

let _nodemailer = null;
function getNodemailer() {
  if (_nodemailer === null) {
    try { _nodemailer = require("nodemailer"); } catch (_) { _nodemailer = false; }
  }
  return _nodemailer || null;
}

// 未指定時の差出人/返信先（種別ごとの env が無ければ BOOKING → BIRTHDAY にフォールバック）。
function defaultFrom() {
  return optional("BOOKING_EMAIL_FROM", optional("BIRTHDAY_EMAIL_FROM", ""));
}
function defaultReplyTo() {
  return optional("BOOKING_EMAIL_REPLY_TO", optional("BIRTHDAY_EMAIL_REPLY_TO", ""));
}

// "キマル <x@y>" → "キマル"（表示名のみ抽出。無ければ "")
function displayName(from) {
  const m = String(from || "").match(/^\s*(.+?)\s*<[^>]+>\s*$/);
  return m ? m[1].trim() : "";
}

let _gmailTransport = null;
function gmailTransport() {
  const user = optional("GMAIL_USER", "");
  const pass = optional("GMAIL_APP_PASSWORD", "");
  if (!user || !pass) return null;
  const mod = getNodemailer();
  if (!mod) return null;
  if (!_gmailTransport) {
    _gmailTransport = mod.createTransport({ service: "gmail", auth: { user, pass } });
  }
  return _gmailTransport;
}

// Gmail SMTP で送信。差出人アドレスは認証アカウント（GMAIL_USER）固定、表示名のみ反映。
async function sendViaGmail({ to, subject, text, replyTo, fromName }) {
  const transport = gmailTransport();
  if (!transport) return null;
  const user = optional("GMAIL_USER", "");
  const from = fromName ? `${fromName} <${user}>` : user;
  const info = await transport.sendMail({ from, to, subject, text, ...(replyTo ? { replyTo } : {}) });
  return { id: info.messageId || "" };
}

// Resend HTTP API で送信。
async function sendViaResend({ to, subject, text, from, replyTo }) {
  const apiKey = optional("RESEND_API_KEY", "");
  if (!apiKey || !from) return null;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "メールの送信に失敗しました");
  return { id: data.id || "" };
}

// 共通送信。Gmail（設定あれば）→ Resend → スキップ。失敗は例外（呼び出し側は非致命で握りつぶす）。
async function sendMail({ to, subject, text, from, replyTo }) {
  if (!to) return { skipped: true };
  const fromAddr = from || defaultFrom();
  const reply = replyTo || defaultReplyTo();

  const viaGmail = await sendViaGmail({ to, subject, text, replyTo: reply, fromName: displayName(fromAddr) || "キマル" });
  if (viaGmail) return viaGmail;

  const viaResend = await sendViaResend({ to, subject, text, from: fromAddr, replyTo: reply });
  if (viaResend) return viaResend;

  return { skipped: true };
}

module.exports = { sendMail };
