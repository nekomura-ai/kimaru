# キマル API エンドポイント一覧

最終更新: 2026-06-02

## 共通仕様

- **ベースパス**: `/api/*`
- **実体**: ロジックは `netlify/functions/<name>.js`。`api/<name>.js` は Vercel 用の薄いアダプタ（`lib/vercel-adapter.js` で Netlify ハンドラ形式を変換）。Netlify では `netlify.toml` の rewrite で `/api/*` → `/.netlify/functions/:splat`。
- **データ形式**: リクエスト/レスポンスとも JSON。
- **認証**: セッション Cookie `kimaru_session`（HMAC 署名・HttpOnly・30日）。`/api/me` 等の「要」エンドポイントは Cookie 必須。ブラウザ側は `fetch(..., { credentials: "include" })`。
- **エラー形式**: `{ "error": "<message>" }`。HTTP ステータスは 400（入力不正）/401（未認証）/403（権限・プラン制限）/405（メソッド不正）/500（サーバ）/503（未設定）。
- **DB**: Supabase REST（`_lib/supabase.js`）。テーブルは [`spec.md`](./spec.md) / `supabase-schema.sql` 参照。
- 画面との対応は [`screens.md`](./screens.md)。

凡例: 認証 = 不要 / 要（セッション）/ 署名・シークレット

---

## 認証・セッション

### `GET /api/google-auth-start` — 認証不要
Google OAuth 認可画面へ 302 リダイレクト。スコープ: `openid email profile https://www.googleapis.com/auth/calendar`。

### `GET /api/google-auth-callback?code=...` — 認証不要
OAuth コールバック。`code` をトークン交換し、`owners` を upsert・デフォルト `booking_pages` 作成・`google_connections` にトークン暗号化保存。`kimaru_session` Cookie を発行し `/admin.html` へリダイレクト。
- 触る DB: `owners`, `booking_pages`, `google_connections`
- 外部: Google OAuth token / userinfo

### `GET /api/me` — 要
現在のログインオーナーを返す。
- 応答: `{ "owner": { id, email, name, plan, slug, cat_key_disabled, ... } | null }`

### `POST /api/logout` — 認証不要
セッション Cookie を破棄。
- 応答: `{ "ok": true }`（`Set-Cookie` で失効）

---

## 公開（ゲスト向け）

### `POST /api/signup` — 認証不要
無料アカウント申請を保存。
- body: `{ name*, email*, purpose?, invite_code?, language? }`（`name`/`email` 必須、email 形式・language 形式を検証）
- 応答: `{ ok: true, signup }`
- DB: `free_signups`

### `GET /api/availability` — 認証不要
空き枠を返す（既存 Google 予定を除外）。
- ロジック: `defaultOwner()` → `booking_pages`（duration/buffer/range）と `availability_settings`（曜日・時間帯）から枠生成 → Google `freeBusy` で busy と重なる枠を除外。タイムゾーンは Asia/Tokyo。最大80枠。
- 応答: `{ slots: [{ start, end }] }`（ISO8601）
- DB: `owners`, `booking_pages`, `availability_settings`
- 外部: Google freeBusy

### `POST /api/book` — 認証不要
予約を作成し Google カレンダー予定を登録。
- body: `{ visitor_name*, visitor_email*, start*, end*, topic?, goal?, filter_request?, birth_date_private?, location_type? }`
  - `filter_request` は `kind: "relationship_context"` の JSON（生年月日インサイト）を許容。`birth_date_private="yes"` で生年月日を「非公開」にマスク。
  - 検証: email 形式、`start < end`、`now ≤ start ≤ now+6ヶ月`。
- 処理: `bookings` 作成 → `createCalendarEvent` → `google_event_id` と `meeting_url`(=hangoutLink) を更新。`location_type` 既定は `google_meet`。
- 応答: `{ ok: true, booking, google }`
- DB: `bookings`
- 外部: Google Calendar events
- 補足: `POST /api/book?job=birthday-mails` は誕生日メール処理（下記 birthday-mails）に分岐（Vercel 側ルーティング）。

---

## 管理（オーナー向け・要）

### `POST /api/booking-page-save` — 要
予約ページ設定（時間・バッファ・公開範囲・開催方法・受付時間・事前アンケート）を保存。
- body: `{ title?, description?, duration_minutes, buffer_before_minutes, buffer_after_minutes, booking_range_months, location_type, location_value?, availability_settings:[{day_of_week,start_time,end_time,enabled}], questions:[{question_text,is_required}], is_active? }`
- 検証/プラン制限:
  - duration ∈ {30,45,60}、buffer ∈ {0,15,30}、range ∈ {1,3,6}
  - location_type ∈ {in_person, google_meet, zoom, phone, custom_url, later}
  - 無料は range 最大3（超過は 403）、質問は無料2問/有料5問（超過は 403）
  - 受付時間（availability）が0件なら 400
- 処理: `booking_pages` を upsert → `questionnaire_questions` を全削除して再投入 → `availability_settings` を全削除して再投入
- 応答: `{ ok: true, booking_page, availability_settings, question_limit }`
- DB: `booking_pages`, `questionnaire_questions`, `availability_settings`

### `GET /api/owner-bookings` — 要
自分の予約一覧（最新50件）。生年月日が非公開の予約はマスクして返す。
- 応答: `{ bookings: [...] }`
- DB: `bookings`

### `GET /api/appointment-log` — 要
面談ログ一覧（最新50件）。
- 応答: `{ logs: [...] }`
- DB: `appointment_logs`

### `POST /api/appointment-log` — 要
面談ログを保存。
- body: `{ visitor_email*, notes*, keywords?, next_action? }`
- 応答: `{ ok: true, log }`
- DB: `appointment_logs`

### `POST /api/invite-apply` — 要
招待コード（Cat Key）を適用して Pro へ昇格。
- body: `{ code* }`（大文字化して照合。形式 `^[A-Z0-9_-]{6,40}$`）
- 有効コード: `JF7YAIN40EQL`, `NEKO20240222`（= Cat Key `Neko20240222`）
- `cat_key_disabled` のアカウントは 403。無効コードは 400。
- 処理: `owners.plan='pro'`, `invite_code` 更新。`cat_key_events` に監査ログ。
- 応答: `{ ok: true, owner }`
- DB: `owners`, `cat_key_events`

### Cat Key 管理モード（運営用・シークレット）
同じ `invite-apply` 関数が `?admin=cat-key` で管理APIを兼ねる。`CAT_KEY_ADMIN_SECRET`（or `ADMIN_SECRET`）が必要（Bearer / `?secret=` / body.secret）。
- `GET /api/invite-apply?admin=cat-key`: オーナー一覧＋Cat Key イベント。応答 `{ owners, events }`
- `POST /api/invite-apply?admin=cat-key`: body `{ owner_id*, action: "revoke"|"restore", secret }`。revoke で `plan=free, invite_code='', cat_key_disabled=true`。応答 `{ ok: true, owner }`
- DB: `owners`, `cat_key_events`

---

## 決済・ジョブ

### `POST /api/square-webhook` — 署名（シークレット）
Square 決済イベントを受信し、該当オーナーを Pro 昇格。
- 必須: `SQUARE_WEBHOOK_SHARED_SECRET`（未設定なら 503）。ヘッダ `x-kimaru-webhook-secret` が一致しなければ 401。
- 処理: payment/subscription 系イベント＋email から `owners` を Pro 更新。`payment_events` に記録。
- 応答: `{ ok: true, pro_granted }`
- DB: `owners`, `payment_events`

### 誕生日メール（バッチ）— シークレット
`netlify/functions/birthday-mails.js`。HTTP では `POST /api/book?job=birthday-mails`（Vercel）または関数 URL 経由。Netlify では別途スケジュール/呼び出しが必要。
- メソッド: GET / POST。`BIRTHDAY_CRON_SECRET`（or `CRON_SECRET`）設定時は Bearer / `?secret=` 必須。
- クエリ: `?dry_run=1` で送信せず対象のみ返す。
- 処理: Pro オーナーの `bookings` から本日（Asia/Tokyo）が誕生日かつ opt-in の予約を抽出 → Resend（`RESEND_API_KEY`/`BIRTHDAY_EMAIL_FROM`）でメール送信 → `birthday_message_deliveries` で重複送信防止。
- 応答: `{ ok: true, date, pro_owner_count, due_count, results }`
- DB: `bookings`, `owners`, `birthday_message_deliveries`
- 外部: Resend API

---

## 環境変数（API 関連）

| 変数 | 用途 |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase REST アクセス |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `APP_BASE_URL`（or `URL`） | リダイレクト URI 算出（`/api/google-auth-callback`） |
| `SESSION_SECRET` | セッション Cookie 署名 |
| `TOKEN_ENCRYPTION_KEY` | Google トークン暗号化（無ければ SESSION_SECRET 代用） |
| `SQUARE_WEBHOOK_SHARED_SECRET` | Square Webhook 検証 |
| `CAT_KEY_ADMIN_SECRET`（or `ADMIN_SECRET`） | Cat Key 管理モード認証 |
| `BIRTHDAY_CRON_SECRET`（or `CRON_SECRET`） | 誕生日メールジョブ認証 |
| `RESEND_API_KEY` / `BIRTHDAY_EMAIL_FROM` / `BIRTHDAY_EMAIL_REPLY_TO` | 誕生日メール送信（Resend） |
