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
      "common.brand": "キマル",
      "common.requestFailed": "リクエストに失敗しました。",

      "nav.booking": "予約ページ",
      "nav.bookingSettings": "予約設定",
      "nav.dashboard": "ホーム",
      "nav.admin": "相手管理",
      "nav.profile": "プロフィール",
      "nav.aiAssist": "AIアシスト",
      "nav.pro": "Pro版",
      "nav.signup": "無料登録",
      "nav.login": "Google連携",
      "nav.signin": "ログイン",
      "nav.logout": "ログアウト",
      "footer.terms": "利用規約",
      "footer.privacy": "プライバシーポリシー",
      "footer.tokushoho": "特定商取引法に基づく表記",
      "footer.copy": "© 2026 キマル",
      "auth.or": "または",
      "auth.google": "Googleでログイン",
      "auth.googleSignup": "Googleで無料登録",
      "booking.cta.eyebrow": "キマルとは",
      "booking.cta.heading": "あなたも無料で予約ページを作れます",
      "booking.cta.desc": "キマルは無料で使える1on1の日程調整ツール。事前アンケート・面談メモ・プロフィール付きリマインドまで、会う前の準備をまるごとひとつに。",
      "booking.cta.button": "無料で予約ページを作る",

      "home.pageTitle": "キマル | 日程調整と面談前準備",
      "home.hero.eyebrow": "Scheduling + prep + CRM",
      "home.hero.heading": "日程がキマル。Pro版では契約がキマりやすく。",
      "home.lead1": "キマルは、日程調整と事前アンケートと面談後の管理をひとつにした予約システムです。",
      "home.lead2": "15分前に届くプロフィール付きリマインドメールでこちらへの興味を持ってもらい、会う前に相手の状況や関心を確認することで、打ち合わせをスムーズに進められます。",
      "home.lead3": "Pro版では、質問項目の拡張、面談前のAI誕生日分析、面談後の相手管理、プロフィールシートと相手データを照合するAIアシストなど、次につながる関係構築や成約につながる機能が強化されます。",
      "home.hero.startFree": "無料で始める",
      "home.hero.viewBooking": "予約ページを見る",
      "home.hero.viewPro": "Pro版を見る",
      "home.panel.badge": "Free: 2ヶ月先まで / Pro: 6ヶ月先まで",
      "home.panel.heading": "会う前の準備まで、ひとつに。",
      "home.panel.desc": "事前アンケート、プロフィール付きリマインド、面談メモ、印象スコアを組み合わせて、日程調整を「会う前の関係づくり」まで広げます。",
      "home.panel.openBooking": "予約ページを開く",
      "home.panel.openAdmin": "相手管理を開く",
      "home.plan.eyebrow": "Plan",
      "home.plan.heading": "無料版とPro版の違い",
      "home.plan.th.feature": "機能",
      "home.plan.th.free": "無料版",
      "home.plan.th.pro": "Pro版",
      "home.plan.range.label": "予約枠の公開範囲",
      "home.plan.range.free": "今日から2ヶ月先まで",
      "home.plan.range.pro": "今日から6ヶ月先まで",
      "home.plan.survey.label": "事前アンケート",
      "home.plan.survey.free": "最大2問",
      "home.plan.survey.pro": "最大5問",
      "home.plan.hours.label": "曜日ごとの受付時間",
      "home.plan.hours.free": "利用可能",
      "home.plan.hours.pro": "利用可能",
      "home.plan.contacts.label": "相手管理",
      "home.plan.contacts.free": "基本メモ",
      "home.plan.contacts.pro": "印象スコア・フォロー管理を強化",
      "home.plan.aiBirthday.label": "AI誕生日分析",
      "home.plan.aiBirthday.free": "-",
      "home.plan.aiBirthday.pro": "面談前のAI誕生日分析で関係構築ヒントを提案",
      "home.plan.aiAssist.label": "AIアシスト",
      "home.plan.aiAssist.free": "-",
      "home.plan.aiAssist.pro": "プロフィールシートと相手データを照合し、関係構築の最適解を提案",
      "home.plan.note": "Cat Keyを適用したユーザーは、Pro版の機能を無料で利用できます。通常のPro版利用はSquare決済から進められます。",
      "home.plan.square": "Square決済へ進む",
      "home.plan.proDetail": "Pro版の詳細を見る",
      "home.footer": "キマル | 日程がキマル。会う前の準備で、関係が進む。",

      "signup.pageTitle": "キマル - 無料登録",
      "signup.eyebrow": "無料アカウント",
      "signup.heading": "キマルをはじめる",
      "signup.lead": "予約受付、シンプルなプロフィール共有、15分前リマインドを使える無料アカウントを作成します。",
      "signup.name": "名前",
      "signup.email": "メールアドレス",
      "signup.purpose": "利用目的",
      "signup.purposePlaceholder": "例：営業面談、紹介、カスタマーサポート",
      "signup.language": "言語",
      "signup.submit": "無料アカウントを作成",
      "signup.creating": "アカウントを作成しています...",
      "signup.done": "保存しました。無料アカウント申請を受け付けました。",

      "booking.pageTitle": "キマル - 予約",
      "booking.intro.eyebrow": "会う前の準備",
      "booking.intro.heading": "日程がキマル。Pro版では契約がキマりやすく。",
      "booking.intro.li1": "Googleカレンダーの予定と重ならない空き枠だけを表示",
      "booking.intro.li2": "1週間分の候補を30分刻みの表で確認",
      "booking.intro.li3": "事前アンケートで、話したい内容を確認",
      "booking.slots.eyebrow": "予約できる時間",
      "booking.slots.heading": "1週間の空き枠から選ぶ",
      "booking.form.name": "お名前",
      "booking.form.email": "メールアドレス",
      "booking.form.topic": "今回お話したい内容",
      "booking.form.goal": "今、実現したい夢や目標は何ですか？",
      "booking.form.birth": "生年月日（任意）",
      "booking.form.birthPrivate": "生年月日を非公開にする",
      "booking.form.submit": "予約を確定する",
      "booking.saving": "予約を保存しています...",
      "booking.done": "予約が完了しました。確認メールとカレンダー予定を準備します。",

      "admin.pageTitle": "キマル - 相手管理",
      "admin.account.eyebrow": "アカウント",
      "admin.account.heading": "相手管理",
      "admin.account.desc": "日程調整した相手の情報、面談メモ、印象スコアをまとめて確認できます。",
      "admin.account.checking": "ログイン状態を確認しています...",
      "admin.catkey.eyebrow": "猫の鍵 / Cat Key",
      "admin.catkey.heading": "有料版を解放する",
      "admin.catkey.desc": "猫の集会メンバーさんは、猫の鍵を入力すると有料版を無料で利用できます。入力内容は公開ページには表示されません。",
      "admin.catkey.apply": "適用",
      "admin.settings.eyebrow": "予約設定",
      "admin.settings.heading": "受付時間や公開範囲を変更する",
      "admin.settings.desc": "予約ページのタイトル、開催方法、曜日ごとの受付時間、事前アンケートは専用ページで設定できます。",
      "admin.settings.open": "予約設定を開く",
      "admin.contacts.eyebrow": "相手管理",
      "admin.contacts.heading": "日程調整した相手",
      "admin.contacts.desc": "予約した人の情報を一覧で確認し、名前・メール・話題・目標・誕生日メモから探せます。",
      "admin.contacts.search": "検索キーワード",
      "admin.contacts.searchPlaceholder": "名前、メール、話題、目標、誕生日メモで検索",
      "admin.memo.eyebrow": "相手メモ",
      "admin.memo.heading": "会った後に、関係を育てる",
      "admin.memo.desc": "話した内容、次のアクション、相手の印象スコアを残して、次の連絡につなげます。",
      "admin.memo.email": "相手のメールアドレス",
      "admin.memo.keywords": "キーワード",
      "admin.memo.keywordsPlaceholder": "夢, 仕事, 紹介したい人",
      "admin.memo.notes": "メモ",
      "admin.memo.next": "次にできること",
      "admin.memo.ratingEyebrow": "相手の印象メモ",
      "admin.memo.ratingHeading": "会話以外の情報を5段階で残す",
      "admin.memo.ratingDesc": "1は弱い、3は標準、5は強い印象です。未確認の項目は3のままで保存できます。",
      "admin.trait.firstImpression": "第一印象",
      "admin.trait.speaking": "話し上手",
      "admin.trait.listening": "聞き上手",
      "admin.trait.proactive": "積極性",
      "admin.trait.giver": "ギバー度",
      "admin.trait.positive": "前向きさ",
      "admin.trait.logical": "論理性",
      "admin.trait.empathy": "共感力",
      "admin.trait.decisive": "決断力",
      "admin.trait.referral": "紹介しやすさ",
      "admin.memo.save": "メモを保存する",
      "admin.memo.searchLabel": "メモ検索",
      "admin.memo.searchPlaceholder": "メール、キーワード、メモ、印象、次のアクションで検索",
      "admin.loggedIn": "ログイン中",
      "admin.notLoggedIn": "未ログインです。Googleカレンダーを連携してください。",
      "admin.noBookings": "まだ予約はありません。",
      "admin.guest": "ゲスト",
      "admin.applying": "適用しています...",
      "admin.proUnlocked": "有料版機能が解放されました。",
      "admin.proPending": "申請を受け付けました。運営の承認後に有料版が解放されます。",
      "admin.logSaving": "保存しています...",
      "admin.logSaved": "保存しました。",
    },
    en: {
      "common.brand": "Kimaru",
      "common.requestFailed": "Request failed.",

      "nav.booking": "Booking",
      "nav.bookingSettings": "Booking settings",
      "nav.dashboard": "Home",
      "nav.admin": "Contacts",
      "nav.profile": "Profile",
      "nav.aiAssist": "AI assist",
      "nav.pro": "Pro",
      "nav.signup": "Free signup",
      "nav.login": "Google login",
      "nav.signin": "Sign in",
      "nav.logout": "Logout",
      "footer.terms": "Terms",
      "footer.privacy": "Privacy Policy",
      "footer.tokushoho": "Commercial Transactions Act",
      "footer.copy": "© 2026 Kimaru",
      "auth.or": "or",
      "auth.google": "Continue with Google",
      "auth.googleSignup": "Sign up with Google",
      "booking.cta.eyebrow": "What is Kimaru",
      "booking.cta.heading": "You can create your own booking page for free",
      "booking.cta.desc": "Kimaru is a free 1-on-1 scheduling tool. Pre-meeting questionnaire, meeting notes, and profile-rich reminders — all your prep in one place.",
      "booking.cta.button": "Create a booking page free",

      "home.pageTitle": "Kimaru | Scheduling and pre-meeting prep",
      "home.hero.eyebrow": "Scheduling + prep + CRM",
      "home.hero.heading": "Scheduling, decided. Pro makes deals easier to close.",
      "home.lead1": "Kimaru is a booking system that combines scheduling, pre-meeting questionnaires, and post-meeting management in one place.",
      "home.lead2": "A reminder email with your profile arrives 15 minutes before, sparking interest in you. Checking the other person's situation and interests beforehand keeps the meeting smooth.",
      "home.lead3": "Pro adds expanded questions, pre-meeting AI birthday analysis, post-meeting contact management, and an AI assist that matches your profile sheet with contact data — strengthening relationship building and conversions.",
      "home.hero.startFree": "Start free",
      "home.hero.viewBooking": "View booking page",
      "home.hero.viewPro": "See Pro",
      "home.panel.badge": "Free: up to 2 months / Pro: up to 6 months",
      "home.panel.heading": "Even the prep before meeting, all in one.",
      "home.panel.desc": "Combine pre-meeting questionnaires, reminders with your profile, meeting notes, and impression scores to extend scheduling into relationship building before you meet.",
      "home.panel.openBooking": "Open booking page",
      "home.panel.openAdmin": "Open contacts",
      "home.plan.eyebrow": "Plan",
      "home.plan.heading": "Free vs Pro",
      "home.plan.th.feature": "Feature",
      "home.plan.th.free": "Free",
      "home.plan.th.pro": "Pro",
      "home.plan.range.label": "Booking window",
      "home.plan.range.free": "Up to 2 months ahead",
      "home.plan.range.pro": "Up to 6 months ahead",
      "home.plan.survey.label": "Pre-meeting questionnaire",
      "home.plan.survey.free": "Up to 2 questions",
      "home.plan.survey.pro": "Up to 5 questions",
      "home.plan.hours.label": "Per-weekday hours",
      "home.plan.hours.free": "Available",
      "home.plan.hours.pro": "Available",
      "home.plan.contacts.label": "Contact management",
      "home.plan.contacts.free": "Basic notes",
      "home.plan.contacts.pro": "Enhanced impression scores and follow-up",
      "home.plan.aiBirthday.label": "AI birthday analysis",
      "home.plan.aiBirthday.free": "-",
      "home.plan.aiBirthday.pro": "Pre-meeting AI birthday analysis suggests relationship-building tips",
      "home.plan.aiAssist.label": "AI assist",
      "home.plan.aiAssist.free": "-",
      "home.plan.aiAssist.pro": "Matches your profile sheet with contact data to suggest the best relationship approach",
      "home.plan.note": "Users who apply the Cat Key can use Pro features for free. Regular Pro use is available via Square checkout.",
      "home.plan.square": "Go to Square checkout",
      "home.plan.proDetail": "See Pro details",
      "home.footer": "Kimaru | Scheduling, decided. Prep before meeting moves the relationship forward.",

      "signup.pageTitle": "Kimaru - Free signup",
      "signup.eyebrow": "Free account",
      "signup.heading": "Start using Kimaru",
      "signup.lead": "Create a free account to receive bookings, share a simple profile, and send 15-minute reminders.",
      "signup.name": "Name",
      "signup.email": "Email",
      "signup.purpose": "Purpose",
      "signup.purposePlaceholder": "Example: sales meetings, introductions, customer support",
      "signup.language": "Language",
      "signup.submit": "Create free account",
      "signup.creating": "Creating account...",
      "signup.done": "Done. Your free account request was saved.",

      "booking.pageTitle": "Kimaru - Booking",
      "booking.intro.eyebrow": "Prep before meeting",
      "booking.intro.heading": "Scheduling, decided. Pro makes deals easier to close.",
      "booking.intro.li1": "Shows only open slots that don't overlap your Google Calendar",
      "booking.intro.li2": "Review a week of options in a 30-minute grid",
      "booking.intro.li3": "Confirm what you'd like to discuss with a pre-meeting questionnaire",
      "booking.slots.eyebrow": "Available times",
      "booking.slots.heading": "Pick from a week of open slots",
      "booking.form.name": "Your name",
      "booking.form.email": "Email",
      "booking.form.topic": "What would you like to discuss?",
      "booking.form.goal": "What dream or goal do you want to achieve now?",
      "booking.form.birth": "Date of birth (optional)",
      "booking.form.birthPrivate": "Keep date of birth private",
      "booking.form.submit": "Confirm booking",
      "booking.saving": "Saving booking...",
      "booking.done": "Booked. We'll prepare a confirmation email and calendar event.",

      "admin.pageTitle": "Kimaru - Contacts",
      "admin.account.eyebrow": "Account",
      "admin.account.heading": "Contact management",
      "admin.account.desc": "See your scheduled contacts' info, meeting notes, and impression scores in one place.",
      "admin.account.checking": "Checking login...",
      "admin.catkey.eyebrow": "Cat Key",
      "admin.catkey.heading": "Unlock Pro",
      "admin.catkey.desc": "Members of 猫の集会 can enter the Cat Key to use Pro for free. What you enter is not shown on public pages.",
      "admin.catkey.apply": "Apply",
      "admin.settings.eyebrow": "Booking settings",
      "admin.settings.heading": "Change hours and booking window",
      "admin.settings.desc": "Set the booking page title, meeting method, per-weekday hours, and pre-meeting questionnaire on the dedicated page.",
      "admin.settings.open": "Open booking settings",
      "admin.contacts.eyebrow": "Contacts",
      "admin.contacts.heading": "People you've scheduled",
      "admin.contacts.desc": "Browse the list of people who booked and search by name, email, topic, goal, or birthday note.",
      "admin.contacts.search": "Search keyword",
      "admin.contacts.searchPlaceholder": "Search by name, email, topic, goal, birthday note",
      "admin.memo.eyebrow": "Contact notes",
      "admin.memo.heading": "Grow the relationship after you meet",
      "admin.memo.desc": "Record what you discussed, next actions, and impression scores to lead into the next contact.",
      "admin.memo.email": "Contact email",
      "admin.memo.keywords": "Keywords",
      "admin.memo.keywordsPlaceholder": "dream, work, people to introduce",
      "admin.memo.notes": "Notes",
      "admin.memo.next": "Next steps",
      "admin.memo.ratingEyebrow": "Impression notes",
      "admin.memo.ratingHeading": "Record non-conversational info on a 5-point scale",
      "admin.memo.ratingDesc": "1 is weak, 3 is standard, 5 is strong. Unverified items can be saved at 3.",
      "admin.trait.firstImpression": "First impression",
      "admin.trait.speaking": "Good speaker",
      "admin.trait.listening": "Good listener",
      "admin.trait.proactive": "Proactiveness",
      "admin.trait.giver": "Giver level",
      "admin.trait.positive": "Positivity",
      "admin.trait.logical": "Logic",
      "admin.trait.empathy": "Empathy",
      "admin.trait.decisive": "Decisiveness",
      "admin.trait.referral": "Ease of referral",
      "admin.memo.save": "Save note",
      "admin.memo.searchLabel": "Search notes",
      "admin.memo.searchPlaceholder": "Search by email, keyword, note, impression, next action",
      "admin.loggedIn": "Logged in",
      "admin.notLoggedIn": "Not logged in. Please connect Google Calendar.",
      "admin.noBookings": "No bookings yet.",
      "admin.guest": "Guest",
      "admin.applying": "Applying...",
      "admin.proUnlocked": "Pro features unlocked.",
      "admin.proPending": "Request received. Pro will be unlocked after admin approval.",
      "admin.logSaving": "Saving...",
      "admin.logSaved": "Saved.",
    },
    "zh-TW": {
      "common.brand": "Kimaru",
      "common.requestFailed": "請求失敗。",

      "nav.booking": "預約頁面",
      "nav.bookingSettings": "預約設定",
      "nav.dashboard": "首頁",
      "nav.admin": "對象管理",
      "nav.profile": "個人檔案",
      "nav.aiAssist": "AI 助手",
      "nav.pro": "Pro 版",
      "nav.signup": "免費註冊",
      "nav.login": "Google 連結",
      "nav.signin": "登入",
      "nav.logout": "登出",
      "footer.terms": "使用條款",
      "footer.privacy": "隱私權政策",
      "footer.tokushoho": "特定商業交易法標示",
      "footer.copy": "© 2026 Kimaru",
      "auth.or": "或",
      "auth.google": "使用 Google 登入",
      "auth.googleSignup": "使用 Google 免費註冊",
      "booking.cta.eyebrow": "關於 Kimaru",
      "booking.cta.heading": "您也能免費建立自己的預約頁面",
      "booking.cta.desc": "Kimaru 是免費的一對一排程工具。事前問卷、會談筆記、含個人檔案的提醒，會面前的準備一次整合。",
      "booking.cta.button": "免費建立預約頁面",

      "home.pageTitle": "Kimaru | 日程安排與會前準備",
      "home.hero.eyebrow": "Scheduling + prep + CRM",
      "home.hero.heading": "日程，搞定。Pro 版讓成交更容易。",
      "home.lead1": "Kimaru 是把日程安排、會前問卷與會後管理整合在一起的預約系統。",
      "home.lead2": "會議前 15 分鐘送達附個人檔案的提醒郵件，讓對方對你產生興趣；會前先確認對方的狀況與關注點，能讓會談更順利。",
      "home.lead3": "Pro 版強化了問項擴充、會前 AI 生日分析、會後對象管理，以及比對個人檔案與對象資料的 AI 助手等功能，助於建立關係與成交。",
      "home.hero.startFree": "免費開始",
      "home.hero.viewBooking": "查看預約頁面",
      "home.hero.viewPro": "查看 Pro 版",
      "home.panel.badge": "Free：2 個月內 / Pro：6 個月內",
      "home.panel.heading": "連會前準備，都整合在一起。",
      "home.panel.desc": "結合會前問卷、附個人檔案的提醒、面談筆記與印象評分，把日程安排延伸到「見面前的關係建立」。",
      "home.panel.openBooking": "開啟預約頁面",
      "home.panel.openAdmin": "開啟對象管理",
      "home.plan.eyebrow": "Plan",
      "home.plan.heading": "免費版與 Pro 版的差異",
      "home.plan.th.feature": "功能",
      "home.plan.th.free": "免費版",
      "home.plan.th.pro": "Pro 版",
      "home.plan.range.label": "預約開放範圍",
      "home.plan.range.free": "今天起 2 個月內",
      "home.plan.range.pro": "今天起 6 個月內",
      "home.plan.survey.label": "會前問卷",
      "home.plan.survey.free": "最多 2 題",
      "home.plan.survey.pro": "最多 5 題",
      "home.plan.hours.label": "各星期受理時間",
      "home.plan.hours.free": "可使用",
      "home.plan.hours.pro": "可使用",
      "home.plan.contacts.label": "對象管理",
      "home.plan.contacts.free": "基本筆記",
      "home.plan.contacts.pro": "強化印象評分與跟進管理",
      "home.plan.aiBirthday.label": "AI 生日分析",
      "home.plan.aiBirthday.free": "-",
      "home.plan.aiBirthday.pro": "會前 AI 生日分析，提供建立關係的提示",
      "home.plan.aiAssist.label": "AI 助手",
      "home.plan.aiAssist.free": "-",
      "home.plan.aiAssist.pro": "比對個人檔案與對象管理資料，建議最佳的關係建立方式",
      "home.plan.note": "套用 Cat Key 的使用者可免費使用 Pro 版功能。一般 Pro 版可透過 Square 付款開通。",
      "home.plan.square": "前往 Square 付款",
      "home.plan.proDetail": "查看 Pro 版詳情",
      "home.footer": "Kimaru | 日程，搞定。會前準備，讓關係更進一步。",

      "signup.pageTitle": "Kimaru - 免費註冊",
      "signup.eyebrow": "免費帳號",
      "signup.heading": "開始使用 Kimaru",
      "signup.lead": "建立免費帳號，接收預約、分享簡易個人檔案，並發送 15 分鐘前提醒。",
      "signup.name": "姓名",
      "signup.email": "電子郵件",
      "signup.purpose": "使用目的",
      "signup.purposePlaceholder": "例：業務會議、介紹、客戶支援",
      "signup.language": "語言",
      "signup.submit": "建立免費帳號",
      "signup.creating": "正在建立帳號...",
      "signup.done": "已完成。你的免費帳號申請已儲存。",

      "booking.pageTitle": "Kimaru - 預約",
      "booking.intro.eyebrow": "會前準備",
      "booking.intro.heading": "日程，搞定。Pro 版讓成交更容易。",
      "booking.intro.li1": "只顯示與 Google 日曆不衝突的空檔",
      "booking.intro.li2": "以 30 分鐘為單位的表格檢視一週的候選時段",
      "booking.intro.li3": "用會前問卷確認想談的內容",
      "booking.slots.eyebrow": "可預約時間",
      "booking.slots.heading": "從一週的空檔中選擇",
      "booking.form.name": "你的姓名",
      "booking.form.email": "電子郵件",
      "booking.form.topic": "這次想談的內容",
      "booking.form.goal": "你現在最想實現的夢想或目標是什麼？",
      "booking.form.birth": "出生日期（選填）",
      "booking.form.birthPrivate": "將出生日期設為不公開",
      "booking.form.submit": "確認預約",
      "booking.saving": "正在儲存預約...",
      "booking.done": "已預約。我們會準備確認郵件與日曆活動。",

      "admin.pageTitle": "Kimaru - 對象管理",
      "admin.account.eyebrow": "帳號",
      "admin.account.heading": "對象管理",
      "admin.account.desc": "可彙整查看已安排對象的資訊、面談筆記與印象評分。",
      "admin.account.checking": "正在確認登入狀態...",
      "admin.catkey.eyebrow": "貓之鑰 / Cat Key",
      "admin.catkey.heading": "開通付費版",
      "admin.catkey.desc": "猫の集会 的成員輸入貓之鑰即可免費使用付費版。輸入內容不會顯示在公開頁面。",
      "admin.catkey.apply": "套用",
      "admin.settings.eyebrow": "預約設定",
      "admin.settings.heading": "變更受理時間與開放範圍",
      "admin.settings.desc": "預約頁標題、舉辦方式、各星期受理時間與會前問卷，可於專用頁面設定。",
      "admin.settings.open": "開啟預約設定",
      "admin.contacts.eyebrow": "對象管理",
      "admin.contacts.heading": "已安排的對象",
      "admin.contacts.desc": "以列表查看預約者資訊，並可用姓名、信箱、話題、目標、生日備註搜尋。",
      "admin.contacts.search": "搜尋關鍵字",
      "admin.contacts.searchPlaceholder": "用姓名、信箱、話題、目標、生日備註搜尋",
      "admin.memo.eyebrow": "對象筆記",
      "admin.memo.heading": "見面後，培養關係",
      "admin.memo.desc": "記下談話內容、下一步行動與對象印象評分，銜接下次聯繫。",
      "admin.memo.email": "對象電子郵件",
      "admin.memo.keywords": "關鍵字",
      "admin.memo.keywordsPlaceholder": "夢想、工作、想介紹的人",
      "admin.memo.notes": "筆記",
      "admin.memo.next": "下一步可做的事",
      "admin.memo.ratingEyebrow": "對象印象備註",
      "admin.memo.ratingHeading": "用 5 級記錄談話以外的資訊",
      "admin.memo.ratingDesc": "1 為弱、3 為標準、5 為強。未確認的項目可維持 3 儲存。",
      "admin.trait.firstImpression": "第一印象",
      "admin.trait.speaking": "擅長表達",
      "admin.trait.listening": "擅長傾聽",
      "admin.trait.proactive": "積極度",
      "admin.trait.giver": "給予度",
      "admin.trait.positive": "正向度",
      "admin.trait.logical": "邏輯性",
      "admin.trait.empathy": "同理心",
      "admin.trait.decisive": "決斷力",
      "admin.trait.referral": "易於介紹度",
      "admin.memo.save": "儲存筆記",
      "admin.memo.searchLabel": "搜尋筆記",
      "admin.memo.searchPlaceholder": "用信箱、關鍵字、筆記、印象、下一步搜尋",
      "admin.loggedIn": "已登入",
      "admin.notLoggedIn": "尚未登入。請連結 Google 日曆。",
      "admin.noBookings": "尚無預約。",
      "admin.guest": "訪客",
      "admin.applying": "正在套用...",
      "admin.proUnlocked": "已開通付費版功能。",
      "admin.proPending": "已收到申請。經運營審核後將開通付費版。",
      "admin.logSaving": "正在儲存...",
      "admin.logSaved": "已儲存。",
    },
  };

  let activeLanguage = defaultLanguage;
  let initialized = false;

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
    if (initialized) return;
    initialized = true;
    activeLanguage = pickLanguage();
    populateLanguageSelects();
    applyTranslations();
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-language-select]")) setLanguage(event.target.value);
    });
    // 認証状態でのナビ出し分けは Edge Function(body[data-auth]) + CSS に移行（JSトグルは廃止）
  }

  window.KimaruI18n = {
    init,
    t,
    setLanguage,
    getLanguage: () => activeLanguage,
    messages,
    supportedLanguages,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
