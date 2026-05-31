const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/google-auth-start");

module.exports = adapt(handler);
