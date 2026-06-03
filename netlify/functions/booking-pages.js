const { json, readJson } = require("./_lib/response");
const { requireOwner } = require("./_lib/auth");
const { sb, eq } = require("./_lib/supabase");

// 自分の予約ページ一覧取得 / 削除（複数予約ページ管理）。
exports.handler = async (event) => {
  try {
    const owner = await requireOwner(event);

    if (event.httpMethod === "GET") {
      const pages = await sb(
        `booking_pages?owner_id=${eq(owner.id)}&select=id,slug,title,duration_minutes,location_type,booking_range_months,is_active,created_at&order=created_at.asc`
      );
      return json(200, { pages: pages || [] });
    }

    if (event.httpMethod === "POST") {
      const body = readJson(event);
      const action = String(body.action || "");
      const id = String(body.id || "").trim();
      if (action !== "delete" || !id) return json(400, { error: "Invalid request" });
      const rows = await sb(`booking_pages?id=${eq(id)}&owner_id=${eq(owner.id)}&limit=1`);
      if (!rows[0]) return json(404, { error: "Booking page not found" });
      await sb(`questionnaire_questions?booking_page_id=${eq(id)}`, { method: "DELETE" }).catch(() => {});
      await sb(`booking_pages?id=${eq(id)}`, { method: "DELETE" });
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
