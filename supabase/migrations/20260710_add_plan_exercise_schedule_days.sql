-- Store every day on which a plan exercise should appear.
-- day_number remains for compatibility and mirrors the first scheduled day.
alter table public.plan_exercises
  add column if not exists schedule_days integer[] not null default array[1];

update public.plan_exercises
set schedule_days = array[greatest(1, coalesce(day_number, 1))]
where schedule_days is null
   or cardinality(schedule_days) = 0;

alter table public.plan_exercises
  drop constraint if exists plan_exercises_schedule_days_count;

alter table public.plan_exercises
  add constraint plan_exercises_schedule_days_count
  check (cardinality(schedule_days) between 1 and 90);

create index if not exists plan_exercises_schedule_days_idx
  on public.plan_exercises using gin (schedule_days);
