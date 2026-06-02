const defaultHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store",
};

function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { ...defaultHeaders, "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  };
}

function redirect(location, headers = {}) {
  return {
    statusCode: 302,
    headers: { ...defaultHeaders, Location: location, ...headers },
    body: "",
  };
}

function readJson(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return {};
  }
}

module.exports = { json, redirect, readJson };
