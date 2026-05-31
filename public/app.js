const $ = (selector) => document.querySelector(selector);
const page = document.body.dataset.page;
let currentOwner = null;

function t(key) {
  return window.KimaruI18n?.t(key) || key;
}

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
  return String(value || "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char]));
}

function formatSlot(iso) {
  const locale = window.KimaruI18n?.getLanguage() || "ja";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatBirthDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return dateString;
  return `${year}年${month}月${day}日`;
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

function getWesternZodiac(month, day) {
  const signs = [
    [120, "山羊座"], [219, "水瓶座"], [321, "魚座"], [420, "牡羊座"], [521, "牡牛座"], [622, "双子座"],
    [723, "蟹座"], [823, "獅子座"], [923, "乙女座"], [1024, "天秤座"], [1123, "蠍座"], [1222, "射手座"], [1232, "山羊座"],
  ];
  const value = month * 100 + day;
  return signs.find(([limit]) => value < limit)?.[1] || "山羊座";
}

function getSeasonInsight(month) {
  if ([3, 4, 5].includes(month)) return { season: "春生まれ", tip: "新しい挑戦や変化の話題から入ると、自然に会話が広がりやすいです。" };
  if ([6, 7, 8].includes(month)) return { season: "夏生まれ", tip: "体験談や最近熱量が上がっていることを聞くと、空気が温まりやすいです。" };
  if ([9, 10, 11].includes(month)) return { season: "秋生まれ", tip: "価値観、判断基準、これまで積み上げてきたことを聞くと話が深まりやすいです。" };
  return { season: "冬生まれ", tip: "落ち着いた雰囲気で、目的や背景を丁寧に確認すると信頼を作りやすいです。" };
}

function getGenerationInsight(year) {
  if (year >= 1997) return { generation: "デジタルネイティブ世代", tip: "スピード感、納得感、自由度を大切にすると会話が進みやすいです。" };
  if (year >= 1981) return { generation: "ミレニアル世代", tip: "意味、成長、働き方や人生設計の話題が接点になりやすいです。" };
  if (year >= 1965) return { generation: "経験重視世代", tip: "実績、信頼、具体的なメリットを整理して伝えると安心感が出やすいです。" };
  return { generation: "成熟世代", tip: "敬意を持って背景を聞き、急がず丁寧に関係を作ると話が進みやすいです。" };
}

function buildRelationshipProfile(dateString, name = "") {
  if (!dateString) return null;
  const [rawYear, month, day] = dateString.split("-").map(Number);
  if (!rawYear || !month || !day) return null;
  const adjustedYear = month < 2 || (month === 2 && day < 4) ? rawYear - 1 : rawYear;
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const elements = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  const stemIndex = (((adjustedYear - 4) % 10) + 10) % 10;
  const branchIndex = (((adjustedYear - 4) % 12) + 12) % 12;
  const element = elements[stemIndex];
  const elementTips = {
    木: ["成長と可能性を大切にするタイプ", "未来の話、挑戦していること、伸ばしたい強みから入ると会話が進みやすいです。", "最初から結論を急がせすぎず、考えを広げる余白を残すと関係が作りやすくなります。"],
    火: ["熱量と反応を大切にするタイプ", "面白いと思った点や期待していることを先に伝えると、前向きな空気を作りやすいです。", "淡々と条件だけを並べるより、目的や背景を添えると話が深まりやすくなります。"],
    土: ["安心感と具体性を大切にするタイプ", "流れ、目的、次に決めたいことを整理して伝えると、信頼を得やすいです。", "抽象的な話だけで進めず、具体例や段取りを添えると安心してもらいやすくなります。"],
    金: ["基準と成果を大切にするタイプ", "何を達成したいか、判断基準は何かを明確にすると、話が噛み合いやすいです。", "曖昧な約束より、役割や次のアクションをはっきりさせると関係が進みやすくなります。"],
    水: ["情報と柔軟性を大切にするタイプ", "相手の考えを引き出す質問から入ると、自然に本音や関心が見えやすくなります。", "一方的に話し切らず、相手が整理する時間を作ると会話が深まりやすいです。"],
  };
  const [type, approach, avoid] = elementTips[element];
  const zodiac = getWesternZodiac(month, day);
  const season = getSeasonInsight(month);
  const generation = getGenerationInsight(rawYear);
  const displayName = name ? `${name}さん` : "お相手";
  return {
    method: "生年月日インサイト（簡易）",
    pillar: `${stems[stemIndex]}${branches[branchIndex]}`,
    element,
    zodiac,
    season: season.season,
    generation: generation.generation,
    type,
    approach,
    avoid,
    lenses: [
      `星座: ${zodiac}`,
      `季節感: ${season.season}。${season.tip}`,
      `世代感: ${generation.generation}。${generation.tip}`,
      `四柱推命メモ: ${stems[stemIndex]}${branches[branchIndex]} / ${element}`,
    ],
    birthday_status: getBirthdayStatus(dateString),
    birthday_message: `${displayName}、お誕生日おめでとうございます。新しい一年が、挑戦したいことに一歩近づく時間になりますように。`,
    note: "生年月日から作る簡易メモです。断定ではなく、会話のきっかけや関係構築の仮説として使ってください。",
  };
}

function parseRelationshipContext(value) {
  if (!value || value === "none") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed?.kind === "relationship_context" ? parsed : null;
  } catch (_) {
    return null;
  }
}

function buildBookingPayload(form) {
  const data = formData(form);
  const profile = buildRelationshipProfile(data.birth_date, data.visitor_name);
  data.filter_request = profile ? JSON.stringify({ kind: "relationship_context", version: 2, birth_date: data.birth_date, birthday_message_opt_in: data.birthday_message_opt_in === "yes", profile }) : "none";
  delete data.birth_date;
  delete data.birthday_message_opt_in;
  return data;
}

async function initSignup() {
  const form = $("#signup-form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#signup-message", t("signup.creating"));
    try {
      await api("signup", { method: "POST", body: JSON.stringify(formData(form)) });
      const selectedLanguage = form.elements.language?.value;
      form.reset();
      if (form.elements.language && selectedLanguage) form.elements.language.value = selectedLanguage;
      setMessage("#signup-message", t("signup.done"), "success");
    } catch (error) {
      setMessage("#signup-message", error.message, "error");
    }
  });
}

async function initBooking() {
  const grid = $("#slot-grid");
  const form = $("#booking-form");
  if (!grid || !form) return;
  try {
    const data = await api("availability?owner=demo");
    grid.innerHTML = "";
    if (!data.slots.length) grid.innerHTML = '<p class="muted">現在受付中の日時がありません。</p>';
    data.slots.forEach((slot) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot-button";
      button.textContent = formatSlot(slot.start);
      button.addEventListener("click", () => {
        form.classList.remove("hidden");
        form.elements.start.value = slot.start;
        form.elements.end.value = slot.end;
        document.querySelectorAll(".slot-button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
      });
      grid.appendChild(button);
    });
  } catch (error) {
    setMessage("#booking-message", error.message, "error");
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#booking-message", "予約を保存しています...");
    try {
      await api("book", { method: "POST", body: JSON.stringify(buildBookingPayload(form)) });
      form.reset();
      form.classList.add("hidden");
      setMessage("#booking-message", "予約が完了しました。確認メールとカレンダー予定を準備します。", "success");
    } catch (error) {
      setMessage("#booking-message", error.message, "error");
    }
  });
}

function renderRelationshipContext(context) {
  if (!context?.profile) return "";
  const profile = context.profile;
  const lenses = Array.isArray(profile.lenses) ? profile.lenses : [];
  return `
    <div class="relationship-insight">
      <strong>${escapeHtml(profile.method || "生年月日インサイト（簡易）")}: ${escapeHtml(profile.pillar || "")} / ${escapeHtml(profile.element || "")}</strong>
      <span>生年月日: ${escapeHtml(formatBirthDate(context.birth_date))}</span>
      ${lenses.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      <p>${escapeHtml(profile.type || "")}</p>
      <p><b>仲良くなるヒント:</b> ${escapeHtml(profile.approach || "")}</p>
      <p><b>気をつけること:</b> ${escapeHtml(profile.avoid || "")}</p>
      ${context.birthday_message_opt_in ? `<p><b>誕生日:</b> ${escapeHtml(profile.birthday_status)}</p><p><b>お祝いメッセージ案:</b> ${escapeHtml(profile.birthday_message)}</p>` : ""}
      <small>${escapeHtml(profile.note || "")}</small>
    </div>
  `;
}

function renderBookings(bookings) {
  const list = $("#booking-list");
  if (!list) return;
  if (!bookings.length) {
    list.innerHTML = '<p class="muted">まだ予約はありません。</p>';
    return;
  }
  list.innerHTML = bookings.map((booking) => {
    const context = parseRelationshipContext(booking.filter_request);
    return `
      <article class="list-item">
        <strong>${escapeHtml(booking.visitor_name || booking.guest_name || "Guest")}</strong>
        <span>${escapeHtml(booking.visitor_email || booking.guest_email || "")}</span>
        <p>${escapeHtml(booking.topic || "")}</p>
        ${renderRelationshipContext(context)}
        <small>${booking.start_at || booking.start_time ? escapeHtml(formatSlot(booking.start_at || booking.start_time)) : ""}</small>
      </article>
    `;
  }).join("");
}

function renderLogs(logs) {
  const list = $("#log-list");
  if (!list) return;
  list.innerHTML = logs.map((log) => `
    <article class="list-item">
      <strong>${escapeHtml(log.visitor_email)}</strong>
      <span>${escapeHtml(log.keywords || "")}</span>
      <p>${escapeHtml(log.notes || "")}</p>
      <small>${escapeHtml(log.next_action || "")}</small>
    </article>
  `).join("");
}

function updateAvailabilityRows() {
  document.querySelectorAll(".availability-row").forEach((row) => {
    const enabled = row.querySelector('input[type="checkbox"]')?.checked;
    row.classList.toggle("disabled", !enabled);
    row.querySelectorAll('input[type="time"]').forEach((input) => { input.disabled = !enabled; });
  });
}

function collectAvailabilitySettings(data) {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day_of_week: day,
    enabled: data[`availability_enabled_${day}`] === "on",
    start_time: data[`availability_start_${day}`] || "10:00",
    end_time: data[`availability_end_${day}`] || "18:00",
  })).filter((setting) => setting.enabled);
}

function updateBookingPageControls() {
  const isPro = currentOwner?.plan === "pro";
  const rangeSelect = $("#booking-range-select");
  const locationType = $("#location-type-select");
  const locationField = $("#location-value-field");
  const questionLimitMessage = $("#question-limit-message");
  if (rangeSelect) {
    const sixMonthOption = [...rangeSelect.options].find((option) => option.value === "6");
    if (sixMonthOption) sixMonthOption.disabled = !isPro;
    if (!isPro && rangeSelect.value === "6") rangeSelect.value = "3";
  }
  document.querySelectorAll(".pro-question").forEach((row) => row.classList.toggle("hidden", !isPro));
  if (questionLimitMessage) {
    questionLimitMessage.textContent = isPro ? "有料版では最大5問まで設定できます。" : "無料版は最大2問まで。有料版または猫の鍵で最大5問に拡張できます。";
  }
  if (locationType && locationField) {
    const needsDetail = ["in_person", "phone", "custom_url"].includes(locationType.value);
    locationField.classList.toggle("hidden", !needsDetail);
    const input = locationField.querySelector("input");
    if (input) {
      input.placeholder = { in_person: "例：東京都渋谷区...", phone: "例：当日こちらからお電話します / 090-...", custom_url: "例：https://..." }[locationType.value] || "";
    }
  }
  updateAvailabilityRows();
}

function collectBookingPagePayload(form) {
  const data = formData(form);
  const isPro = currentOwner?.plan === "pro";
  const maxQuestions = isPro ? 5 : 2;
  const questions = [1, 2, 3, 4, 5]
    .map((index) => String(data[`question_${index}`] || "").trim())
    .filter(Boolean)
    .slice(0, maxQuestions)
    .map((question_text, index) => ({ question_text, is_required: index < 2 }));
  return {
    title: data.title,
    description: data.description,
    duration_minutes: Number(data.duration_minutes),
    buffer_before_minutes: Number(data.buffer_before_minutes),
    buffer_after_minutes: Number(data.buffer_after_minutes),
    booking_range_months: Number(data.booking_range_months),
    location_type: data.location_type,
    location_value: data.location_value || "",
    availability_settings: collectAvailabilitySettings(data),
    questions,
  };
}

async function refreshAdmin() {
  try {
    const me = await api("me");
    currentOwner = me.owner || null;
    $("#owner-status").textContent = me.owner ? "ログイン中" : "未ログインです。Googleカレンダーを連携してください。";
    $("#owner-card").innerHTML = me.owner ? `<strong>${escapeHtml(me.owner.name || me.owner.email)}</strong><p>Plan: ${escapeHtml(me.owner.plan)}</p><p>Slug: ${escapeHtml(me.owner.slug)}</p>` : "";
    updateBookingPageControls();
    if (me.owner) {
      const bookings = await api("owner-bookings");
      renderBookings(bookings.bookings || []);
      const logs = await api("appointment-log");
      renderLogs(logs.logs || []);
    }
  } catch (error) {
    setMessage("#owner-status", error.message, "error");
  }
}

async function initAdmin() {
  await refreshAdmin();
  $("#logout-button")?.addEventListener("click", async () => {
    await api("logout", { method: "POST", body: "{}" }).catch(() => null);
    location.reload();
  });
  $("#location-type-select")?.addEventListener("change", updateBookingPageControls);
  $("#booking-range-select")?.addEventListener("change", updateBookingPageControls);
  document.querySelectorAll('.availability-row input[type="checkbox"]').forEach((checkbox) => checkbox.addEventListener("change", updateAvailabilityRows));
  $("#booking-page-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#booking-page-message", "予約ページを保存しています...");
    try {
      await api("booking-page-save", { method: "POST", body: JSON.stringify(collectBookingPagePayload(event.currentTarget)) });
      setMessage("#booking-page-message", "予約ページ設定を保存しました。", "success");
      await refreshAdmin();
    } catch (error) {
      setMessage("#booking-page-message", error.message, "error");
    }
  });
  $("#invite-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#invite-message", "適用しています...");
    try {
      await api("invite-apply", { method: "POST", body: JSON.stringify(formData(event.currentTarget)) });
      setMessage("#invite-message", "有料版機能が解放されました。", "success");
      await refreshAdmin();
    } catch (error) {
      setMessage("#invite-message", error.message, "error");
    }
  });
  $("#log-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#log-message", "保存しています...");
    try {
      await api("appointment-log", { method: "POST", body: JSON.stringify(formData(event.currentTarget)) });
      event.currentTarget.reset();
      setMessage("#log-message", "保存しました。", "success");
      await refreshAdmin();
    } catch (error) {
      setMessage("#log-message", error.message, "error");
    }
  });
}

window.KimaruI18n?.init();
if (page === "signup") initSignup();
if (page === "booking") initBooking();
if (page === "admin") initAdmin();
