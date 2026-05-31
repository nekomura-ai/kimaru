(function () {
  const STORAGE_KEY = "kimaru.language";
  const defaultLanguage = "ja";
  const fallbackLanguage = "en";

  const supportedLanguages = [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" },
    { code: "zh-TW", label: "繁體中文" },
    { code: "ko", label: "한국어" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "th", label: "ไทย" },
    { code: "id", label: "Bahasa Indonesia" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "pt-BR", label: "Português" },
  ];

  const messages = {
    ja: {
      "common.brand": "キマル",
      "common.book": "予約",
      "common.admin": "管理",
      "signup.pageTitle": "キマル - 無料登録",
      "signup.eyebrow": "無料アカウント",
      "signup.heading": "キマルをはじめる",
      "signup.lead": "予約受付、シンプルなプロフィール共有、15分前リマインドを使える無料アカウントを作成します。",
      "signup.name": "名前",
      "signup.email": "メールアドレス",
      "signup.purpose": "利用目的",
      "signup.purposePlaceholder": "例：営業面談、紹介、カスタマーサポート",
      "signup.catKey": "猫の鍵 / Cat Key",
      "signup.catKeyPlaceholder": "Neko20240222",
      "signup.language": "Language",
      "signup.submit": "無料アカウントを作成",
      "signup.creating": "アカウントを作成しています...",
      "signup.done": "保存しました。無料アカウント申請を受け付けました。",
    },
    en: {
      "common.brand": "Kimaru",
      "common.book": "Book",
      "common.admin": "Admin",
      "signup.pageTitle": "Kimaru - Free signup",
      "signup.eyebrow": "Free account",
      "signup.heading": "Start using Kimaru",
      "signup.lead": "Create a free account to receive bookings, share a simple profile, and send 15-minute reminders.",
      "signup.name": "Name",
      "signup.email": "Email",
      "signup.purpose": "Purpose",
      "signup.purposePlaceholder": "Example: sales meetings, introductions, customer support",
      "signup.catKey": "Cat Key",
      "signup.catKeyPlaceholder": "Neko20240222",
      "signup.language": "Language",
      "signup.submit": "Create free account",
      "signup.creating": "Creating account...",
      "signup.done": "Done. Your free account request was saved.",
    },
    "zh-TW": {
      "common.brand": "Kimaru",
      "common.book": "預約",
      "common.admin": "管理",
      "signup.pageTitle": "Kimaru - 免費註冊",
      "signup.eyebrow": "免費帳號",
      "signup.heading": "開始使用 Kimaru",
      "signup.lead": "建立免費帳號，接收預約、分享簡易個人檔案，並發送 15 分鐘前提醒。",
      "signup.name": "姓名",
      "signup.email": "電子郵件",
      "signup.purpose": "使用目的",
      "signup.purposePlaceholder": "例：業務會議、介紹、客戶支援",
      "signup.catKey": "貓之鑰 / Cat Key",
      "signup.catKeyPlaceholder": "Neko20240222",
      "signup.language": "Language",
      "signup.submit": "建立免費帳號",
      "signup.creating": "正在建立帳號...",
      "signup.done": "已完成。你的免費帳號申請已儲存。",
    },
  };

  let activeLanguage = defaultLanguage;

  function normalizeLanguage(code) {
    if (!code) return null;
    const value = String(code).trim();
    const lowerValue = value.toLowerCase();
    const exact = supportedLanguages.find((language) => language.code.toLowerCase() === lowerValue);
    if (exact) return exact.code;
    if (lowerValue.startsWith("zh")) return "zh-TW";
    const base = lowerValue.split("-")[0];
    const baseMatch = supportedLanguages.find((language) => language.code.toLowerCase().split("-")[0] === base);
    return baseMatch?.code || null;
  }

  function getBrowserLanguage() {
    const candidates = [navigator.language, ...(navigator.languages || [])];
    return candidates.map(normalizeLanguage).find(Boolean) || null;
  }

  function pickLanguage() {
    const stored = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    return stored || normalizeLanguage(defaultLanguage) || getBrowserLanguage() || normalizeLanguage(fallbackLanguage) || defaultLanguage;
  }

  function t(key) {
    const activeMessages = messages[activeLanguage] || {};
    const defaultMessages = messages[defaultLanguage] || {};
    const fallbackMessages = messages[fallbackLanguage] || {};
    return activeMessages[key] || defaultMessages[key] || fallbackMessages[key] || key;
  }

  function populateLanguageSelects(root = document) {
    root.querySelectorAll("[data-language-select]").forEach((select) => {
      select.innerHTML = "";
      supportedLanguages.forEach((language) => {
        const option = document.createElement("option");
        option.value = language.code;
        option.textContent = language.label;
        select.appendChild(option);
      });
      select.value = activeLanguage;
    });
  }

  function applyTranslations(root = document) {
    document.documentElement.lang = activeLanguage;
    const titleKey = document.body.dataset.i18nTitle;
    if (titleKey) document.title = t(titleKey);
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
  }

  function setLanguage(code) {
    activeLanguage = normalizeLanguage(code) || defaultLanguage;
    localStorage.setItem(STORAGE_KEY, activeLanguage);
    populateLanguageSelects();
    applyTranslations();
  }

  function init() {
    activeLanguage = pickLanguage();
    populateLanguageSelects();
    applyTranslations();
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-language-select]")) setLanguage(event.target.value);
    });
  }

  window.KimaruI18n = {
    init,
    t,
    setLanguage,
    getLanguage: () => activeLanguage,
    messages,
    supportedLanguages,
  };
})();
