const { json, readJson } = require("./_lib/response");
const { sb } = require("./_lib/supabase");

function clean(value) {
  return String(value || "").trim();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = readJson(event);
    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    if (!name || !email) return json(400, { error: "お名前とメールアドレスを入力してください。" });

    const details = [
      "[Pro版申し込み]",
      `利用目的: ${clean(body.use_case) || "未入力"}`,
      `会社名・屋号: ${clean(body.company) || "未入力"}`,
      `電話番号: ${clean(body.phone) || "未入力"}`,
      `希望プラン: ${clean(body.plan) || "Pro版"}`,
      `相談内容: ${clean(body.message) || "未入力"}`,
    ].join("\n");

    const rows = await sb("free_signups", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        purpose: details,
        invite_code: clean(body.invite_code),
        language: clean(body.language) || "ja",
      }),
    });

    return json(200, { ok: true, application: rows[0] });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
