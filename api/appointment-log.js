const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/appointment-log");

module.exports = adapt(handler);
