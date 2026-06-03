const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/google-disconnect");

module.exports = adapt(handler);
