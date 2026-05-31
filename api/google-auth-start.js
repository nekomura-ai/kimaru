const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/google-auth-start");

module.exports = adapt(handler);
