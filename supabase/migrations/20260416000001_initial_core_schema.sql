create extension if not exists pgcrypto;

create type public.branch_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.party_status as enum (
  'draft',
  'published',
  'closed',
  'cancelled',
  'completed'
);

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'waitlisted',
  'cancelled',
  'rejected',
  'completed',
  'no_show'
);

create type public.reservation_source as enum (
  'web',
  'app',
  'admin',
  'import'
);

create type public.participant_status as enum (
  'active',
  'cancelled',
  'checked_in',
  'no_show'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status public.branch_status not null default 'active',
  phone text,
  email text,
  address text,
  timezone text not null default 'Asia/Seoul',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete restrict,
  title text not null,
  description text,
  status public.party_status not null default 'draft',
  start_at timestamptz not null,
  end_at timestamptz not null,
  reservation_open_at timestamptz,
  reservation_close_at timestamptz,
  capacity integer not null check (capacity > 0),
  waitlist_capacity integer not null default 0 check (waitlist_capacity >= 0),
  max_reservation_size integer not null default 1 check (max_reservation_size > 0),
  price_amount numeric(10, 2) not null default 0 check (price_amount >= 0),
  currency_code char(3) not null default 'KRW',
  public_note text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parties_end_after_start check (end_at > start_at)
);

create unique index parties_id_branch_id_key
  on public.parties (id, branch_id);

create unique index parties_branch_title_start_at_key
  on public.parties (branch_id, title, start_at);

create index parties_branch_status_start_at_idx
  on public.parties (branch_id, status, start_at desc);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_code text not null unique default (
    'RSV-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10))
  ),
  branch_id uuid not null,
  party_id uuid not null,
  source public.reservation_source not null default 'web',
  status public.reservation_status not null default 'pending',
  reserver_name text not null,
  reserver_phone text not null,
  reserver_email text,
  participant_count integer not null check (participant_count > 0),
  request_note text,
  admin_note text,
  submitted_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  rejected_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_party_branch_fk
    foreign key (party_id, branch_id)
    references public.parties (id, branch_id)
    on delete restrict
);

create unique index reservations_id_party_id_key
  on public.reservations (id, party_id);

create index reservations_branch_status_submitted_at_idx
  on public.reservations (branch_id, status, submitted_at desc);

create index reservations_party_status_submitted_at_idx
  on public.reservations (party_id, status, submitted_at desc);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  is_primary boolean not null default false,
  status public.participant_status not null default 'active',
  checked_in_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index participants_reservation_status_idx
  on public.participants (reservation_id, status);

create unique index participants_one_primary_per_reservation_idx
  on public.participants (reservation_id)
  where is_primary = true;

create trigger set_branches_updated_at
before update on public.branches
for each row
execute function public.set_updated_at();

create trigger set_parties_updated_at
before update on public.parties
for each row
execute function public.set_updated_at();

create trigger set_reservations_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

create trigger set_participants_updated_at
before update on public.participants
for each row
execute function public.set_updated_at();

alter table public.branches enable row level security;
alter table public.parties enable row level security;
alter table public.reservations enable row level security;
alter table public.participants enable row level security;
