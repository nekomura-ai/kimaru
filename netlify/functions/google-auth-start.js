const { redirect } = require("./_lib/response");
const { googleAuthUrl } = require("./_lib/google");

exports.handler = async () => redirect(googleAuthUrl());
