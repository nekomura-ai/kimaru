const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/logout");

module.exports = adapt(handler);
