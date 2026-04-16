alter table public.parties
drop column if exists description,
drop column if exists reservation_open_at,
drop column if exists reservation_close_at,
drop column if exists waitlist_capacity,
drop column if exists max_reservation_size,
drop column if exists price_amount,
drop column if exists currency_code,
drop column if exists public_note,
drop column if exists internal_note;
