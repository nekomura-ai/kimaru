const { adapt } = require("../lib/vercel-adapter");
const { handler } = require("../netlify/functions/birthday-mails");

module.exports = adapt(handler);
