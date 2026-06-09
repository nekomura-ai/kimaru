const $ = (selector) => document.querySelector(selector);

async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function esc(value) {
  return String(value || "").replace(/[<>'"&]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
function pad2(n) { return String(n).padStart(2, "0"); }
function setMsg(sel, text, kind = "") { const el = $(sel); if (el) { el.textContent = text; el.className = `message ${kind}`.trim(); } }

function fmtRange(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime())) return "";
  const d = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(a);
  return `${d} ${pad2(a.getHours())}:${pad2(a.getMinutes())}〜${pad2(b.getHours())}:${pad2(b.getMinutes())}`;
}

const params = new URLSearchParams(location.search);
const state = { id: params.get("id") || "", t: params.get("t") || "", slug: "", week: 0, booking: null };

function row(label, value, primary) {
  return `<div${primary ? ' class="is-primary"' : ""}><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
}

function renderSummary(b) {
  const cancelled = b.status === "cancelled";
  $("#manage-title").textContent = cancelled ? "この予約はキャンセル済みです" : "予約の確認";
  $("#manage-sub").textContent = b.host_name ? `${b.host_name} さんとの面談` : "";
  const rows = [
    row("日時", fmtRange(b.start_at, b.end_at), true),
    row("内容", b.page_title || "面談"),
    row("お名前", b.visitor_name || ""),
    row("開催方法", b.location_label || ""),
  ];
  if (b.meeting_url) rows.push(row("ミーティング", b.meeting_url));
  rows.push(row("状態", cancelled ? "キャンセル済み" : "確定"));
  $("#manage-summary").innerHTML = rows.join("");
  $("#manage-actions").hidden = cancelled;
}

async function load() {
  try {
    const data = await api(`booking-manage?id=${encodeURIComponent(state.id)}&t=${encodeURIComponent(state.t)}`);
    state.booking = data.booking;
    state.slug = data.booking.slug || "";
    renderSummary(data.booking);
  } catch (error) {
    $("#manage-title").textContent = "リンクが無効です";
    $("#manage-sub").textContent = "";
    $("#manage-summary").innerHTML = "";
    $("#manage-actions").hidden = true;
    setMsg("#manage-message", error.message, "error");
  }
}

$("#btn-cancel")?.addEventListener("click", async () => {
  if (!confirm("この予約をキャンセルします。よろしいですか？")) return;
  setMsg("#manage-message", "キャンセルしています...");
  try {
    await api("booking-manage", { method: "POST", body: JSON.stringify({ id: state.id, t: state.t, action: "cancel" }) });
    state.booking.status = "cancelled";
    renderSummary(state.booking);
    $("#reschedule-card").hidden = true;
    setMsg("#manage-message", "予約をキャンセルしました。確認メールをお送りします。", "success");
  } catch (error) {
    setMsg("#manage-message", error.message, "error");
  }
});

$("#btn-reschedule")?.addEventListener("click", () => {
  $("#reschedule-card").hidden = false;
  $("#reschedule-card").scrollIntoView({ behavior: "smooth", block: "start" });
  loadWeek(0);
});
$("#rs-back")?.addEventListener("click", () => { $("#reschedule-card").hidden = true; });
$("#rs-prev")?.addEventListener("click", () => { if (state.week > 0) loadWeek(state.week - 1); });
$("#rs-next")?.addEventListener("click", () => loadWeek(state.week + 1));

function weekLabel(week) {
  const base = new Date();
  base.setDate(base.getDate() + week * 7);
  const s = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;
}

async function loadWeek(week) {
  const grid = $("#rs-slots");
  grid.innerHTML = '<p class="muted">空き枠を読み込み中...</p>';
  try {
    const data = await api(`availability?slug=${encodeURIComponent(state.slug || "demo")}&week=${week}`);
    state.week = typeof data.week === "number" ? data.week : week;
    if (data.paused) {
      grid.innerHTML = '<p class="muted">現在、この予約ページは受付を停止しているため、日程変更ができません。主催者にお問い合わせください。</p>';
      $("#rs-week-nav").style.display = "none";
      return;
    }
    renderSlots(data.slots || []);
    $("#rs-week-nav").style.display = "";
    $("#rs-prev").disabled = !data.hasPrev;
    $("#rs-next").disabled = !data.hasNext;
    $("#rs-week-label").textContent = weekLabel(state.week);
  } catch (error) {
    grid.innerHTML = `<p class="muted">${esc(error.message)}</p>`;
  }
}

function renderSlots(slots) {
  const grid = $("#rs-slots");
  const list = [...slots]
    .map((s) => ({ ...s, sd: new Date(s.start), ed: new Date(s.end) }))
    .filter((s) => !Number.isNaN(s.sd.getTime()))
    .sort((a, b) => a.sd - b.sd);
  if (!list.length) {
    grid.innerHTML = '<p class="muted">この週は空き枠がありません。「次の週 →」もご確認ください。</p>';
    return;
  }
  const byDay = new Map();
  for (const s of list) {
    const key = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short" }).format(s.sd);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(s);
  }
  grid.innerHTML = [...byDay.entries()].map(([day, items]) => `
    <div class="rs-day">
      <h4>${esc(day)}</h4>
      <div class="rs-day-slots">
        ${items.map((s) => `<button type="button" class="rs-slot" data-start="${esc(s.start)}" data-end="${esc(s.end)}">${pad2(s.sd.getHours())}:${pad2(s.sd.getMinutes())}</button>`).join("")}
      </div>
    </div>`).join("");
  grid.querySelectorAll(".rs-slot").forEach((btn) => btn.addEventListener("click", () => chooseSlot(btn.dataset.start, btn.dataset.end)));
}

async function chooseSlot(start, end) {
  if (!confirm(`この日時に変更します。\n${fmtRange(start, end)}\nよろしいですか？`)) return;
  setMsg("#rs-message", "変更しています...");
  try {
    const data = await api("booking-manage", { method: "POST", body: JSON.stringify({ id: state.id, t: state.t, action: "reschedule", start, end }) });
    state.booking.start_at = data.start_at;
    state.booking.end_at = data.end_at;
    if (data.meeting_url !== undefined) state.booking.meeting_url = data.meeting_url;
    renderSummary(state.booking);
    $("#reschedule-card").hidden = true;
    setMsg("#manage-message", "日程を変更しました。確認メールをお送りします。", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setMsg("#rs-message", error.message, "error");
  }
}

if (!state.id || !state.t) {
  $("#manage-title").textContent = "リンクが無効です";
  setMsg("#manage-message", "予約管理リンクが正しくありません。メールのリンクからアクセスしてください。", "error");
} else {
  load();
}
