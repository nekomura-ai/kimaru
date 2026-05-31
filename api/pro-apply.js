const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/pro-apply");

module.exports = adapt(handler);
