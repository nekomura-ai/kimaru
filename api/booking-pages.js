const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/booking-pages");

module.exports = adapt(handler);
