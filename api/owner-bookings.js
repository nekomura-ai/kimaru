const { adapt } = require("./_lib/vercel-adapter");
const { handler } = require("../netlify/functions/owner-bookings");

module.exports = adapt(handler);
