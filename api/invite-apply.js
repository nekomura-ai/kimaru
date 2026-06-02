const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/invite-apply");

module.exports = adapt(handler);
