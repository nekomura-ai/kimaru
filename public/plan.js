// plan.js — プラン判定の一元化。
// /api/me を1回だけ叩き、body に plan-free / plan-pro / plan-premium を付与する。
// window.KimaruPlan で owner・判定ヘルパ・ラベルを共有し、CustomEvent('kimaru:plan') を発火。
// CSS のチラ見え防止（.pro-feature 等は既定 display:none → body クラスで表示）に合わせ、必ず defer で読み込むこと。
// premium は pro の全機能を含む上位プラン（決定20）。判定はこのヘルパに統一する。
(function () {
  const PLAN_CLASS = { free: "plan-free", pro: "plan-pro", premium: "plan-premium" };
  let owner = null;

  const ready = fetch("/api/me", { credentials: "include" })
    .then((r) => r.json())
    .catch(() => ({}))
    .then((d) => {
      owner = (d && d.owner) || null;
      const plan = owner ? owner.plan : null;
      // 未ログイン・不明プランは free 扱い（既存挙動と一致）。
      document.body.classList.add(PLAN_CLASS[plan] || "plan-free");
      const detail = { owner, plan, calendar_connected: !!(d && d.calendar_connected) };
      document.dispatchEvent(new CustomEvent("kimaru:plan", { detail }));
      return detail;
    });

  window.KimaruPlan = {
    ready, // Promise<{owner, plan, calendar_connected}>
    get owner() { return owner; },
    isPro: (p) => p === "pro" || p === "premium",
    isPremium: (p) => p === "premium",
    planLabel: (p) => (p === "premium" ? "プレミアム" : p === "pro" ? "Pro" : "無料"),
  };
})();
