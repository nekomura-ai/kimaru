const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/profile");

module.exports = adapt(handler);
