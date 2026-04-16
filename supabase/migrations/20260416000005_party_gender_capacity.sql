alter table public.parties
add column male_capacity integer,
add column female_capacity integer;

update public.parties
set
  male_capacity = greatest((capacity + 1) / 2, 0),
  female_capacity = greatest(capacity / 2, 0)
where male_capacity is null or female_capacity is null;

alter table public.parties
alter column male_capacity set not null,
alter column female_capacity set not null;

alter table public.parties
add constraint parties_male_capacity_non_negative check (male_capacity >= 0),
add constraint parties_female_capacity_non_negative check (female_capacity >= 0);
