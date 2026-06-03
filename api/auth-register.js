const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/auth-register");

module.exports = adapt(handler);
