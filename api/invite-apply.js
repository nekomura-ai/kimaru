const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/invite-apply");

module.exports = adapt(handler);
