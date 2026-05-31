function normalizeHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value.join(",") : value]));
}

function toEvent(req) {
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
  return {
    httpMethod: req.method,
    headers: normalizeHeaders(req.headers),
    body,
    queryStringParameters: req.query || {},
    rawUrl: req.url,
  };
}

function sendNetlifyResponse(res, result) {
  const statusCode = result?.statusCode || 200;
  const headers = result?.headers || {};
  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) res.setHeader(key, value);
  });
  res.status(statusCode).send(result?.body || "");
}

function adapt(handler) {
  return async function vercelHandler(req, res) {
    try {
      const result = await handler(toEvent(req));
      sendNetlifyResponse(res, result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
    }
  };
}

module.exports = { adapt };
