create extension if not exists pgcrypto;

create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  avatar_url text,
  slug text not null default 'demo',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  invite_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists owners_slug_unique on owners(slug);

create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references owners(id) on delete cascade,
  calendar_id text not null default 'primary',
  access_token text not null,
  refresh_token text,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists booking_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  slug text not null unique,
  title text not null default 'Kimaru meeting',
  description text not null default '',
  duration_minutes int not null default 30,
  timezone text not null default 'Asia/Tokyo',
  active boolean not null default true,
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
  filter_request text not null default 'none',
  start_at timestamptz not null,
  end_at timestamptz not null,
  google_event_id text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
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

alter table free_signups add column if not exists invite_code text not null default '';
alter table free_signups add column if not exists language text not null default 'ja';

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  provider text not null default 'square',
  provider_event_id text not null default '',
  event_type text not null default '',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
