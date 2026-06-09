// Netlify Scheduled Function。約5分間隔で起動し、22分前リマインダーを送る。
// スケジュールは netlify.toml の [functions."reminder-scheduled"] で設定。
// HTTP からは叩けない（dry_run 確認は /api/reminder-mails?dry_run=1 を使う）。
const { run } = require("./reminder-mails");

exports.handler = async () => {
  try {
    const result = await run(false);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
