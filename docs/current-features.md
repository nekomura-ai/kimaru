# キマル（Kimaru）現状機能一覧

最終更新: 2026-06-02（リデザイン版 origin/main の実態に同期）

このドキュメントは、現在のコードベースに**実装済みの機能**を棚卸ししたもの。
「やりたいこと（仕様）」は [`spec.md`](./spec.md)、機能ごとの詳細は [`features/README.md`](./features/README.md)、画面/URLは [`screens.md`](./screens.md)、API は [`api.md`](./api.md)。

技術構成: 静的 HTML / CSS / バニラ JS（`public/`）＋ サーバレス関数（`netlify/functions/`、Vercel は `api/` アダプタ）＋ Supabase。ビルド工程なし。

凡例: ✅ 実装済 / ⚠️ 部分実装 / ❌ 未実装

## 🔐 認証・ログイン

| 機能 | 状態 | 実装場所 |
|---|---|---|
| Google ソーシャルログイン（OAuth2） | ✅ | `google-auth-start.js` / `google-auth-callback.js` |
| セッション管理（HMAC Cookie・30日） | ✅ | `_lib/crypto.js`, `_lib/auth.js` |
| ログアウト / ログイン状態確認 | ✅ | `logout.js` / `me.js` |

## 📅 予約ページ設定（発行者）

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 予約時間（30/45/60分） | ✅ | `booking-settings.html`, `booking-page-save.js`, `availability.js` |
| 前後バッファ（なし/15/30分） | ✅ | 同上 |
| 受付期間（1/3/6ヶ月・プラン制限） | ✅ | 同上＋`app.js` |
| 開催方法（対面/Meet/電話/URL/後で連絡） | ✅（Zoomは将来） | `booking-settings.html`, `booking-page-save.js` |
| 受付可能時間（曜日・時間帯） | ✅ | `availability_settings` 利用 |

## 🗓 Google カレンダー連携・予約

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 空き判定（freeBusy で既存予定を除外） | ✅ | `_lib/google.js` `freebusy()`, `availability.js` |
| 予約作成＋カレンダー予定自動登録 | ✅ | `book.js`, `_lib/google.js` |
| Google Meet 自動発行（conferenceData） | ✅ | `_lib/google.js`（`meeting_url` 保存） |
| 1週間スケジュールグリッド予約UI | ✅ | `booking.html`, `booking-week.js` |
| 15分前リマインダー / 招待メール | ✅ | `createCalendarEvent`（`sendUpdates=all`） |

## 📝 アンケート・メール

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 事前アンケート（設定・保存・プラン別問数） | ✅ | `booking-settings.html`, `booking-page-save.js` |
| 事前アンケート（ゲスト動的表示・回答保存） | ❌ | 未配線（`questionnaire_answers` 未使用） |
| 予約完了メール（独自テンプレ） | ⚠️ | カレンダー招待で代替。独自送信は未実装 |
| 誕生日メール（Resend） | ⚠️ | `birthday-mails.js`（要 Resend 設定・cron） |

## 👤 アカウント・プラン・顧客管理

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 無料サインアップ | ✅ | `signup.js`, `signup.html` |
| 招待コード Cat Key（`NEKO20240222`） | ✅ | `invite-apply.js`, `admin.html` |
| Cat Key 管理（運営・取消/復元） | ✅ | `cat-key-admin.html`, `invite-apply.js?admin=cat-key` |
| プラン制限（受付期間・問数） | ✅ | `booking-page-save.js` |
| Square 決済での Pro 昇格 | ✅（Webhook） | `square-webhook.js` |
| 相手管理（予約一覧・検索・面談メモ・印象スコア） | ✅ | `admin.html`, `owner-bookings.js`, `appointment-log.js` |
| 生年月日インサイト（簡易・ルールベース） | ⚠️ | `app.js` `buildRelationshipProfile` |
| プロフィールシート | ⚠️ | `profile.html`（localStorage のみ） |
| AIアシスト | ⚠️ | `ai-assist.html`（簡易ロジック・クライアント側） |

## 🌐 フロントエンド

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 多言語対応（日/英/繁中・全ページセレクタ） | ✅（4画面） | `i18n.js`, `app.js` |
| レスポンシブ CSS（フレームワーク不使用） | ✅ | `styles.css`, `booking-redesign.css` |
| ビルド工程なし（静的配信） | ✅ | `netlify.toml` / `vercel.json` |

## DB（現状の主なテーブル）

`owners`, `google_connections`, `booking_pages`, `availability_settings`, `bookings`, `questionnaire_questions`(設定のみ), `appointment_logs`, `free_signups`, `payment_events`, `cat_key_events`, `birthday_message_deliveries` ほか。詳細は `supabase-schema.sql` と各機能ドキュメント。

---

## ⚠️ 主な残課題

- **事前アンケートのゲスト表示・回答保存**（[features/10](./features/10-questionnaire.md)）が未配線。
- **独自の予約完了メール**は未実装（現状はカレンダー招待で代替）。
- **誕生日メールのスケジューラ（cron）** と Resend 設定が必要。
- **プロフィール/AIアシスト** はクライアント側の簡易実装（サーバ保存・LLM 連携は将来）。
- **Zoom 自動発行** は将来対応。
- 注: 仕様の `users`/`profiles`/`invite_codes`/`questionnaire_answers` などテーブル名・運用は現状実装と一部差異あり。
