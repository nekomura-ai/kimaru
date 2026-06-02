const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/logout");

module.exports = adapt(handler);
