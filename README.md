# Kimaru

Kimaru is a free-first scheduling tool for meetings that should feel easier before they begin.

> 会う前に、相手を知る。  
> 会った後に、ご縁が育つ。  
> 予定を決めるだけでなく、明るい未来につながる出会いを増やす。

## Production

Primary production deployment:

```text
https://kimaru-alpha.vercel.app
```

The project is deployed on Vercel as `kimaru` under Fumio Uchiyama's projects.

## Architecture

Primary deployment is now Vercel + Supabase.

- Frontend: Vercel free tier, static files in `public/`
- API: Vercel Functions in `api/`
- Database: Supabase
- Auth: Google login now, Supabase Auth-ready schema
- Calendar: Google Calendar API
- Meeting: Google Meet auto creation first
- Future meeting provider: Zoom-ready design

The legacy Netlify Functions remain in `netlify/functions/` as reusable handlers. Vercel routes in `api/` call those handlers through a small adapter so the app can move to Vercel without rewriting every endpoint at once.

## Vercel Deploy

Create a Vercel project from this repository.

Settings:

- Framework preset: Other
- Build command: empty
- Output directory: empty
- Install command: empty

`vercel.json` handles clean URLs and keeps `/api/*` as Vercel Functions.

Required environment variables:

- `APP_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Set `APP_BASE_URL` to:

```text
https://kimaru-alpha.vercel.app
```

Google OAuth redirect URI:

```text
https://kimaru-alpha.vercel.app/api/google-auth-callback
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

Compatibility tables for the current Google-login MVP also remain:

- `owners`
- `google_connections`

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

## Phase 2

- Google Calendar connection
- Free/busy availability lookup
- Calendar event creation
- Google Meet auto creation
- Booking confirmation email

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

## Legacy Netlify

Netlify support is now secondary. `netlify.toml` and `netlify/functions/` remain so the current Netlify deployment can keep running during transition, but new production deployments should use Vercel.
