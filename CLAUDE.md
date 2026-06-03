# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

キマル (Kimaru) — a Japanese, free-first 1-on-1 scheduling tool. Static HTML/CSS/vanilla JS frontend + serverless functions + Supabase. **No build step, no test framework, no linter.** The product is built incrementally; the working language is Japanese.

## Commands

```bash
npm run dev      # netlify dev → http://localhost:8888 (serves public/ + functions at /api/*)
npm run deploy   # netlify deploy --prod
```

- There are **no tests, no lint, no build**. Don't invent them.
- DB changes: apply `supabase-schema.sql` manually in the Supabase SQL editor (no migration tool).
- Birthday-mail dry run: `GET /api/birthday-mails?dry_run=1` (returns targets/message without sending).

## Architecture (the non-obvious parts)

### Dual deploy, one set of handlers
Endpoint logic lives **once** in `netlify/functions/<name>.js` as a Netlify-style handler:
```js
exports.handler = async (event) => { /* event.httpMethod, event.headers, readJson(event) */ return json(200, {...}); }
```
`api/<name>.js` are thin Vercel adapters — each is ~3 lines that `require` the same Netlify handler and wrap it with `lib/vercel-adapter.js` (which converts a Vercel `req/res` into the Netlify `event` shape).

**To add an endpoint:** write the handler in `netlify/functions/`, then create the matching `api/<name>.js` adapter. Keep the handler framework-agnostic (use the `_lib` helpers, not Netlify/Vercel-specific APIs).

### Shared helpers — always use these (`netlify/functions/_lib/`)
- `response.js` — `json(status, body)`, `redirect(location)`, `readJson(event)`. Return these from handlers.
- `config.js` — `required(name)` (throws `Missing env var: X`), `optional(name, fallback)`, `appBaseUrl()`, `googleRedirectUri()`. Read env through these, never `process.env` directly.
- `supabase.js` — DB access via **Supabase REST (PostgREST) over `fetch`** using the service-role key; there is no Supabase client SDK. Build filters with the `eq()` helper and table-specific functions (`findOwnerById`, `upsertOwner`, …).
- `auth.js` — `currentOwner(event)` / `requireOwner(event)` (throws 401). Guard protected endpoints with `requireOwner`.
- `crypto.js` — HMAC-signed session cookie `kimaru_session` (30d, HttpOnly/Secure), and token encryption for stored Google tokens.
- `google.js` — Google OAuth + Calendar (freeBusy, event creation, Google Meet via conferenceData).

### Auth & accounts
Google OAuth (`google-auth-start` → `google-auth-callback`) upserts into the **`owners`** table and sets the `kimaru_session` cookie. `owners` is the **live** account table. Note the schema also contains legacy/aspirational duplicates that are **not** the source of truth: `users` (legacy of `owners`), `google_calendar_tokens` (legacy of `google_connections`), and duplicate columns on `bookings` (`visitor_*`/`guest_*`, `start_at`/`start_time`). Prefer `owners` / `google_connections` / `visitor_*` / `start_at`.

### Frontend (`public/`)
Vanilla JS, no framework. i18n is attribute-driven: `data-i18n` / `data-i18n-placeholder` / `data-i18n-title` resolved by `i18n.js` (`window.KimaruI18n`, languages ja/en/zh-TW, persisted in localStorage). `app.js` drives the admin/booking-settings screens; `booking-week.js` drives the guest booking grid. Pages call `/api/*` with `fetch`. Booking-page plan limits are enforced both client-side (`app.js`) and server-side (`booking-page-save.js`).

### Scheduled jobs
`birthday-mails.js` runs daily (Vercel Cron via `vercel.json`; Netlify Scheduled Functions on Netlify). On Vercel it is reached through a rewrite `/api/birthday-mails` → `/api/book?job=birthday-mails`. Email send uses Resend and stays in dry-run unless `RESEND_API_KEY` + `BIRTHDAY_EMAIL_FROM` are set.

## Hosting — read this before changing deploy config

The codebase supports **both** Netlify and Vercel, but the two sources disagree on which is primary:
- `README.md` states **Vercel** is primary (`kimaru-alpha.vercel.app`).
- `docs/open-decisions.md` (team decision, 2026-06-03) sets **Netlify as the current production target** (do not migrate to Vercel yet); Vercel kept for the future.

Treat `docs/open-decisions.md` as the current intent. `npm run dev`/`deploy` use Netlify. `netlify.toml` maps `/api/*` → `/.netlify/functions/`; `vercel.json` provides clean-URL rewrites + the cron.

## Required env vars
`APP_BASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `TOKEN_ENCRYPTION_KEY`. Optional: `SQUARE_WEBHOOK_SHARED_SECRET`, and birthday-mail vars (`RESEND_API_KEY`, `BIRTHDAY_EMAIL_FROM`, `BIRTHDAY_EMAIL_REPLY_TO`, `BIRTHDAY_CRON_SECRET`/`CRON_SECRET`). Missing a required var makes the relevant function throw at request time. See `.env.example`.

## Product spec lives in `docs/`
`docs/` is the authoritative product spec and decision log — consult it before implementing features. Start at `docs/README.md` (index), then `docs/open-decisions.md` (decisions + open/uncertain items), `docs/features/README.md` (per-feature specs + implementation priority), and `docs/db-schema.md` (real schema + legacy notes). Confirmed plan values: free vs pro = booking range 2mo/6mo, questionnaire 2/5 questions, booking pages 2/5, price ¥980/mo via Square. Cat Key invite code `Neko20240222` (normalized `NEKO20240222`) grants pro for free.

## Conventions
- CommonJS (`require`/`module.exports`); handlers export `{ handler }`.
- UI/copy is Japanese and must avoid poker-specific wording (general-audience product).
- Don't migrate Netlify→Vercel or rewrite the DB schema without explicit instruction.
