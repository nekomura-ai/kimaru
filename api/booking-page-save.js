const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/booking-page-save");

module.exports = adapt(handler);
