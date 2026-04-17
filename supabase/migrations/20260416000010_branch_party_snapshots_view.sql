create or replace view public.branch_party_snapshots as
select
  p.id,
  p.branch_id,
  p.title,
  p.status,
  p.start_at,
  p.end_at,
  p.capacity,
  p.male_capacity,
  p.female_capacity,
  coalesce(p.show_headcount, true) as show_headcount,
  count(*) filter (
    where r.applicant_gender = 'male'
      and r.status in ('pending', 'confirmed', 'waitlisted', 'completed')
  )::integer as male_applied,
  count(*) filter (
    where r.applicant_gender = 'female'
      and r.status in ('pending', 'confirmed', 'waitlisted', 'completed')
  )::integer as female_applied,
  count(*) filter (
    where r.applicant_gender = 'male'
      and r.status in ('pending', 'waitlisted')
  )::integer as male_applicant_count,
  count(*) filter (
    where r.applicant_gender = 'female'
      and r.status in ('pending', 'waitlisted')
  )::integer as female_applicant_count,
  count(*) filter (
    where r.applicant_gender = 'male'
      and r.status = 'waitlisted'
  )::integer as male_waitlist_count,
  count(*) filter (
    where r.applicant_gender = 'female'
      and r.status = 'waitlisted'
  )::integer as female_waitlist_count,
  count(*) filter (
    where r.applicant_gender = 'male'
      and r.status in ('confirmed', 'completed')
  )::integer as male_participant_count,
  count(*) filter (
    where r.applicant_gender = 'female'
      and r.status in ('confirmed', 'completed')
  )::integer as female_participant_count
from public.parties p
left join public.reservations r
  on r.party_id = p.id
  and r.branch_id = p.branch_id
group by p.id;
