const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/auth-login");

module.exports = adapt(handler);
