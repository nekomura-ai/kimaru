const { sb, eq } = require("./supabase");

// 無料降格時に上限超過データを「削除せず凍結」、再昇格(pro/premium)で復元する（決定15・#174）。
// 凍結: 予約ページ frozen=true / is_active=false（公開停止＝予約不可）、質問 frozen=true（ゲストに出さない）。
// frozen 列が未マイグレーションの環境では各処理を握りつぶす（降格/昇格自体は plan 更新で完了済み）。

const FREE_PAGE_LIMIT = 2;
const FREE_QUESTION_LIMIT = 2;

async function ownerPageIds(ownerId, order = "updated_at.desc") {
  const pages = await sb(`booking_pages?owner_id=${eq(ownerId)}&select=id&order=${order}`);
  return (pages || []).map((p) => p.id);
}

// 無料降格: 直近更新の2ページだけ残し、超過ページと各ページの3問目以降を凍結。
async function freezeExcess(ownerId) {
  try {
    const ids = await ownerPageIds(ownerId, "updated_at.desc");
    const excess = ids.slice(FREE_PAGE_LIMIT);
    if (excess.length) {
      await sb(`booking_pages?id=in.(${excess.join(",")})`, {
        method: "PATCH",
        body: JSON.stringify({ frozen: true, is_active: false, active: false }),
      });
    }
    const keep = ids.slice(0, FREE_PAGE_LIMIT);
    if (keep.length) {
      await sb(`questionnaire_questions?booking_page_id=in.(${keep.join(",")})&sort_order=gt.${FREE_QUESTION_LIMIT}`, {
        method: "PATCH",
        body: JSON.stringify({ frozen: true }),
      });
    }
  } catch (_) {
    // frozen 列未マイグレーション等では何もしない。
  }
}

// 再昇格: 凍結した予約ページ・質問をすべて復元。
async function restoreFrozen(ownerId) {
  try {
    await sb(`booking_pages?owner_id=${eq(ownerId)}&frozen=is.true`, {
      method: "PATCH",
      body: JSON.stringify({ frozen: false, is_active: true, active: true }),
    });
    const ids = await ownerPageIds(ownerId, "created_at.asc");
    if (ids.length) {
      await sb(`questionnaire_questions?booking_page_id=in.(${ids.join(",")})&frozen=is.true`, {
        method: "PATCH",
        body: JSON.stringify({ frozen: false }),
      });
    }
  } catch (_) {
    // frozen 列未マイグレーション等では何もしない。
  }
}

module.exports = { freezeExcess, restoreFrozen, FREE_PAGE_LIMIT, FREE_QUESTION_LIMIT };
