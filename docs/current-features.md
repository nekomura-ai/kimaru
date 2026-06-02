# キマル（Kimaru）現状機能一覧

最終更新: 2026-06-02

このドキュメントは、現在のコードベースに**実装済みの機能**を棚卸ししたもの。
「やりたいこと（仕様）」は [`docs/spec.md`](./spec.md) を参照。両者の差分管理に使う。

技術構成: 静的 HTML / CSS / バニラ JS（`public/`）＋ Netlify Functions（Node.js, `netlify/functions/`）＋ Supabase。ビルド工程なし。

## 🔐 認証・ログイン

| 機能 | 状態 | 実装場所 |
|---|---|---|
| Google ソーシャルログイン（OAuth2） | ✅ 実装済 | `netlify/functions/google-auth-start.js` / `google-auth-callback.js` |
| セッション管理（HMAC 署名 Cookie・30日） | ✅ 実装済 | `netlify/functions/_lib/crypto.js`, `_lib/auth.js` |
| ログアウト | ✅ 実装済 | `netlify/functions/logout.js` |
| ログイン状態確認 | ✅ 実装済 | `netlify/functions/me.js` |

OAuth スコープ: `openid email profile https://www.googleapis.com/auth/calendar`（`_lib/google.js:5`）。

## 📅 Google カレンダー連携

| 機能 | 状態 | 実装場所 |
|---|---|---|
| Google カレンダー予定の取得（空き判定 / freeBusy API） | ✅ 実装済 | `_lib/google.js` `freebusy()` |
| 既存予定を避けた空き時間表示 | ✅ 実装済 | `netlify/functions/availability.js` |
| 予約確定時にカレンダー予定を自動作成 | ✅ 実装済 | `_lib/google.js` `createCalendarEvent()` |
| 15分前リマインダー（メール＋ポップアップ） | ✅ 実装済 | 同上 |
| ゲストへの招待メール送信（`sendUpdates=all`） | ✅ 実装済 | 同上 |
| アクセストークン自動リフレッシュ | ✅ 実装済 | `_lib/google.js` `accessTokenForOwner()` |
| トークンの暗号化保存（AES-256-GCM） | ✅ 実装済 | `_lib/crypto.js` |

## 📝 予約機能

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 公開予約ページ（空き枠選択＋予約フォーム） | ✅ 実装済 | `public/booking.html`, `public/app.js` |
| 予約作成（DB 保存＋カレンダー登録） | ✅ 実装済 | `netlify/functions/book.js` |
| 予約一覧（管理者向け） | ✅ 実装済 | `netlify/functions/owner-bookings.js` |
| 面談ログ（メモ / キーワード / 次アクション） | ✅ 実装済 | `netlify/functions/appointment-log.js` |

現状の空き枠生成は 30分固定・10時/13時/15時/17時の簡易グリッド（`availability.js`）。

## 👤 アカウント・プラン

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 無料サインアップ（名前 / メール / 目的 / 言語） | ✅ 実装済 | `netlify/functions/signup.js`, `public/signup.html` |
| 招待コード適用（free → pro 昇格） | ✅ 実装済 | `netlify/functions/invite-apply.js` |
| 管理ダッシュボード | ✅ 実装済 | `public/admin.html` |
| Square 決済 Webhook（プラン昇格） | ⚠️ プレースホルダ | `netlify/functions/square-webhook.js` |

## 🌐 フロントエンド

| 機能 | 状態 | 実装場所 |
|---|---|---|
| トップ / サインアップ / 予約 / 管理の4ページ | ✅ 実装済 | `public/index.html` ほか |
| 多言語対応（i18n・日/英/繁中の3言語） | ✅ 全ページにプルダウン設置・3言語完備 | `public/i18n.js`, `public/app.js` |
| レスポンシブ CSS（フレームワーク不使用） | ✅ 実装済 | `public/styles.css` |
| ビルド工程なし（静的配信） | ✅ | `netlify.toml` |

## データベース（現状スキーマ）

`supabase-schema.sql` で定義。テーブル: `owners`, `google_connections`, `booking_pages`, `bookings`, `appointment_logs`, `free_signups`, `payment_events`。

> 注: 仕様（`spec.md`）の DB 設計とはテーブル名・カラムが異なる（例: `owners`↔`users`、`google_connections`↔`google_calendar_tokens`）。

---

## ⚠️ 仕様にあるが「未実装」の差分

[`docs/spec.md`](./spec.md) にあって現状コードに無い主なもの:

- **Google Meet 自動発行**（`createCalendarEvent` に `conferenceData` を追加すれば実現可能）
- 予約時間の選択（30 / 45 / 60分）※現状 30分固定
- 前後バッファ設定（なし / 15 / 30分）
- 予約受付期間（1 / 3 / 6ヶ月）とプラン別制限
- 開催方法の選択（対面 / Meet / 電話 / カスタム URL / 後で連絡）
- 事前アンケート（質問・回答テーブル含む）
- 顧客管理・予約履歴管理（有料版）
- 複数名での日程調整（有料版）
- 招待コードの仕様変更: 現状 `JF7YAIN40EQL` → 仕様 `Neko20240222`
- ホスティング: 現状 Netlify → 仕様 Vercel（移行は保留中）
