# Kimaru

Kimaru is a scheduling MVP for meetings that should start warmer and convert better.

It includes:

- Free signup
- Booking page
- Google login
- Google Calendar availability check
- Calendar event creation with 15-minute reminders
- Pro invite code: `JF7YAIN40EQL`
- Appointment logs
- Simple admin dashboard
- Square webhook placeholder for paid plan upgrades

## Deploy

Use Netlify with this GitHub repository.

Build settings:

- Build command: none
- Publish directory: `public`
- Functions directory: `netlify/functions`

Required environment variables:

- `APP_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Optional:

- `SQUARE_WEBHOOK_SHARED_SECRET`

## Database

Run `supabase-schema.sql` in Supabase SQL Editor before using the app.

## Google OAuth

Set the Google OAuth redirect URI to:

`https://YOUR-NETLIFY-SITE.netlify.app/api/google-auth-callback`

Then set `APP_BASE_URL` to the same site URL without a trailing slash.

## Notes

This is a practical MVP, not the final polished product. The next production steps are Japanese UI copy, official Square signature verification, cancellation/reschedule flows, and stronger privacy controls for shared relationship notes.
