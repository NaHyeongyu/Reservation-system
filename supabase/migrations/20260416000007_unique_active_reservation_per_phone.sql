create or replace function public.normalize_phone(value text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g')
$$;

create unique index if not exists reservations_party_phone_active_unique_idx
  on public.reservations (party_id, public.normalize_phone(reserver_phone))
  where status in ('pending', 'confirmed', 'waitlisted');
