create type public.admin_role as enum (
  'super_admin',
  'branch_admin'
);

alter table public.admin_users
add column role public.admin_role not null default 'super_admin';

create table public.admin_user_branch_access (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (admin_user_id, branch_id)
);

create index admin_user_branch_access_branch_id_idx
  on public.admin_user_branch_access (branch_id);

alter table public.admin_user_branch_access enable row level security;
