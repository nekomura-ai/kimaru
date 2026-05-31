const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/google-auth-callback");

module.exports = adapt(handler);
