(function () {
  const STORAGE_KEY = "kimaru.language";
  const defaultLanguage = "ja";
  const fallbackLanguage = "en";

  const supportedLanguages = [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" },
    { code: "zh-TW", label: "繁體中文" },
  ];

  const messages = {
    ja: {
      "common.brand": "Kimaru",
      "common.book": "予約",
      "common.signup": "無料登録",
      "common.admin": "管理",
      "common.language": "言語",
      "common.requestFailed": "リクエストに失敗しました。",

      "home.pageTitle": "Kimaru",
      "home.hero.eyebrow": "日程調整 + 事前準備 + 顧客管理",
      "home.hero.heading": "ミーティングの予約を、スマートに。",
      "home.hero.lead": "Kimaru は Google カレンダー連携の空き時間表示、予約作成、プロフィール共有、事前アンケート、面談ログ、招待コードを備えた実用的な日程調整ツールです。",
      "home.hero.startFree": "無料ではじめる",
      "home.hero.viewBooking": "予約ページを見る",
      "home.pro.badge": "Pro 月額980円",
      "home.pro.heading": "ミーティングの質を高める。",
      "home.pro.lead": "Pro では、充実したプロフィール、事前アンケート、面談ログ、履歴検索が使えます。招待コードでも Pro を解放できます。",
      "home.pro.connectGoogle": "Google と連携",
      "home.pro.startPro": "Pro をはじめる",
      "home.features.eyebrow": "実用的な MVP",
      "home.features.heading": "実際の予約テストにすぐ使えます。",
      "home.features.login.title": "Google ログイン",
      "home.features.login.desc": "管理者は Google でログインし、カレンダーを連携できます。",
      "home.features.availability.title": "リアルタイム空き状況",
      "home.features.availability.desc": "FreeBusy API で Google カレンダーの空き枠を表示します。",
      "home.features.booking.title": "予約作成",
      "home.features.booking.desc": "確定した予約は 15 分前リマインダー付きで Google カレンダーに登録されます。",
      "home.features.membership.title": "メンバーシップ",
      "home.features.membership.desc": "招待コードと Square Webhook で Pro ステータスに対応します。",
      "home.features.logs.title": "面談ログ",
      "home.features.logs.desc": "メモ・印象・次のアクションを記録できます。",
      "home.features.filters.title": "事前フィルター",
      "home.features.filters.desc": "金融・MLM・勧誘などの懸念を事前に確認します。",
      "home.footer": "Kimaru | 次の一歩は、ミーティングの前から。",

      "signup.pageTitle": "Kimaru - 無料登録",
      "signup.eyebrow": "無料アカウント",
      "signup.heading": "Kimaruをはじめる",
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

      "booking.pageTitle": "Kimaru - 予約",
      "booking.intro.eyebrow": "ミーティングの前に",
      "booking.intro.heading": "会う前に、おたがいを知る。",
      "booking.intro.lead": "Kimaru は短い自己紹介シートと事前アンケートを共有し、最初のミーティングをより温かく、深いものにします。",
      "booking.intro.li1": "15 分前のリマインダーメール",
      "booking.intro.li2": "Google カレンダーへの予定作成",
      "booking.intro.li3": "Pro 向けの NG フィルターと面談メモ",
      "booking.slots.eyebrow": "予約可能な時間",
      "booking.slots.heading": "時間を選ぶ",
      "booking.form.name": "お名前",
      "booking.form.email": "メールアドレス",
      "booking.form.topic": "お話したい内容",
      "booking.form.avoid": "避けたいことはありますか？",
      "booking.form.avoid.none": "特になし",
      "booking.form.avoid.finance": "金融商品の勧誘はNG",
      "booking.form.avoid.mlm": "MLM（マルチ商法）はNG",
      "booking.form.avoid.religion": "宗教勧誘はNG",
      "booking.form.avoid.taker": "一方的なお願いはNG",
      "booking.form.submit": "予約を確定する",
      "booking.saving": "予約を保存しています...",
      "booking.done": "予約が完了しました。Google カレンダーから 15 分前のリマインダーが送られます。",

      "admin.pageTitle": "Kimaru - 管理",
      "admin.nav.booking": "予約ページ",
      "admin.nav.login": "Google ログイン",
      "admin.nav.logout": "ログアウト",
      "admin.account.eyebrow": "アカウント",
      "admin.account.heading": "オーナーダッシュボード",
      "admin.account.checking": "ログインを確認しています...",
      "admin.catkey.eyebrow": "猫の鍵 / Cat Key",
      "admin.catkey.heading": "猫の集会メンバー向けに Pro を解放",
      "admin.catkey.desc": "猫の集会メンバーさんは、猫の鍵を入力すると有料版を無料で利用できます。",
      "admin.catkey.apply": "適用",
      "admin.bookings.eyebrow": "予約",
      "admin.bookings.heading": "最近のミーティング",
      "admin.log.eyebrow": "面談ログ",
      "admin.log.heading": "関係性の記録を残す",
      "admin.log.email": "来訪者のメールアドレス",
      "admin.log.keywords": "話題キーワード",
      "admin.log.keywordsPlaceholder": "例：サッカー、旅行、食べ物",
      "admin.log.notes": "メモ",
      "admin.log.next": "次の提案",
      "admin.log.save": "ログを保存",
      "admin.loggedIn": "ログイン中",
      "admin.notLoggedIn": "未ログインです。Google カレンダーと連携してください。",
      "admin.plan": "プラン",
      "admin.slug": "スラッグ",
      "admin.noBookings": "まだ予約はありません。",
      "admin.guest": "ゲスト",
      "admin.applying": "適用しています...",
      "admin.proUnlocked": "Pro を解放しました。",
      "admin.logSaving": "保存しています...",
      "admin.logSaved": "保存しました。",
    },
    en: {
      "common.brand": "Kimaru",
      "common.book": "Booking",
      "common.signup": "Free signup",
      "common.admin": "Admin",
      "common.language": "Language",
      "common.requestFailed": "Request failed.",

      "home.pageTitle": "Kimaru",
      "home.hero.eyebrow": "Scheduling + prep + CRM",
      "home.hero.heading": "Book meetings, the smart way.",
      "home.hero.lead": "Kimaru is a practical scheduling tool with Google Calendar availability, booking creation, profile sharing, pre-meeting questions, appointment logs, and invite codes.",
      "home.hero.startFree": "Start free",
      "home.hero.viewBooking": "View booking page",
      "home.pro.badge": "Pro 980 yen / month",
      "home.pro.heading": "Raise the quality of every meeting.",
      "home.pro.lead": "Pro unlocks richer profiles, pre-meeting surveys, appointment logs, and history search. Invite codes can also unlock Pro.",
      "home.pro.connectGoogle": "Connect Google",
      "home.pro.startPro": "Start Pro",
      "home.features.eyebrow": "Practical MVP",
      "home.features.heading": "Ready for real booking tests.",
      "home.features.login.title": "Google login",
      "home.features.login.desc": "Admins can log in with Google and connect Calendar.",
      "home.features.availability.title": "Live availability",
      "home.features.availability.desc": "FreeBusy API shows open slots from Google Calendar.",
      "home.features.booking.title": "Booking creation",
      "home.features.booking.desc": "Confirmed bookings create Google Calendar events with a 15-minute reminder.",
      "home.features.membership.title": "Membership",
      "home.features.membership.desc": "Invite codes and Square webhook support Pro status.",
      "home.features.logs.title": "Appointment logs",
      "home.features.logs.desc": "Save notes, impressions, and next actions.",
      "home.features.filters.title": "Pre-meeting filters",
      "home.features.filters.desc": "Pre-check finance, MLM, and solicitation concerns.",
      "home.footer": "Kimaru | The next step starts before the meeting.",

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

      "booking.pageTitle": "Kimaru - Booking",
      "booking.intro.eyebrow": "Before the meeting",
      "booking.intro.heading": "Know each other before the call.",
      "booking.intro.lead": "Kimaru shares a short introduction sheet and a pre-meeting questionnaire so the first meeting starts warmer and deeper.",
      "booking.intro.li1": "15-minute reminder email",
      "booking.intro.li2": "Google Calendar event creation",
      "booking.intro.li3": "NG filters and meeting notes for Pro users",
      "booking.slots.eyebrow": "Available slots",
      "booking.slots.heading": "Choose a time",
      "booking.form.name": "Your name",
      "booking.form.email": "Email",
      "booking.form.topic": "What would you like to discuss?",
      "booking.form.avoid": "Anything to avoid?",
      "booking.form.avoid.none": "Nothing special",
      "booking.form.avoid.finance": "Finance sales NG",
      "booking.form.avoid.mlm": "MLM NG",
      "booking.form.avoid.religion": "Religious solicitation NG",
      "booking.form.avoid.taker": "One-sided request NG",
      "booking.form.submit": "Confirm booking",
      "booking.saving": "Saving booking...",
      "booking.done": "Booked. A 15-minute reminder will be sent by Google Calendar.",

      "admin.pageTitle": "Kimaru - Admin",
      "admin.nav.booking": "Booking page",
      "admin.nav.login": "Google login",
      "admin.nav.logout": "Logout",
      "admin.account.eyebrow": "Account",
      "admin.account.heading": "Owner dashboard",
      "admin.account.checking": "Checking login...",
      "admin.catkey.eyebrow": "Cat Key",
      "admin.catkey.heading": "Unlock Pro for 猫の集会 members",
      "admin.catkey.desc": "Members of 猫の集会 can enter the Cat Key to use Pro for free.",
      "admin.catkey.apply": "Apply",
      "admin.bookings.eyebrow": "Bookings",
      "admin.bookings.heading": "Recent meetings",
      "admin.log.eyebrow": "Appointment log",
      "admin.log.heading": "Keep relationship context",
      "admin.log.email": "Visitor email",
      "admin.log.keywords": "Topic keywords",
      "admin.log.keywordsPlaceholder": "soccer, travel, food",
      "admin.log.notes": "Notes",
      "admin.log.next": "Next proposal",
      "admin.log.save": "Save log",
      "admin.loggedIn": "Logged in",
      "admin.notLoggedIn": "Not logged in. Please connect Google Calendar.",
      "admin.plan": "Plan",
      "admin.slug": "Slug",
      "admin.noBookings": "No bookings yet.",
      "admin.guest": "Guest",
      "admin.applying": "Applying...",
      "admin.proUnlocked": "Pro unlocked.",
      "admin.logSaving": "Saving...",
      "admin.logSaved": "Saved.",
    },
    "zh-TW": {
      "common.brand": "Kimaru",
      "common.book": "預約",
      "common.signup": "免費註冊",
      "common.admin": "管理",
      "common.language": "語言",
      "common.requestFailed": "請求失敗。",

      "home.pageTitle": "Kimaru",
      "home.hero.eyebrow": "日程安排 + 事前準備 + 顧客管理",
      "home.hero.heading": "更聰明地預約會議。",
      "home.hero.lead": "Kimaru 是實用的日程安排工具，具備 Google 日曆空檔顯示、預約建立、個人檔案分享、會前問卷、面談紀錄與邀請碼。",
      "home.hero.startFree": "免費開始",
      "home.hero.viewBooking": "查看預約頁面",
      "home.pro.badge": "Pro 每月 980 日圓",
      "home.pro.heading": "提升每一次會議的品質。",
      "home.pro.lead": "Pro 可解鎖更完整的個人檔案、會前問卷、面談紀錄與歷史搜尋。邀請碼也能解鎖 Pro。",
      "home.pro.connectGoogle": "連結 Google",
      "home.pro.startPro": "開始 Pro",
      "home.features.eyebrow": "實用的 MVP",
      "home.features.heading": "可立即用於真實預約測試。",
      "home.features.login.title": "Google 登入",
      "home.features.login.desc": "管理者可使用 Google 登入並連結日曆。",
      "home.features.availability.title": "即時空檔",
      "home.features.availability.desc": "透過 FreeBusy API 顯示 Google 日曆的空檔。",
      "home.features.booking.title": "建立預約",
      "home.features.booking.desc": "確認的預約會在 Google 日曆建立含 15 分鐘提醒的活動。",
      "home.features.membership.title": "會員",
      "home.features.membership.desc": "邀請碼與 Square Webhook 支援 Pro 狀態。",
      "home.features.logs.title": "面談紀錄",
      "home.features.logs.desc": "可記錄筆記、印象與下一步行動。",
      "home.features.filters.title": "會前篩選",
      "home.features.filters.desc": "事先確認金融、MLM、勸誘等疑慮。",
      "home.footer": "Kimaru | 下一步，從會議之前開始。",

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

      "booking.pageTitle": "Kimaru - 預約",
      "booking.intro.eyebrow": "會議之前",
      "booking.intro.heading": "見面之前，先認識彼此。",
      "booking.intro.lead": "Kimaru 會分享簡短的自我介紹表與會前問卷，讓第一次會議更溫暖、更深入。",
      "booking.intro.li1": "15 分鐘前提醒郵件",
      "booking.intro.li2": "建立 Google 日曆活動",
      "booking.intro.li3": "Pro 用戶可用 NG 篩選與面談筆記",
      "booking.slots.eyebrow": "可預約時間",
      "booking.slots.heading": "選擇時間",
      "booking.form.name": "你的姓名",
      "booking.form.email": "電子郵件",
      "booking.form.topic": "想討論的內容",
      "booking.form.avoid": "有想避免的事嗎？",
      "booking.form.avoid.none": "沒有特別",
      "booking.form.avoid.finance": "金融銷售 NG",
      "booking.form.avoid.mlm": "MLM NG",
      "booking.form.avoid.religion": "宗教勸誘 NG",
      "booking.form.avoid.taker": "單方面請求 NG",
      "booking.form.submit": "確認預約",
      "booking.saving": "正在儲存預約...",
      "booking.done": "已預約。Google 日曆會發送 15 分鐘前提醒。",

      "admin.pageTitle": "Kimaru - 管理",
      "admin.nav.booking": "預約頁面",
      "admin.nav.login": "Google 登入",
      "admin.nav.logout": "登出",
      "admin.account.eyebrow": "帳號",
      "admin.account.heading": "擁有者儀表板",
      "admin.account.checking": "正在確認登入...",
      "admin.catkey.eyebrow": "貓之鑰 / Cat Key",
      "admin.catkey.heading": "為 猫の集会 成員解鎖 Pro",
      "admin.catkey.desc": "猫の集会 的成員輸入貓之鑰即可免費使用付費版。",
      "admin.catkey.apply": "套用",
      "admin.bookings.eyebrow": "預約",
      "admin.bookings.heading": "最近的會議",
      "admin.log.eyebrow": "面談紀錄",
      "admin.log.heading": "保留關係脈絡",
      "admin.log.email": "訪客電子郵件",
      "admin.log.keywords": "話題關鍵字",
      "admin.log.keywordsPlaceholder": "足球、旅行、美食",
      "admin.log.notes": "筆記",
      "admin.log.next": "下一步提案",
      "admin.log.save": "儲存紀錄",
      "admin.loggedIn": "已登入",
      "admin.notLoggedIn": "尚未登入。請連結 Google 日曆。",
      "admin.plan": "方案",
      "admin.slug": "代稱",
      "admin.noBookings": "尚無預約。",
      "admin.guest": "訪客",
      "admin.applying": "正在套用...",
      "admin.proUnlocked": "已解鎖 Pro。",
      "admin.logSaving": "正在儲存...",
      "admin.logSaved": "已儲存。",
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
    document.dispatchEvent(new CustomEvent("kimaru:languagechange", { detail: { language: activeLanguage } }));
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
