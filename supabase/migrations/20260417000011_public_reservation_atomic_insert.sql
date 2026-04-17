create or replace function public.create_public_reservation_atomic(
  p_party_id uuid,
  p_name text,
  p_phone text,
  p_gender text,
  p_birth_date date,
  p_bank_name text,
  p_account_number text,
  p_referral_sources text[] default '{}',
  p_party_terms_agreed boolean default true,
  p_privacy_agreed boolean default true,
  p_source public.reservation_source default 'web'
)
returns table (
  reservation_id uuid,
  reservation_code text,
  reservation_status public.reservation_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_party public.parties%rowtype;
  v_now timestamptz := now();
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := public.normalize_phone(p_phone);
  v_gender_capacity integer;
  v_gender_active_count integer := 0;
begin
  if p_gender not in ('male', 'female') then
    raise exception 'INVALID_GENDER';
  end if;

  if v_name = '' then
    raise exception 'EMPTY_NAME';
  end if;

  if length(v_phone) < 10 then
    raise exception 'INVALID_PHONE';
  end if;

  perform pg_advisory_xact_lock(
    hashtext('public_create_reservation'),
    hashtext(p_party_id::text)
  );

  select *
    into v_party
    from public.parties
   where id = p_party_id
     and status = 'published'
     and start_at > v_now
   for update;

  if not found then
    raise exception 'PARTY_NOT_AVAILABLE';
  end if;

  if exists (
    select 1
      from public.reservations
     where party_id = p_party_id
       and public.normalize_phone(reserver_phone) = v_phone
       and status in ('pending', 'confirmed', 'waitlisted')
  ) then
    raise exception 'DUPLICATE_PHONE';
  end if;

  v_gender_capacity :=
    case
      when p_gender = 'male' then v_party.male_capacity
      else v_party.female_capacity
    end;

  select count(*)
    into v_gender_active_count
    from public.reservations
   where party_id = p_party_id
     and applicant_gender = p_gender
     and status in ('pending', 'confirmed', 'completed');

  insert into public.reservations (
    branch_id,
    party_id,
    source,
    status,
    reserver_name,
    reserver_phone,
    participant_count,
    applicant_gender,
    applicant_birth_date,
    bank_name,
    account_number,
    referral_sources,
    party_terms_agreed,
    privacy_agreed,
    party_terms_agreed_at,
    privacy_agreed_at
  )
  values (
    v_party.branch_id,
    p_party_id,
    coalesce(p_source, 'web'),
    case
      when v_gender_active_count >= v_gender_capacity then 'waitlisted'
      else 'pending'
    end,
    v_name,
    v_phone,
    1,
    p_gender,
    p_birth_date,
    btrim(coalesce(p_bank_name, '')),
    btrim(coalesce(p_account_number, '')),
    coalesce(p_referral_sources, '{}'),
    coalesce(p_party_terms_agreed, true),
    coalesce(p_privacy_agreed, true),
    v_now,
    v_now
  )
  returning id, reservation_code, status
    into reservation_id, reservation_code, reservation_status;

  insert into public.participants (
    reservation_id,
    full_name,
    phone,
    is_primary,
    status
  )
  values (
    reservation_id,
    v_name,
    v_phone,
    true,
    'active'
  );

  return next;
exception
  when unique_violation then
    if sqlerrm like '%reservations_party_phone_active_unique_idx%' then
      raise exception 'DUPLICATE_PHONE';
    end if;

    raise;
end;
$$;
