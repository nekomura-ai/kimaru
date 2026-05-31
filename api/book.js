const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/book");

module.exports = adapt(handler);
