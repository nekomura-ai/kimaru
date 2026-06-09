const { json, readJson } = require("./_lib/response");
const { requireProOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

    // 印象スコアの項目（trait_* フィールド → ラベル）。構造化保存して相手ごとの集約に使う（#175）。
    const SCORE_LABELS = {
      trait_first_impression: "第一印象",
      trait_speaking: "話し上手",
      trait_listening: "聞き上手",
      trait_proactive: "積極性",
      trait_giver: "ギバー度",
      trait_positive: "前向きさ",
      trait_logical: "論理性",
      trait_empathy: "共感力",
      trait_decisive: "決断力",
      trait_referral: "紹介しやすさ",
    };
    function collectScores(body) {
      const scores = {};
      Object.entries(SCORE_LABELS).forEach(([key, label]) => {
        const value = Number(body[key]);
        if (Number.isInteger(value) && value >= 1 && value <= 5) scores[label] = value;
      });
      return scores;
    }

exports.handler = async (event) => {
  try {
    const owner = await requireProOwner(event);
    if (event.httpMethod === "GET") {
      const logs = await sb(`appointment_logs?owner_id=${eq(owner.id)}&order=created_at.desc&limit=50`)
        .catch(() => sb(`appointment_logs?owner_id=${eq(owner.id)}&select=id,visitor_email,keywords,notes,next_action,created_at&order=created_at.desc&limit=50`));
      return json(200, { logs });
    }
    if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
    const body = readJson(event);
    if (!body.visitor_email || !body.notes) return json(400, { error: "相手のメールアドレスとメモは必須です" });
    const base = { owner_id: owner.id, visitor_email: body.visitor_email, notes: body.notes, keywords: body.keywords || "", next_action: body.next_action || "" };
    const scores = collectScores(body);
    let rows;
    try {
      rows = await sb("appointment_logs", { method: "POST", body: JSON.stringify({ ...base, scores }) });
    } catch (error) {
      // scores 列が未マイグレーションの環境では構造化保存をスキップ（メモ本文の【印象スコア】で代替）。
      if (!String(error.message || "").includes("scores")) throw error;
      rows = await sb("appointment_logs", { method: "POST", body: JSON.stringify(base) });
    }
    return json(200, { ok: true, log: rows[0] });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.statusCode ? error.message : "サーバーでエラーが発生しました。時間をおいて再度お試しください。" });
  }
};
