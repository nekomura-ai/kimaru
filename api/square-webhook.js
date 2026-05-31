const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/square-webhook");

module.exports = adapt(handler);
