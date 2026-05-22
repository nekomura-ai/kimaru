const crypto = require("crypto");
const { required, optional } = require("./config");

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", required("SESSION_SECRET")).update(value).digest("base64url");
}

function sessionCookie(ownerId) {
  const payload = base64url(JSON.stringify({ ownerId, ts: Date.now() }));
  return `kimaru_session=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`;
}

function clearSessionCookie() {
  return "kimaru_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0";
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const index = part.indexOf("=");
    if (index < 0) return [part.trim(), ""];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }).filter(([key]) => key));
}

function verifySession(event) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || "");
  const raw = cookies.kimaru_session;
  if (!raw || !raw.includes(".")) return null;
  const [payload, signature] = raw.split(".");
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
}

function encryptionKey() {
  const secret = optional("TOKEN_ENCRYPTION_KEY", required("SESSION_SECRET"));
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decrypt(value) {
  if (!value) return null;
  const raw = Buffer.from(value, "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

module.exports = { sessionCookie, clearSessionCookie, verifySession, encrypt, decrypt };
