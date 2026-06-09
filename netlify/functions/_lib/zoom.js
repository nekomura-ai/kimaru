const { optional } = require("./config");

// Zoom ミーティングの自動発行（#23）。Server-to-Server OAuth（account_credentials）を fetch で利用。
// 認証情報（ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET）未設定なら無効（null を返す）。

function isConfigured() {
  return Boolean(optional("ZOOM_ACCOUNT_ID", "") && optional("ZOOM_CLIENT_ID", "") && optional("ZOOM_CLIENT_SECRET", ""));
}

async function accessToken() {
  const accountId = optional("ZOOM_ACCOUNT_ID", "");
  const clientId = optional("ZOOM_CLIENT_ID", "");
  const clientSecret = optional("ZOOM_CLIENT_SECRET", "");
  if (!accountId || !clientId || !clientSecret) return null;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.reason || data.error || "Zoom認証に失敗しました");
  return data.access_token || null;
}

// 予約に対応する Zoom ミーティングを作成し join_url を返す。未設定なら null。
async function createMeeting({ topic, startIso, durationMinutes }) {
  if (!isConfigured()) return null;
  const token = await accessToken();
  if (!token) return null;
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: topic || "面談",
      type: 2, // scheduled meeting
      start_time: startIso,
      duration: durationMinutes || 30,
      timezone: "Asia/Tokyo",
      settings: { join_before_host: true, waiting_room: false },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Zoomミーティングの作成に失敗しました");
  return { id: data.id, joinUrl: data.join_url || "" };
}

module.exports = { createMeeting, isConfigured };
