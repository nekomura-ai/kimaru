const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/me");

module.exports = adapt(handler);
