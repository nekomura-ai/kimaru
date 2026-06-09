// Netlify Scheduled Function。毎日起動し、前日に面談した未登録の相手へサンキュー＋登録案内メールを送る（#181）。
// スケジュールは netlify.toml の [functions."thankyou-scheduled"] で設定。
// HTTP からは叩けない（dry_run 確認は /api/thankyou-mails?dry_run=1 を使う）。
const { run } = require("./thankyou-mails");

exports.handler = async () => {
  try {
    const result = await run(false);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
