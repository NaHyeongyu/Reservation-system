create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  login_id text not null unique,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;

create policy "admin_users_select_self"
on public.admin_users
for select
using (auth.uid() = auth_user_id);
