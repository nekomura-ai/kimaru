const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/google-auth-callback");

module.exports = adapt(handler);
