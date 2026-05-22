create extension if not exists pgcrypto;

create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  picture_url text not null default '',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  pro_source text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calendar_connections (
  owner_id uuid primary key references owners(id) on delete cascade,
  google_email text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists booking_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  slug text not null unique,
  title text not null default 'Kimaru Meeting',
  description text not null default '',
  duration_minutes int not null default 30,
  timezone text not null default 'Asia/Tokyo',
  weekday_start int not null default 1,
  weekday_end int not null default 5,
  day_start_time text not null default '10:00',
  day_end_time text not null default '17:00',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  booking_page_id uuid references booking_pages(id) on delete set null,
  visitor_name text not null,
  visitor_email text not null,
  topic text not null default '',
  start_at timestamptz not null,
  end_at timestamptz not null,
  google_event_id text not null default '',
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists appointment_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  person_name text not null default '',
  body text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists invite_codes (
  code text primary key,
  plan text not null default 'pro',
  max_uses int not null default 1,
  used_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

insert into invite_codes (code, plan, max_uses, active)
values ('JF7YAIN40EQL', 'pro', 100, true)
on conflict (code) do nothing;

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  provider text not null default 'square',
  provider_event_id text not null default '',
  event_type text not null default '',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
