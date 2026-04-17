alter table public.reservations
add column if not exists applicant_gender text,
add column if not exists applicant_birth_date date,
add column if not exists bank_name text,
add column if not exists account_number text,
add column if not exists referral_sources text[] not null default '{}',
add column if not exists party_terms_agreed boolean not null default false,
add column if not exists privacy_agreed boolean not null default false,
add column if not exists party_terms_agreed_at timestamptz,
add column if not exists privacy_agreed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservations_applicant_gender_check'
  ) then
    alter table public.reservations
    add constraint reservations_applicant_gender_check
    check (applicant_gender is null or applicant_gender in ('male', 'female'));
  end if;
end
$$;

create index if not exists reservations_party_gender_status_idx
  on public.reservations (party_id, applicant_gender, status, submitted_at desc);
