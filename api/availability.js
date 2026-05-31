const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/availability");

module.exports = adapt(handler);
