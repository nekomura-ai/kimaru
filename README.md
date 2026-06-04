# Kimaru

Kimaru is a free-first scheduling tool for meetings that should feel easier before they begin.

> 会う前に、相手を知る。  
> 会った後に、ご縁が育つ。  
> 予定を決めるだけでなく、明るい未来につながる出会いを増やす。

## Production

Host: **Netlify**（2026-06 に Netlify 一本化。Vercel 対応は廃止）。Database: **Supabase**。

## Architecture

- Frontend: static files in `public/`（ビルド工程なし）
- API: Netlify Functions in `netlify/functions/`（`/api/*` → `/.netlify/functions/`）
- Middleware: Netlify Edge Function `netlify/edge-functions/auth-gate.js`（認証ゲート＋`<body data-auth>`＋共通ヘッダー注入）
- Database: Supabase（REST/PostgREST を `fetch` で利用）
- Auth: Google ログイン ＋ メール+パスワード
- Calendar: Google Calendar API / Meeting: Google Meet 自動発行（Zoom は将来）
- Scheduled jobs: Netlify Scheduled Functions / 外部cron（誕生日メール・22分前リマインダー）
- Email delivery: Resend（環境変数未設定時は dry-run で送信スキップ）

## Deploy（Netlify）

このリポジトリから Netlify サイトを作成（`netlify.toml` 同梱のため設定はほぼ自動）：

- Publish directory: `public`
- Functions directory: `netlify/functions`
- Build command: 空

ローカル開発: `npm run dev`（= `netlify dev`、http://localhost:8888）。本番: `npm run deploy`。

Required environment variables:

- `APP_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Optional birthday email variables:

- `RESEND_API_KEY`
- `BIRTHDAY_EMAIL_FROM`
- `BIRTHDAY_EMAIL_REPLY_TO`
- `BIRTHDAY_CRON_SECRET` or `CRON_SECRET`

If `RESEND_API_KEY` and `BIRTHDAY_EMAIL_FROM` are not set, the birthday job stays in dry-run mode and only returns the target users and message text. If a cron secret is set, the job requires `Authorization: Bearer <secret>` or `?secret=<secret>`.

Set `APP_BASE_URL` to:

```text
{APP_BASE_URL}   # 当面は https://<サイト名>.netlify.app（独自ドメイン取得後に切替）
```

Google OAuth redirect URI:

```text
{APP_BASE_URL}/api/google-auth-callback
```

## Supabase

Run `supabase-schema.sql` in the Supabase SQL Editor before using the app.

The schema includes:

- `users`
- `profiles`
- `booking_pages`
- `availability_settings`
- `bookings`
- `questionnaire_questions`
- `questionnaire_answers`
- `google_calendar_tokens`
- `invite_codes`
- `birthday_message_deliveries`

Compatibility tables for the current Google-login MVP also remain:

- `owners`
- `google_connections`

## Birthday Emails

Birthday email automation is implemented as a Pro feature.

- Booking guests can optionally enter a birth date and request a birthday message.
- The booking stores birth-date context and a relationship profile for later analysis.
- `/api/birthday-mails` checks confirmed bookings every day at 09:00 JST.
- Only bookings owned by Pro owners are eligible.
- `birthday_message_deliveries` prevents duplicate sends for the same booking and date.
- Resend sends the email when `RESEND_API_KEY` and `BIRTHDAY_EMAIL_FROM` are configured.

Manual dry-run check:

```text
{APP_BASE_URL}/api/birthday-mails?dry_run=1
```

## Phase 1

- User signup/login foundation
- Booking page settings
- Duration: 30 / 45 / 60 minutes
- Buffer before/after: none / 15 / 30 minutes
- Booking range: 1 / 3 / 6 months
- Free plan limit: up to 3 months
- Pro plan limit: up to 6 months
- Questionnaire limits: free 2 questions, pro 5 questions
- Cat Key invite code: `Neko20240222`
- Booking form and booking list foundation
- Birthday message opt-in and birth-date insight foundation

## Phase 2

- Google Calendar connection
- Free/busy availability lookup
- Calendar event creation
- Google Meet auto creation
- Booking confirmation email
- Birthday email delivery

## Phase 3

- Paid-plan controls
- Group scheduling
- Customer management
- Appointment history
- AI summary
- Zoom integration

## Invite Code

The Cat Key code is:

```text
Neko20240222
```

Internally it is normalized as:

```text
NEKO20240222
```

Users who apply it receive pro capabilities without payment.

## Hosting note

本番は **Netlify 一本化**。`netlify.toml` / `netlify/functions/` / `netlify/edge-functions/` を使う。旧 Vercel 対応（`vercel.json` / `api/*` / `lib/vercel-adapter.js`）は 2026-06 に削除済み。
