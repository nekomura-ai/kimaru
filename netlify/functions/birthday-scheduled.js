// Netlify Scheduled Function。日次（UTC 22:00 = JST 07:00）で起動し、誕生日メール（Pro限定）を送る。
// スケジュールは netlify.toml の [functions."birthday-scheduled"] で設定。
// HTTP からは叩けない（dry_run 確認は /api/birthday-mails?dry_run=1 を使う）。
const { run } = require("./birthday-mails");

exports.handler = async () => {
  try {
    const result = await run(false);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
