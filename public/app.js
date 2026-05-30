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
      await api("book", { method: "POST", body: JSON.stringify(formData(form)) });
      form.reset();
      form.classList.add("hidden");
      setMessage("#booking-message", "予約が完了しました。確認メールとカレンダー予定を準備します。", "success");
    } catch (error) {
      setMessage("#booking-message", error.message, "error");
    }
  });
}

function renderBookings(bookings) {
  const list = $("#booking-list");
  if (!list) return;
  if (!bookings.length) {
    list.innerHTML = '<p class="muted">まだ予約はありません。</p>';
    return;
  }
  list.innerHTML = bookings.map((booking) => `
    <article class="list-item">
      <strong>${booking.visitor_name || booking.guest_name || "Guest"}</strong>
      <span>${booking.visitor_email || booking.guest_email || ""}</span>
      <p>${booking.topic || ""}</p>
      <small>${booking.start_at || booking.start_time ? formatSlot(booking.start_at || booking.start_time) : ""}</small>
    </article>
  `).join("");
}

function renderLogs(logs) {
  const list = $("#log-list");
  if (!list) return;
  list.innerHTML = logs.map((log) => `
    <article class="list-item">
      <strong>${log.visitor_email}</strong>
      <span>${log.keywords || ""}</span>
      <p>${log.notes || ""}</p>
      <small>${log.next_action || ""}</small>
    </article>
  `).join("");
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
    questionLimitMessage.textContent = isPro
      ? "有料版では最大5問まで設定できます。"
      : "無料版は最大2問まで。有料版または猫の鍵で最大5問に拡張できます。";
  }

  if (locationType && locationField) {
    const needsDetail = ["in_person", "phone", "custom_url"].includes(locationType.value);
    locationField.classList.toggle("hidden", !needsDetail);
    const input = locationField.querySelector("input");
    if (input) {
      input.placeholder = {
        in_person: "例：東京都渋谷区...",
        phone: "例：当日こちらからお電話します / 090-...",
        custom_url: "例：https://...",
      }[locationType.value] || "";
    }
  }
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
    questions,
  };
}

async function refreshAdmin() {
  try {
    const me = await api("me");
    currentOwner = me.owner || null;
    $("#owner-status").textContent = me.owner ? "ログイン中" : "未ログインです。Googleカレンダーを連携してください。";
    $("#owner-card").innerHTML = me.owner ? `<strong>${me.owner.name || me.owner.email}</strong><p>Plan: ${me.owner.plan}</p><p>Slug: ${me.owner.slug}</p>` : "";
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

  $("#booking-page-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#booking-page-message", "予約ページを保存しています...");
    try {
      const payload = collectBookingPagePayload(event.currentTarget);
      await api("booking-page-save", { method: "POST", body: JSON.stringify(payload) });
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
