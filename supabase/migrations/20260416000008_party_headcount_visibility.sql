alter table public.parties
add column if not exists show_headcount boolean not null default true;
