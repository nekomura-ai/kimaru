// 認証ミドルウェア（Netlify Edge Function）
// 1) 未ログインでアプリページ → /login.html、未ログインで運営ページ → /operator-login.html（ルート保護）
// 2) すべてのHTMLの <body> に data-auth="authed|guest" を注入 → CSSでナビ等を出し分け（チラつき無し）
// 3) 共通ヘッダー <!-- site-header --> / 共通フッター <!-- site-footer --> を注入
//
// 判定はCookie存在ベースの前段ゲート（UX用）。厳密な署名検証は各API/関数側（_lib/crypto.js）で実施。
// ユーザー用 kimaru_session と 運営用 kimaru_admin_session は完全に別系統。

// ユーザー向け要ログイン画面（docs/screen-flow.md：無登録=−）
const PROTECTED_PATHS = [
  "/dashboard.html",
  "/contacts.html",
  "/booking-settings.html",
  "/profile.html",
  "/ai-assist.html",
  "/settings.html",
  "/square.html",
];

// 運営向け画面：運営セッション（kimaru_admin_session）が必須。ユーザーログインとは無関係。
const OPERATOR_PATHS = [
  "/cat-key-admin.html",
  "/operators.html",
];

// 共通ヘッダー（単一ソース）。各ページの目印 <!-- site-header --> をこれで置換する。
// 表示の出し分けは body[data-auth] + CSS（.app-only / .guest-only）が担当。
const SITE_HEADER = `<header class="site-header">
    <a class="brand" href="/" data-i18n="common.brand">キマル</a>
    <nav>
      <a class="guest-only" href="/pro.html" data-i18n="nav.pro">Pro版</a>
      <a class="guest-only" href="/signup.html" data-i18n="nav.signup">無料登録</a>
      <a class="guest-only" href="/login.html" data-i18n="nav.signin">ログイン</a>
      <a class="app-only" href="/dashboard.html" data-i18n="nav.dashboard">ホーム</a>
      <a class="app-only" href="/booking-settings.html" data-i18n="nav.bookingSettings">予約設定</a>
      <a class="app-only" href="/profile.html" data-i18n="nav.profile">プロフィール設定</a>
      <a class="app-only" href="/contacts.html" data-i18n="nav.admin">相手管理</a>
      <a class="app-only" href="/ai-assist.html" data-i18n="nav.aiAssist">AIアシスト</a>
      <a class="app-only" href="/settings.html" data-i18n="nav.settings">設定</a>
      <select class="lang-select" data-language-select aria-label="Language"></select>
    </nav>
  </header>`;

// 共通フッター（法務リンク・全ページ共通）。目印 <!-- site-footer --> を置換。
const SITE_FOOTER = `<footer class="footer">
    <nav class="footer-nav">
      <a href="/terms.html" data-i18n="footer.terms">利用規約</a>
      <a href="/privacy.html" data-i18n="footer.privacy">プライバシーポリシー</a>
      <a href="/tokushoho.html" data-i18n="footer.tokushoho">特定商取引法に基づく表記</a>
    </nav>
    <p class="footer-copy" data-i18n="footer.copy">© 2026 キマル</p>
  </footer>`;

function hasSession(request) {
  const cookie = request.headers.get("cookie") || "";
  return /(?:^|;\s*)kimaru_session=[^;]+/.test(cookie);
}

function hasAdminSession(request) {
  const cookie = request.headers.get("cookie") || "";
  return /(?:^|;\s*)kimaru_admin_session=[^;]+/.test(cookie);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const authed = hasSession(request);
  const operator = hasAdminSession(request);

  // ① 運営ページの保護（ユーザーログインではなく運営セッションを要求）
  if (OPERATOR_PATHS.includes(path) && !operator) {
    const loginUrl = new URL("/operator-login.html", url.origin);
    loginUrl.searchParams.set("next", path);
    return Response.redirect(loginUrl.toString(), 302);
  }

  // ② ユーザーアプリページの保護
  if (PROTECTED_PATHS.includes(path) && !authed) {
    const loginUrl = new URL("/login.html", url.origin);
    loginUrl.searchParams.set("next", path);
    return Response.redirect(loginUrl.toString(), 302);
  }

  // ③ HTMLに認証状態・共通ヘッダー・共通フッターを注入
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const original = await response.text();
  let html = original.replace(/<body(?=[\s>])/i, `<body data-auth="${authed ? "authed" : "guest"}"`);
  if (html.includes("<!-- site-header -->")) {
    html = html.replace("<!-- site-header -->", SITE_HEADER);
  }
  if (html.includes("<!-- site-footer -->")) {
    html = html.replace("<!-- site-footer -->", SITE_FOOTER);
  }
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, headers });
};

export const config = {
  path: "/*",
  excludedPath: [
    "/api/*",
    "/.netlify/*",
    "/*.css",
    "/*.js",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.svg",
    "/*.ico",
    "/*.webp",
    "/*.woff",
    "/*.woff2",
    "/*.json",
    "/*.txt",
    "/*.xml",
  ],
};
