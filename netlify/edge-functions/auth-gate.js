// 認証ミドルウェア（Netlify Edge Function）
// 1) 未ログインでアプリページにアクセス → /login.html へリダイレクト（ルート保護）
// 2) すべてのHTMLの <body> に data-auth="authed|guest" を注入 → CSSでナビ等を出し分け（チラつき無し）
//
// 判定はセッションCookie `kimaru_session` の存在で行う（presenceベース）。
// 厳密な署名検証は各API/関数側（_lib/crypto.js）で実施しており、ここはUX用の前段ゲート。

const PROTECTED_PATHS = [
  "/admin.html",
  "/booking-settings.html",
  "/profile.html",
  "/ai-assist.html",
  "/cat-key-admin.html",
];

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
  const html = original.replace(/<body(?=[\s>])/i, `<body data-auth="${authed ? "authed" : "guest"}"`);
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
