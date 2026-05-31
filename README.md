# Kimaru

Kimaru is a free-first scheduling tool for meetings that should feel easier before they begin.

The product direction is simple:

> 会う前に、相手を知る。  
> 会った後に、ご縁が育つ。  
> 予定を決めるだけでなく、明るい未来につながる出会いを増やす。

## Target Architecture

- Frontend: Vercel free tier preferred for the public app
- Database: Supabase
- Auth: Supabase Auth or Google login
- Calendar: Google Calendar API
- Meeting: Google Meet auto creation first
- Future meeting provider: Zoom-ready design, not required in Phase 1

The current MVP still includes Netlify Functions. The product spec and database now target the Vercel + Supabase direction, while the existing Netlify API can keep running during migration.

## Phase 1 Scope

- Supabase schema for users, profiles, booking pages, availability, bookings, questionnaire, Google tokens, and invite codes
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

## Phase 2 Scope

- Google Calendar connection
- Free/busy availability lookup
- Calendar event creation
- Google Meet auto creation
- Booking confirmation email

## Phase 3 Scope

- Paid-plan controls
- Group scheduling
- Customer management
- Appointment history
- AI summary
- Zoom integration

## Deploy

Preferred final deployment is Vercel for the frontend with Supabase as the backend database.

Current MVP deployment can still use Netlify with this GitHub repository:

- Build command: none
- Publish directory: `public`
- Functions directory: `netlify/functions`

Required environment variables for the current MVP:

- `APP_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `TOKEN_ENCRYPTION_KEY`

## Database

Run `supabase-schema.sql` in the Supabase SQL Editor before using the app.

The schema includes compatibility tables for the current MVP (`owners`, `google_connections`) and the forward product model (`users`, `profiles`, `google_calendar_tokens`).

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
