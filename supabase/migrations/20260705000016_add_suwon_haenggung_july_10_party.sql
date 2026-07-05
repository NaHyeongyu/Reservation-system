with target_branch as (
  select id
    from public.branches
   where name ilike '%수원행궁%'
     and status = 'active'
   order by created_at desc
   limit 1
),
template_party as (
  select
    p.title,
    p.show_headcount
    from public.parties p
    join target_branch b on b.id = p.branch_id
   order by p.start_at desc
   limit 1
),
party_values as (
  select
    b.id as branch_id,
    coalesce(t.title, '메인 파티') as title,
    timestamptz '2026-07-10 20:00:00+09' as start_at,
    interval '2 hours' as duration,
    12 as male_capacity,
    12 as female_capacity,
    coalesce(t.show_headcount, true) as show_headcount
    from target_branch b
    left join template_party t on true
)
insert into public.parties (
  branch_id,
  title,
  status,
  start_at,
  end_at,
  capacity,
  male_capacity,
  female_capacity,
  show_headcount
)
select
  branch_id,
  title,
  'published'::public.party_status,
  start_at,
  start_at + duration,
  male_capacity + female_capacity,
  male_capacity,
  female_capacity,
  show_headcount
  from party_values v
 where not exists (
   select 1
     from public.parties p
    where p.branch_id = v.branch_id
      and p.start_at >= timestamptz '2026-07-10 00:00:00+09'
      and p.start_at < timestamptz '2026-07-11 00:00:00+09'
 );

update public.parties p
   set title = '7월 10일 수원행궁점 파티',
       start_at = timestamptz '2026-07-10 20:00:00+09',
       end_at = timestamptz '2026-07-10 22:00:00+09',
       capacity = 24,
       male_capacity = 12,
       female_capacity = 12,
       show_headcount = true
  from public.branches b
 where b.id = p.branch_id
   and b.name ilike '%수원행궁%'
   and p.start_at >= timestamptz '2026-07-10 00:00:00+09'
   and p.start_at < timestamptz '2026-07-11 00:00:00+09';
