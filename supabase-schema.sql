create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  invite_code text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  avatar_url text,
  slug text not null default 'demo',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  invite_code text,
  cat_key_disabled boolean not null default false,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists owners_slug_unique on owners(slug);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  owner_id uuid references owners(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  profile_url text not null default '',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references owners(id) on delete cascade,
  calendar_id text not null default 'primary',
  access_token text not null,
  refresh_token text,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists google_calendar_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  owner_id uuid references owners(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expiry_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists booking_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  owner_id uuid references owners(id) on delete cascade,
  slug text not null unique default 'demo',
  title text not null default 'Kimaru meeting',
  description text not null default '',
  duration_minutes int not null default 30 check (duration_minutes in (30, 45, 60)),
  buffer_before_minutes int not null default 0 check (buffer_before_minutes in (0, 15, 30)),
  buffer_after_minutes int not null default 0 check (buffer_after_minutes in (0, 15, 30)),
  booking_range_months int not null default 3 check (booking_range_months in (1, 2, 3, 6)),
  location_type text not null default 'google_meet' check (location_type in ('in_person', 'google_meet', 'zoom', 'phone', 'custom_url', 'later')),
  location_value text not null default '',
  timezone text not null default 'Asia/Tokyo',
  active boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists availability_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  owner_id uuid references owners(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  booking_page_id uuid references booking_pages(id) on delete set null,
  visitor_name text not null default '',
  visitor_email text not null default '',
  guest_name text not null default '',
  guest_email text not null default '',
  topic text not null default '',
  filter_request text not null default 'none',
  visitor_birth_date date,
  visitor_birth_date_private boolean not null default false,
  birthday_message_opt_in boolean not null default false,
  relationship_profile jsonb not null default '{}'::jsonb,
  start_at timestamptz,
  end_at timestamptz,
  start_time timestamptz,
  end_time timestamptz,
  meeting_url text not null default '',
  location_type text not null default 'google_meet',
  google_event_id text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'pending')),
  created_at timestamptz not null default now()
);

create table if not exists birthday_message_deliveries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  delivery_date date not null,
  provider_message_id text not null default '',
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error_message text not null default '',
  created_at timestamptz not null default now(),
  unique (booking_id, delivery_date)
);

create table if not exists reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade unique,
  provider_message_id text not null default '',
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error_message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists questionnaire_questions (
  id uuid primary key default gen_random_uuid(),
  booking_page_id uuid not null references booking_pages(id) on delete cascade,
  question_text text not null,
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists questionnaire_answers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  question_id uuid references questionnaire_questions(id) on delete set null,
  answer_text text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists appointment_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  visitor_email text not null,
  keywords text not null default '',
  notes text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists free_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  purpose text not null default '',
  invite_code text not null default '',
  language text not null default 'ja',
  created_at timestamptz not null default now()
);

create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_grant text not null default 'pro' check (plan_grant in ('free', 'pro')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_key_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  email text not null default '',
  action text not null default '',
  code text not null default '',
  ip_address text not null default '',
  user_agent text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cat_key_events_owner_id_created_at_idx on cat_key_events(owner_id, created_at desc);
create index if not exists cat_key_events_email_created_at_idx on cat_key_events(email, created_at desc);

insert into invite_codes (code, plan_grant, is_active)
values ('NEKO20240222', 'pro', true)
on conflict (code) do update set plan_grant = excluded.plan_grant, is_active = excluded.is_active;

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  provider text not null default 'square',
  provider_event_id text not null default '',
  event_type text not null default '',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table owners add column if not exists invite_code text;
alter table owners add column if not exists cat_key_disabled boolean not null default false;
alter table owners add column if not exists trial_ends_at timestamptz;
alter table booking_pages add column if not exists user_id uuid references users(id) on delete cascade;
alter table booking_pages add column if not exists buffer_before_minutes int not null default 0;
alter table booking_pages add column if not exists buffer_after_minutes int not null default 0;
alter table booking_pages add column if not exists booking_range_months int not null default 3;
-- 受付期間: 無料2ヶ月対応のため 2 を許可（既存DBの CHECK 制約も更新。issue #56）
alter table booking_pages drop constraint if exists booking_pages_booking_range_months_check;
alter table booking_pages add constraint booking_pages_booking_range_months_check check (booking_range_months in (1, 2, 3, 6));
alter table booking_pages add column if not exists location_type text not null default 'google_meet';
alter table booking_pages add column if not exists location_value text not null default '';
alter table booking_pages add column if not exists is_active boolean not null default true;
alter table bookings add column if not exists user_id uuid references users(id) on delete cascade;
alter table bookings add column if not exists guest_name text not null default '';
alter table bookings add column if not exists guest_email text not null default '';
alter table bookings add column if not exists visitor_birth_date date;
alter table bookings add column if not exists visitor_birth_date_private boolean not null default false;
alter table bookings add column if not exists birthday_message_opt_in boolean not null default false;
alter table bookings add column if not exists relationship_profile jsonb not null default '{}'::jsonb;
alter table bookings add column if not exists start_time timestamptz;
alter table bookings add column if not exists end_time timestamptz;
alter table bookings add column if not exists meeting_url text not null default '';
alter table bookings add column if not exists location_type text not null default 'google_meet';
alter table profiles add column if not exists data jsonb not null default '{}'::jsonb;
alter table free_signups add column if not exists invite_code text not null default '';
alter table free_signups add column if not exists language text not null default 'ja';
