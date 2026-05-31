const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/signup");

module.exports = adapt(handler);
