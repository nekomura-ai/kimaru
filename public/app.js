const $ = (selector) => document.querySelector(selector);
const page = document.body.dataset.page;

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
  if (!response.ok) throw new Error(data.error || t("common.requestFailed"));
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
  const locale = window.KimaruI18n?.getLanguage() || "en";
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
    setMessage("#booking-message", t("booking.saving"));
    try {
      await api("book", { method: "POST", body: JSON.stringify(formData(form)) });
      form.reset();
      form.classList.add("hidden");
      setMessage("#booking-message", t("booking.done"), "success");
    } catch (error) {
      setMessage("#booking-message", error.message, "error");
    }
  });
}

function renderBookings(bookings) {
  const list = $("#booking-list");
  if (!list) return;
  if (!bookings.length) {
    list.innerHTML = `<p class="muted">${t("admin.noBookings")}</p>`;
    return;
  }
  list.innerHTML = bookings.map((booking) => `
    <article class="list-item">
      <strong>${booking.visitor_name || t("admin.guest")}</strong>
      <span>${booking.visitor_email || ""}</span>
      <p>${booking.topic || ""}</p>
      <small>${booking.start_at ? formatSlot(booking.start_at) : ""}</small>
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

async function refreshAdmin() {
  try {
    const me = await api("me");
    $("#owner-status").textContent = me.owner ? t("admin.loggedIn") : t("admin.notLoggedIn");
    $("#owner-card").innerHTML = me.owner ? `<strong>${me.owner.name || me.owner.email}</strong><p>${t("admin.plan")}: ${me.owner.plan}</p><p>${t("admin.slug")}: ${me.owner.slug}</p>` : "";
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

  document.addEventListener("kimaru:languagechange", () => {
    refreshAdmin();
  });

  $("#logout-button")?.addEventListener("click", async () => {
    await api("logout", { method: "POST", body: "{}" }).catch(() => null);
    location.reload();
  });

  $("#invite-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#invite-message", t("admin.applying"));
    try {
      await api("invite-apply", { method: "POST", body: JSON.stringify(formData(event.currentTarget)) });
      setMessage("#invite-message", t("admin.proUnlocked"), "success");
      await refreshAdmin();
    } catch (error) {
      setMessage("#invite-message", error.message, "error");
    }
  });

  $("#log-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#log-message", t("admin.logSaving"));
    try {
      await api("appointment-log", { method: "POST", body: JSON.stringify(formData(event.currentTarget)) });
      event.currentTarget.reset();
      setMessage("#log-message", t("admin.logSaved"), "success");
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
