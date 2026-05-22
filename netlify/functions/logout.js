const { json } = require("./_lib/response");
const { clearSessionCookie } = require("./_lib/crypto");

exports.handler = async () => json(200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
