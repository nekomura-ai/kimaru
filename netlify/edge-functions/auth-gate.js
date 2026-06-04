// 認証ミドルウェア（Netlify Edge Function）
// 1) 未ログインでアプリページにアクセス → /login.html へリダイレクト（ルート保護）
// 2) すべてのHTMLの <body> に data-auth="authed|guest" を注入 → CSSでナビ等を出し分け（チラつき無し）
//
// 判定はセッションCookie `kimaru_session` の存在で行う（presenceベース）。
// 厳密な署名検証は各API/関数側（_lib/crypto.js）で実施しており、ここはUX用の前段ゲート。

// docs/screen-flow.md のアクセス権マトリクスで「無登録=−（不可）」の画面＝ログイン必須
const PROTECTED_PATHS = [
  "/dashboard.html",
  "/contacts.html",
  "/booking-settings.html",
  "/profile.html",
  "/ai-assist.html",
  "/cat-key-admin.html",
  "/square.html",
];

// 共通ヘッダー（単一ソース）。各ページの目印 <!-- site-header --> をこれで置換する。
// 表示の出し分けは body[data-auth] + CSS（.app-only / .guest-only）が担当。
const SITE_HEADER = `<header class="site-header">
    <a class="brand" href="/" data-i18n="common.brand">キマル</a>
    <nav>
      <a href="/pro.html" data-i18n="nav.pro">Pro版</a>
      <a class="guest-only" href="/signup.html" data-i18n="nav.signup">無料登録</a>
      <a class="guest-only" href="/login.html" data-i18n="nav.signin">ログイン</a>
      <a class="app-only" href="/dashboard.html" data-i18n="nav.dashboard">ホーム</a>
      <a class="app-only" href="/contacts.html" data-i18n="nav.admin">相手管理</a>
      <a class="app-only" href="/booking-settings.html" data-i18n="nav.bookingSettings">予約設定</a>
      <a class="app-only" href="/profile.html" data-i18n="nav.profile">プロフィール</a>
      <a class="app-only" href="/ai-assist.html" data-i18n="nav.aiAssist">AIアシスト</a>
      <select class="lang-select" data-language-select aria-label="Language"></select>
    </nav>
  </header>`;

function hasSession(request) {
  const cookie = request.headers.get("cookie") || "";
  return /(?:^|;\s*)kimaru_session=[^;]+/.test(cookie);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const authed = hasSession(request);

  // ① ルート保護
  if (!authed && PROTECTED_PATHS.includes(path)) {
    const loginUrl = new URL("/login.html", url.origin);
    loginUrl.searchParams.set("next", path);
    return Response.redirect(loginUrl.toString(), 302);
  }

  // ② HTMLに認証状態を注入
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const original = await response.text();
  let html = original.replace(/<body(?=[\s>])/i, `<body data-auth="${authed ? "authed" : "guest"}"`);
  // 共通ヘッダーを注入（目印があるページのみ置換）
  if (html.includes("<!-- site-header -->")) {
    html = html.replace("<!-- site-header -->", SITE_HEADER);
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
