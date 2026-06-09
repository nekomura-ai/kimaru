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

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setMessage(selector, text, kind = "") {
  const el = $(selector);
  if (!el) return;
  el.textContent = text;
  el.className = `message ${kind}`.trim();
}

function escapeHtml(value) {
  return String(value || "").replace(/[<>'"&]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char]));
}

let bookingQuestions = [];
let currentHost = null;

const LOCATION_LABELS = {
  google_meet: "Google Meet（自動発行）",
  zoom: "Zoom",
  in_person: "対面",
  phone: "電話",
  custom_url: "オンライン",
  later: "後日連絡",
};

function renderHost(host) {
  if (!host) return;
  currentHost = host;
  const titleEl = document.getElementById("host-title");
  const nameEl = document.getElementById("host-name");
  const descEl = document.getElementById("host-desc");
  const metaEl = document.getElementById("meeting-meta");
  if (titleEl) titleEl.textContent = host.title || "日程を選んで予約";
  if (nameEl) nameEl.textContent = host.name ? `${host.name} さんとの面談` : "";
  if (descEl) descEl.textContent = host.description || "";
  if (metaEl) {
    const loc = LOCATION_LABELS[host.location_type] || "";
    metaEl.innerHTML = `<li>所要時間：${Number(host.duration_minutes) || 30}分</li>${loc ? `<li>開催方法：${escapeHtml(loc)}</li>` : ""}`;
  }
}

function renderQuestions(questions) {
  const container = document.getElementById("questionnaire-fields");
  if (!container) return;
  bookingQuestions = Array.isArray(questions) ? questions : [];
  const list = bookingQuestions.length
    ? bookingQuestions
    : [{ id: null, question_text: "今回お話したい内容", is_required: true }];
  container.innerHTML = list
    .map((question, index) => {
      const required = question.is_required ? " required" : "";
      const mark = question.is_required ? " *" : "（任意）";
      const rows = index === 0 ? 4 : 3;
      return `<label><span>${escapeHtml(question.question_text)}${mark}</span><textarea data-question-id="${escapeHtml(question.id || "")}" rows="${rows}"${required}></textarea></label>`;
    })
    .join("");
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function timeText(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function dayHeading(date) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short" })
    .format(date)
    .replace("曜日", "");
}

function weekTitle(days) {
  const first = days[0];
  const last = days[days.length - 1];
  return `${first.getFullYear()}年${first.getMonth() + 1}月${first.getDate()}日 - ${last.getMonth() + 1}月${last.getDate()}日`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildWeekDays(slots) {
  const firstSlot = slots[0]?.startDate || new Date();
  const firstDay = startOfDay(firstSlot);
  return Array.from({ length: 7 }, (_, index) => new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index));
}

function buildTimeRows(slots) {
  // 実際の枠の開始時刻から行を作る（所要時間60分やバッファで30分グリッドから外れても確実に表示）
  const times = [...new Set(slots.map((slot) => minutesOfDay(slot.startDate)))].sort((a, b) => a - b);
  return times.length ? times : [10 * 60];
}

function slotKey(slot) {
  return `${dateKey(slot.startDate)}-${timeText(slot.startDate)}`;
}

function selectSlot(slot, button, form) {
  form.classList.remove("hidden");
  form.elements.start.value = slot.start;
  form.elements.end.value = slot.end;
  const selectedLabel = document.getElementById("selected-slot");
  if (selectedLabel) selectedLabel.textContent = fmtSlotRange(slot.start, slot.end);
  document.querySelectorAll(".week-slot").forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderWeeklyAvailability(container, rawSlots, form) {
  const slots = [...rawSlots]
    .map((slot) => ({ ...slot, startDate: new Date(slot.start), endDate: new Date(slot.end) }))
    .filter((slot) => !Number.isNaN(slot.startDate.getTime()) && !Number.isNaN(slot.endDate.getTime()))
    .sort((a, b) => a.startDate - b.startDate);

  if (!slots.length) {
    container.innerHTML = '<p class="muted">この週は空き枠がありません。「次の週 →」もご確認ください。</p>';
    return;
  }

  const days = buildWeekDays(slots);
  const rows = buildTimeRows(slots);
  const byStart = new Map(slots.map((slot) => [slotKey(slot), slot]));
  const duration = Math.round((slots[0].endDate - slots[0].startDate) / 60000);

  container.innerHTML = `
    <div class="week-schedule-card">
      <div class="week-schedule-head">
        <div>
          <p class="eyebrow">1週間の空き枠</p>
          <h3>${weekTitle(days)}</h3>
        </div>
        <div class="week-schedule-meta">
          <span>空いている時間</span>
          <strong>所要時間 ${duration}分</strong>
        </div>
      </div>
      <p class="muted">Googleカレンダーの予定と重なる時間は表示されません。空いている枠だけを選択できます。</p>
      <div class="week-table-wrap">
        <table class="week-table">
          <thead>
            <tr>
              <th>時間</th>
              ${days.map((day) => `<th>${dayHeading(day)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map((minute) => `
              <tr>
                <th>${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}</th>
                ${days.map((day) => {
                  const key = `${dateKey(day)}-${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`;
                  const slot = byStart.get(key);
                  return `<td data-slot-key="${key}">${slot ? "" : '<span class="week-busy">-</span>'}</td>`;
                }).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelectorAll("td[data-slot-key]").forEach((cell) => {
    const slot = byStart.get(cell.dataset.slotKey);
    if (!slot) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "week-slot";
    button.innerHTML = `<span>${timeText(slot.startDate)}</span><small>予約する</small>`;
    button.addEventListener("click", () => selectSlot(slot, button, form));
    cell.replaceChildren(button);
  });
}

function getBirthdayStatus(dateString) {
  if (!dateString) return "";
  const [, month, day] = dateString.split("-").map(Number);
  if (!month || !day) return "";
  const today = new Date();
  const currentYear = today.getFullYear();
  const target = new Date(currentYear, month - 1, day);
  const startOfToday = new Date(currentYear, today.getMonth(), today.getDate());
  if (target < startOfToday) target.setFullYear(currentYear + 1);
  const days = Math.ceil((target - startOfToday) / 86400000);
  if (days === 0) return "今日が誕生日です。お祝いメッセージを送るタイミングです。";
  return `次の誕生日まであと${days}日です。`;
}

function buildRelationshipProfile(dateString, name = "") {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  const displayName = name ? `${name}さん` : "お相手";
  return {
    method: "生年月日インサイト（簡易）",
    type: "会話のきっかけを作るための簡易メモ",
    approach: "目標、最近の関心、これから挑戦したいことを丁寧に聞くと会話が進みやすいです。",
    avoid: "断定せず、関係構築の仮説として扱ってください。",
    birthday_status: getBirthdayStatus(dateString),
    birthday_message: `${displayName}、お誕生日おめでとうございます。新しい一年が、挑戦したいことに一歩近づく時間になりますように。`,
    note: "生年月日から作る簡易メモです。断定ではなく、会話のきっかけとして使ってください。",
  };
}

function buildBookingPayload(form) {
  const data = formData(form);
  const profile = buildRelationshipProfile(data.birth_date, data.visitor_name);
  data.filter_request = profile ? JSON.stringify({
    kind: "relationship_context",
    version: 4,
    birth_date: data.birth_date_private === "yes" ? "非公開" : data.birth_date,
    birth_date_private: data.birth_date_private === "yes",
    birthday_message_opt_in: Boolean(data.birth_date),
    profile,
  }) : "none";
  const answers = [...document.querySelectorAll("#questionnaire-fields textarea")]
    .map((el) => {
      const label = el.closest("label")?.querySelector("span")?.textContent || "";
      const questionText = label.replace(/\s*\*$/, "").replace(/（任意）$/, "").trim();
      return { question_id: el.dataset.questionId || null, question_text: questionText, answer_text: el.value.trim() };
    })
    .filter((answer) => answer.answer_text);
  data.answers = answers;
  data.topic = answers[0]?.answer_text || "";
  delete data.birth_date;
  return data;
}

function resolveSlug() {
  const pathMatch = location.pathname.match(/^\/b\/([a-z0-9-]+)/i);
  if (pathMatch) return pathMatch[1].toLowerCase();
  const param = new URLSearchParams(location.search).get("slug");
  return param ? param.toLowerCase() : "demo";
}

let currentWeek = 0;
let bookingSlug = "demo";

function weekRangeLabel(week) {
  const base = new Date();
  base.setDate(base.getDate() + week * 7);
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
}

function updateWeekNav(hasPrev, hasNext) {
  const nav = $("#week-nav");
  if (!nav) return;
  nav.style.display = "";
  const prev = $("#prev-week");
  const next = $("#next-week");
  const label = $("#week-label");
  if (prev) prev.disabled = !hasPrev;
  if (next) next.disabled = !hasNext;
  if (label) label.textContent = weekRangeLabel(currentWeek);
}

async function loadWeek(week, full) {
  const grid = $("#slot-grid");
  const form = $("#booking-form");
  if (!grid || !form) return;
  grid.innerHTML = '<p class="muted">空き枠を読み込み中...</p>';
  try {
    const data = await api(`availability?slug=${encodeURIComponent(bookingSlug)}&week=${week}`);
    currentWeek = typeof data.week === "number" ? data.week : week;
    if (full) {
      renderHost(data.host);
      renderQuestions(data.questions || []);
    }
    if (data.paused) {
      grid.innerHTML = '<p class="muted">現在、この予約ページは受付を停止しています。しばらくしてから再度お試しください。</p>';
      form.classList.add("hidden");
      const nav = $("#week-nav");
      if (nav) nav.style.display = "none";
      return;
    }
    renderWeeklyAvailability(grid, data.slots || [], form);
    updateWeekNav(Boolean(data.hasPrev), Boolean(data.hasNext));
  } catch (error) {
    setMessage("#booking-message", error.message, "error");
  }
}

// --- 3ステップ（日程調整 → 確認 → 完了）---
function jpDate(date) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
}

function fmtSlotRange(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime())) return "日程を選んでください";
  return `${jpDate(start)} ${timeText(start)}〜${timeText(end)}`;
}

function goToStep(step) {
  document.querySelectorAll(".flow-step").forEach((section) => {
    section.hidden = Number(section.dataset.step) !== step;
  });
  document.querySelectorAll("#stepper .step").forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle("is-active", itemStep === step);
    item.classList.toggle("is-done", itemStep < step);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function collectAnswers() {
  return [...document.querySelectorAll("#questionnaire-fields textarea")]
    .map((el) => {
      const label = el.closest("label")?.querySelector("span")?.textContent || "";
      const question = label.replace(/\s*\*$/, "").replace(/（任意）$/, "").trim();
      return { question, answer: el.value.trim() };
    })
    .filter((item) => item.answer);
}

function buildSummaryRows(form) {
  const data = formData(form);
  const rows = [];
  rows.push({ label: "日程", value: fmtSlotRange(form.elements.start.value, form.elements.end.value), primary: true });
  if (currentHost) {
    const loc = LOCATION_LABELS[currentHost.location_type] || "";
    rows.push({
      label: "内容",
      value: currentHost.title || "面談",
      sub: `所要 ${Number(currentHost.duration_minutes) || 30}分${loc ? ` / ${loc}` : ""}`,
    });
  }
  rows.push({ label: "お名前", value: data.visitor_name || "" });
  rows.push({ label: "メール", value: data.visitor_email || "" });
  collectAnswers().forEach((item) => rows.push({ label: item.question || "回答", value: item.answer }));
  if (data.birth_date) {
    rows.push({ label: "生年月日", value: data.birth_date_private === "yes" ? "非公開" : data.birth_date });
  }
  return rows;
}

function renderSummary(targetId, rows) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = rows
    .map((row) => `
      <div${row.primary ? ' class="is-primary"' : ""}>
        <dt>${escapeHtml(row.label)}</dt>
        <dd>${escapeHtml(row.value)}${row.sub ? `<span class="sub">${escapeHtml(row.sub)}</span>` : ""}</dd>
      </div>`)
    .join("");
}

function proceedToConfirm(form) {
  if (!form.elements.start.value) {
    setMessage("#booking-message", "日程を選択してください。", "error");
    return;
  }
  const missingRequired = [...document.querySelectorAll("#questionnaire-fields textarea[required]")].some((el) => !el.value.trim());
  if (missingRequired) {
    setMessage("#booking-message", "必須の質問にご回答ください。", "error");
    return;
  }
  setMessage("#booking-message", "");
  renderSummary("confirm-list", buildSummaryRows(form));
  goToStep(2);
}

async function initBooking() {
  const grid = $("#slot-grid");
  const form = $("#booking-form");
  if (!grid || !form) return;
  bookingSlug = resolveSlug();
  if (form.elements.owner_slug) form.elements.owner_slug.value = bookingSlug;
  $("#prev-week")?.addEventListener("click", () => { if (currentWeek > 0) loadWeek(currentWeek - 1, false); });
  $("#next-week")?.addEventListener("click", () => loadWeek(currentWeek + 1, false));
  await loadWeek(0, true);

  // STEP1: 入力 → 確認へ（お名前/メールはブラウザ標準バリデーション後に submit が発火）
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    proceedToConfirm(form);
  });

  // STEP2: 修正に戻る / 予約を確定 → STEP3
  $("#back-to-schedule")?.addEventListener("click", () => {
    setMessage("#confirm-message", "");
    goToStep(1);
  });
  $("#confirm-book")?.addEventListener("click", async () => {
    const button = $("#confirm-book");
    setMessage("#confirm-message", "予約を保存しています...");
    button.disabled = true;
    try {
      const result = await api("book", { method: "POST", body: JSON.stringify(buildBookingPayload(form)) });
      renderSummary("done-list", buildSummaryRows(form));
      const manage = document.getElementById("done-manage");
      if (manage && result?.manage_url) {
        manage.innerHTML = `予約の確認・日程変更・キャンセルは <a href="${escapeHtml(result.manage_url)}">こちらのページ</a> から行えます（確認メールにも同じリンクを記載します）。`;
        manage.hidden = false;
      }
      goToStep(3);
    } catch (error) {
      setMessage("#confirm-message", error.message, "error");
      button.disabled = false;
    }
  });
}

initBooking();
