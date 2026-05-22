function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function optional(name, fallback = "") {
  return process.env[name] || fallback;
}

function appBaseUrl() {
  return optional("APP_BASE_URL", optional("URL", "http://localhost:8888")).replace(/\/$/, "");
}

function googleRedirectUri() {
  return `${appBaseUrl()}/api/google-auth-callback`;
}

module.exports = { required, optional, appBaseUrl, googleRedirectUri };
