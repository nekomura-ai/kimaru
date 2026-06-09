# キマル（Kimaru）現状機能一覧

最終更新: 2026-06-03（打ち合わせ 2026-06-03 の決定を反映）

このドキュメントは、現在のコードベースに**実装済みの機能**を棚卸ししたもの。
「やりたいこと（仕様）」は [`spec.md`](./spec.md)、機能ごとの詳細は [`features/README.md`](./features/README.md)、画面/URLは [`screens.md`](./screens.md)、画面アクセス権は [`screen-flow.md`](./screen-flow.md)、API は [`api.md`](./api.md)、DB構成は [`db-schema.md`](./db-schema.md)、プラン比較は [`plan-comparison.md`](./plan-comparison.md)。

技術構成: 静的 HTML / CSS / バニラ JS（`public/`）＋ サーバレス関数（`netlify/functions/`）＋ Supabase。ビルド工程なし。

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
| 1週間スケジュールグリッド予約UI（3ステップ：日程調整→確認→完了） | ✅ | `booking.html`, `booking-week.js` |
| カレンダー招待メール（Meet リンク込み） | ✅ | `createCalendarEvent`（`sendUpdates=all`） |
| 予約のキャンセル・日程変更（ゲスト・メールリンク） | ✅ | `booking-manage.js`, `manage-booking.html`（[features/26](./features/26-booking-cancel.md)/[27](./features/27-booking-reschedule.md)） |
| 予約ページの受付一時停止（is_active） | ✅ | `booking-settings`/`availability`/`book.js`（[features/29](./features/29-suspend-booking.md)） |
| 22分前リマインダー（無料=基本/Pro=プロフィール付き） | ✅ | `reminder-mails.js`+`reminder-scheduled.js`（要 Resend 設定。[features/21](./features/21-reminder.md)） |

## 📝 アンケート・メール

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 事前アンケート（設定・保存・プラン別問数） | ✅ | `booking-settings.html`, `booking-page-save.js` |
| 事前アンケート（ゲスト動的表示・回答保存） | ❌ | 未配線（`questionnaire_answers` 未使用） |
| 予約完了メール（独自テンプレ・管理リンク付き） | ✅ | `book.js` `sendBookingConfirmation`（要 Resend 設定。`_lib/mail.js`） |
| ホストへの予約通知メール | ✅ | `book.js` `sendHostNotification`（[features/28](./features/28-host-notification.md)） |
| 誕生日メール（Resend・Scheduled） | ✅ | `birthday-mails.js`+`birthday-scheduled.js`（要 Resend 設定） |

## 👤 アカウント・プラン・顧客管理

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 無料サインアップ | ✅ | `signup.js`, `signup.html` |
| 招待コード Cat Key（`NEKO20240222`） | ✅ | `invite-apply.js`, `dashboard.html` |
| 運営ログイン（共有キー→運営セッション・ユーザーと分離） | ✅ | `operator-login.html`, `operator-login.js`, `_lib/crypto.js`（`kimaru_admin_session`） |
| 運営コンソール（Cat Key 承認/却下/取消/復元・監査） | ✅ | `cat-key-admin.html`, `invite-apply.js?admin=cat-key`（運営セッション認可） |
| 運営者管理（operators 一覧/追加/削除・ユーザーと別テーブル） | ✅ | `operators.html`, `operators.js`, `operators` テーブル |
| プラン制限（受付期間・問数） | ✅ | `booking-page-save.js` |
| Square 決済での Pro 昇格 | ✅（Webhook） | `square-webhook.js` |
| 相手管理（予約一覧・検索・面談メモ・印象スコア） | ✅ | `contacts.html`, `owner-bookings.js`, `appointment-log.js` |
| 生年月日インサイト（簡易・ルールベース） | ⚠️ | `app.js` `buildRelationshipProfile` |
| プロフィールシート | ⚠️ | `profile.html`（localStorage のみ） |
| AIアシスト | ⚠️ | `ai-assist.html`（簡易ロジック・クライアント側） |

## 🌐 フロントエンド

| 機能 | 状態 | 実装場所 |
|---|---|---|
| 多言語対応（日/英/繁中・全ページセレクタ） | ✅（4画面） | `i18n.js`, `app.js` |
| レスポンシブ CSS（フレームワーク不使用） | ✅ | `styles.css`, `booking-redesign.css` |
| ビルド工程なし（静的配信） | ✅ | `netlify.toml` |
| 認証ミドルウェア（ルート保護・data-auth 注入・ヘッダー/フッター注入） | ✅ | `edge-functions/auth-gate.js` |
| 共通ヘッダー一本化（手動ナビ廃止）／共通フッター（法務リンク） | ✅ | Edge `<!-- site-header -->` / `<!-- site-footer -->` |
| 予約ページ：軽量ヘッダー＋下部に製品説明/CTA | ✅ | `booking.html` |
| 法務ページ（利用規約/プライバシー/特商法・枠） | ✅（本文ドラフト別） | `terms.html`, `privacy.html`, `tokushoho.html` |

## DB（現状の主なテーブル）

`owners`, `operators`(運営者・ユーザーと分離), `google_connections`, `booking_pages`, `availability_settings`, `bookings`, `questionnaire_questions`(設定のみ), `appointment_logs`, `free_signups`, `payment_events`, `cat_key_events`, `birthday_message_deliveries` ほか。詳細は `supabase-schema.sql` と各機能ドキュメント。

---

## ✅ 2026-06 で反映済み（決定→実装）

- **受付期間 無料2ヶ月/有料6ヶ月**（7日〜で選択。3ヶ月以降はPro）（[features/05](./features/05-booking-range.md)）。
- **予約ページの複数保存 無料2/有料・猫5**（[features/24](./features/24-multiple-booking-pages.md)）。
- **予約時間 30〜120分（10分刻み）・前後バッファ 0〜60分**。
- **予約のキャンセル・日程変更／ホスト通知／受付一時停止／22分前リマインダー（定期実行）**。

## ⚠️ 主な残課題（未実装・人間タスク）

- **事前アンケートのゲスト表示・回答保存**（[features/10](./features/10-questionnaire.md)）が未配線。
- **Resend 設定**（`RESEND_API_KEY` + 各 `*_EMAIL_FROM`・送信元ドメイン認証 SPF/DKIM）。未設定だと予約完了/ホスト通知/リマインダー/誕生日メールは送信スキップ。
- **本番デプロイ**で Netlify Scheduled Functions（リマインダー/誕生日）が稼働。
- **プロフィール/AIアシスト** はクライアント側の簡易実装（サーバ保存・LLM 連携は将来）。
- **会員同士の相互質問**（[features/20](./features/20-member-mutual-questions.md)）＝両プラン🔜・据え置き。
- **Zoom 自動発行**・**議事録アプリ連携**は将来対応（[features/25](./features/25-auth-architecture.md) ロードマップ）。
- 注: DB はレガシー重複あり（`owners`/`users`、`google_connections`/`google_calendar_tokens` ほか）。詳細は [`db-schema.md`](./db-schema.md)。
