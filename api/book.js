const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/book");

module.exports = adapt(handler);
