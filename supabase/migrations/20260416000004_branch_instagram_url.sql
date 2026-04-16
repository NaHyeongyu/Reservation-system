alter table public.branches
add column instagram_url text;

alter table public.branches
drop column slug cascade;
