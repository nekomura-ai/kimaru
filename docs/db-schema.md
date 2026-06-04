# キマル DB 構成（実装実態）

最終更新: 2026-06-03

実際の定義は [`../supabase-schema.sql`](../supabase-schema.sql)（Supabase / PostgreSQL）。本書はその要約とER図。
仕様上の理想スキーマは [`spec.md`](./spec.md) §15 を参照（本書が**実装の現状**）。

> ⚠️ 実装には歴史的な重複・レガシーが残る（下記「注意点」）。新規実装は **`owners` を主アカウント**として進める。

---

## ER 図（主要リレーション）

```mermaid
erDiagram
  owners ||--o| google_connections : "1:1 カレンダー連携"
  owners ||--o{ booking_pages : "予約ページ"
  owners ||--o{ availability_settings : "受付可能時間"
  owners ||--o{ bookings : "予約"
  owners ||--o{ appointment_logs : "面談ログ"
  owners ||--o{ cat_key_events : "Cat Key監査"
  owners ||--o{ payment_events : "決済イベント"
  owners ||--o| profiles : "プロフィール"

  booking_pages ||--o{ questionnaire_questions : "質問"
  booking_pages ||--o{ bookings : "予約(set null)"

  bookings ||--o{ questionnaire_answers : "回答"
  bookings ||--o{ birthday_message_deliveries : "誕生日メール配信"
  questionnaire_questions ||--o{ questionnaire_answers : "回答"

  invite_codes }o..o{ owners : "コード適用(論理)"

  operators }o..o{ cat_key_events : "運営操作(論理)"
```

> `operators`（運営者）は `owners`（ユーザー）と完全に独立したテーブル。リレーションは監査ログ上の実行者表示など論理的なものに留める。

---

## テーブル一覧

| テーブル | 役割 | 主なカラム |
|---|---|---|
| **owners** | 主アカウント（発行者）。プラン・Cat Key 状態を保持 | `email`(uniq), `name`, `slug`(uniq), `plan`(free/pro), `invite_code`, `cat_key_disabled` |
| **profiles** | プロフィールシート | `owner_id`, `user_id`(legacy), `display_name`, `bio`, `profile_url` |
| **google_connections** | Google カレンダー連携トークン（現行） | `owner_id`(uniq), `calendar_id`, `access_token`, `refresh_token`, `expires_at` |
| **booking_pages** | 予約ページ設定 | `owner_id`, `slug`(uniq), `duration_minutes`(30/45/60), `buffer_before/after_minutes`(0/15/30), `booking_range_months`(1/3/6), `location_type`, `location_value`, `timezone`, `is_active` |
| **availability_settings** | 受付可能時間（曜日・時間帯） | `owner_id`, `day_of_week`(0-6), `start_time`, `end_time` |
| **bookings** | 予約 | `owner_id`, `booking_page_id`, `visitor_name/email`, `topic`, `visitor_birth_date`(+`_private`), `birthday_message_opt_in`, `relationship_profile`(jsonb), `start_at/end_at`, `meeting_url`, `location_type`, `google_event_id`, `status` |
| **questionnaire_questions** | 事前アンケート質問 | `booking_page_id`, `question_text`, `is_required`, `sort_order` |
| **questionnaire_answers** | 事前アンケート回答 | `booking_id`, `question_id`, `answer_text` |
| **appointment_logs** | 面談ログ（相手管理） | `owner_id`, `visitor_email`, `keywords`, `notes`, `next_action` |
| **birthday_message_deliveries** | 誕生日メール配信記録（重複防止） | `booking_id`, `delivery_date`, `provider_message_id`, `status`, uniq(`booking_id`,`delivery_date`) |
| **invite_codes** | 招待コード（Cat Key）マスタ | `code`(uniq), `plan_grant`(free/pro), `is_active`。初期値 `NEKO20240222`=pro |
| **cat_key_events** | Cat Key 適用・取消・無効の監査 | `owner_id`, `email`, `action`, `code`, `ip_address`, `user_agent`, `metadata`(jsonb) |
| **payment_events** | Square 等の決済イベント記録 | `owner_id`, `provider`, `provider_event_id`, `event_type`, `raw_payload`(jsonb) |
| **operators** | 運営者アカウント（**`owners` とは別管理**）。運営者管理画面（`/operators.html`）で追加・削除・一覧 | `id`, `email`(uniq), `name`, `is_active`, `created_at`、（将来）`password_hash`。※ ログインは `/operator-login.html` → 運営セッション `kimaru_admin_session`（ユーザーと別系統）。認証は当面 共有管理キー `CAT_KEY_ADMIN_SECRET`、本表は運営者ロスター・監査の実行者表示用。将来は運営者ごとのメール+パスワード認証へ |
| **free_signups** | 無料登録フォームの申請 | `name`, `email`, `purpose`, `invite_code`, `language` |
| **users** | ⚠️ レガシーのアカウント表（旧設計） | `email`(uniq), `name`, `plan`, `invite_code` |
| **google_calendar_tokens** | ⚠️ レガシーのトークン表（旧設計） | `user_id`/`owner_id`, `access_token`, `refresh_token`, `expiry_date` |

---

## アクター別の利用テーブル

- **発行者ユーザー**: `owners`（自分）, `profiles`, `google_connections`, `booking_pages`, `availability_settings`, `questionnaire_questions`, `bookings`(自分宛), `appointment_logs`。
- **ゲスト**: `bookings`（作成）, `questionnaire_answers`（作成）。ログイン不要なので自身のレコードは持たない。
- **運営者**: `operators`（自身の運営アカウント・運営者管理）, `owners`（一覧・plan操作）, `invite_codes`, `cat_key_events`, `payment_events`。運営者は `owners`（ユーザー）とは別アカウントとして `operators` に持つ。

---

## 注意点（実装の重複・レガシー）

実装が段階的に育ったため、以下の重複が残る。**整理（マイグレーション）は別途要検討**。

1. **`owners` vs `users`**: 現行の主アカウントは **`owners`**。`users` は旧設計のレガシーで、各表に `user_id` 列が残るが新規では `owner_id` を使う。
2. **`google_connections` vs `google_calendar_tokens`**: カレンダー連携は現行 **`google_connections`**。`google_calendar_tokens` はレガシー。
3. **`bookings` の重複カラム**:
   - 来訪者名: `visitor_name`/`visitor_email`（現行）と `guest_name`/`guest_email`（旧）。
   - 時刻: `start_at`/`end_at`（現行）と `start_time`/`end_time`（旧）。
4. **`booking_pages` の `active` と `is_active`**: 両方存在。現行は `is_active`。
5. これらは `supabase-schema.sql` 末尾の `alter table ... add column if not exists` で後付けされた経緯がある。

## 打ち合わせ反映に伴う今後のスキーマ変更（要検討）

- **複数の予約ページ**（[features/24](./features/24-multiple-booking-pages.md)）: URL は `/b/{slug}`、`slug` は**グローバル一意のまま維持**（決定4）。**オーナーあたり複数行**を許可する変更（現状の実質1ページ前提を解消）と、保存数上限（無料2/有料・猫5）の実効が必要。
- **受付期間 無料2ヶ月化**（[features/05](./features/05-booking-range.md)）: `booking_range_months` の CHECK は `(1,3,6)`。2ヶ月対応なら `(1,2,3,6)` への変更が必要。
- **事前アンケート選択式**（将来, [features/10](./features/10-questionnaire.md)）: `questionnaire_questions` に回答形式・選択肢カラムの追加。
- **会員同士の相互質問**（[features/20](./features/20-member-mutual-questions.md)）: 双方向質問のための表追加。
- **議事録連携**（[features/23](./features/23-meeting-minutes.md)）: 議事録保存テーブルと `bookings` への紐付け。
- **お試し期間**（[features/13](./features/13-plans.md)）: `owners` にトライアル状態・期限カラム。
- **印象スコア構造化**（[features/14](./features/14-customer-management.md)）: 現状メモ本文に文字列追記 → 専用カラム/表へ。
- **運営者の分離**（[features/22](./features/22-admin-console.md)、決定 2026-06-04）: 運営者を `owners` と別テーブル `operators`（`email` uniq, `name`, `is_active`、将来 `password_hash`）で管理。運営ログイン `/operator-login.html` ＋ **運営専用セッション `kimaru_admin_session`**（ユーザーの `kimaru_session` と別系統）を新設。運営者管理（一覧/追加/削除）UI・API を追加。認証は共有管理キー `CAT_KEY_ADMIN_SECRET` を継続（将来 運営者ごとのメール+パスワードへ）。
