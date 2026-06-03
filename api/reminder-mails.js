const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/reminder-mails");

module.exports = adapt(handler);
