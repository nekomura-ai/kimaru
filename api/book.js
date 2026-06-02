const { adapt } = require("../lib/vercel-adapter");
const { handler: bookHandler } = require("../netlify/functions/book");
const { handler: birthdayMailsHandler } = require("../netlify/functions/birthday-mails");

const handleBook = adapt(bookHandler);
const handleBirthdayMails = adapt(birthdayMailsHandler);

module.exports = async function handler(req, res) {
  if (req.query?.job === "birthday-mails") return handleBirthdayMails(req, res);
  return handleBook(req, res);
};
