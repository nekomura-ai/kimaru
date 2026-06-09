const { optional } = require("./config");

// AIアシスト用 LLM 呼び出しの共通ヘルパ。OpenAI Chat Completions を fetch で叩く（SDKなし方針。Supabase/Resend と同様）。
// 既定モデルは GPT-5.4 Mini（決定20）。OPENAI_API_KEY 未設定なら null を返し、呼び出し側はルールベースにフォールバックする。
// モデル/エンドポイントは env で差し替え可能（将来のモデル変更・上位モデル出し分けを局所化）。

const DEFAULT_MODEL = "gpt-5.4-mini";

function isConfigured() {
  return Boolean(optional("OPENAI_API_KEY", ""));
}

function currentModel() {
  return optional("OPENAI_MODEL", DEFAULT_MODEL);
}

// system/user から1回の生成を行う。未設定時は null。失敗時は statusCode 付き例外。
async function generate({ system, user, maxTokens = 1200 }) {
  const apiKey = optional("OPENAI_API_KEY", "");
  if (!apiKey) return null;
  const model = currentModel();
  const baseUrl = optional("OPENAI_BASE_URL", "https://api.openai.com/v1").replace(/\/$/, "");

  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: user });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    // 新しめのモデルは max_completion_tokens を使う。temperature は既定に任せて 400 を避ける。
    body: JSON.stringify({ model, messages, max_completion_tokens: maxTokens }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || "AI提案の生成に失敗しました");
    // レート上限/一時障害は 503（フロントは「時間をおいて」表示）、それ以外は 502。
    error.statusCode = response.status === 429 || response.status >= 500 ? 503 : 502;
    throw error;
  }
  const text = String(data?.choices?.[0]?.message?.content || "").trim();
  const usage = data?.usage || null;
  return { text, model, usage };
}

module.exports = { generate, isConfigured, currentModel, DEFAULT_MODEL };
