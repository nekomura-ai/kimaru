const { json, readJson } = require("./_lib/response");
const { optional } = require("./_lib/config");
const { sb, eq, findOwnerByEmail } = require("./_lib/supabase");

function header(event, name) {
  const headers = event.headers || {};
  return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "";
}

function eventId(body) {
  return body.event_id || body.id || body.data?.id || body.data?.object?.payment?.id || "";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "許可されていない操作です" });
  const secret = optional("SQUARE_WEBHOOK_SHARED_SECRET");
  if (!secret) return json(503, { error: "Square Webhookが設定されていません" });
  const received = header(event, "x-kimaru-webhook-secret");
  if (received !== secret) return json(401, { error: "認証が必要です" });

  try {
    const body = readJson(event);
    const eventType = String(body.type || body.event_type || "");
    const email = String(
      body.email ||
      body.data?.object?.payment?.buyer_email_address ||
      body.data?.object?.subscription?.customer_email ||
      ""
    ).trim().toLowerCase();
    const lowerType = eventType.toLowerCase();
    // 解約・失効系は無料へ、それ以外の課金/サブスク/請求系は pro 付与（トライアル含む）
    const isCancel = /cancel|deactivat|delete|expire|fail|unpaid/.test(lowerType);
    const isGrant = !isCancel && /payment|subscription|invoice|charge/i.test(lowerType) && Boolean(email);
    const owner = email ? await findOwnerByEmail(email) : null;
    const subscription = body.data?.object?.subscription || {};
    const trialEndsAt = body.trial_ends_at || subscription.charged_through_date || null;

    let planResult = "none";
    if (owner) {
      if (isCancel) {
        await sb(`owners?id=${eq(owner.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ plan: "free", updated_at: new Date().toISOString() }),
        });
        planResult = "downgraded";
      } else if (isGrant) {
        await sb(`owners?id=${eq(owner.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ plan: "pro", trial_ends_at: trialEndsAt, updated_at: new Date().toISOString() }),
        }).catch(() =>
          // trial_ends_at 未マイグレーション環境向けフォールバック
          sb(`owners?id=${eq(owner.id)}`, { method: "PATCH", body: JSON.stringify({ plan: "pro", updated_at: new Date().toISOString() }) }));
        planResult = "pro";
      }
    }
    const shouldGrantPro = planResult === "pro";

    await sb("payment_events", {
      method: "POST",
      body: JSON.stringify({
        owner_id: owner?.id || null,
        provider: "square",
        provider_event_id: eventId(body),
        event_type: eventType,
        raw_payload: body,
      }),
    }).catch(() => null);

    return json(200, { ok: true, pro_granted: Boolean(shouldGrantPro && owner) });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
