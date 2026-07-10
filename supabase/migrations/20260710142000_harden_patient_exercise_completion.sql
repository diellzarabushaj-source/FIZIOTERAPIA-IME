alter table public.exercise_logs
  add column if not exists completed_on date;

update public.exercise_logs
set completed_on = (timezone('Europe/Belgrade', coalesce(completed_at, now())))::date
where completed_on is null;

alter table public.exercise_logs
  alter column completed_on set default ((timezone('Europe/Belgrade', now()))::date),
  alter column completed_on set not null;

update public.exercise_logs
set comment = left(comment, 500)
where comment is not null and char_length(comment) > 500;

alter table public.exercise_logs
  drop constraint if exists exercise_logs_comment_length_check;

alter table public.exercise_logs
  add constraint exercise_logs_comment_length_check
  check (comment is null or char_length(comment) <= 500);

with ranked as (
  select id,
         row_number() over (
           partition by patient_id, plan_exercise_id, completed_on
           order by completed_at desc nulls last, id desc
         ) as rn
  from public.exercise_logs
  where completed is true
    and patient_id is not null
    and plan_exercise_id is not null
)
delete from public.exercise_logs el
using ranked r
where el.id = r.id
  and r.rn > 1;

create unique index if not exists exercise_logs_one_completion_per_day_idx
  on public.exercise_logs (patient_id, plan_exercise_id, completed_on)
  where completed is true;

create index if not exists exercise_logs_patient_day_idx
  on public.exercise_logs (patient_id, completed_on desc, completed_at desc);

create or replace function public.record_patient_exercise_completion(
  p_patient_id uuid,
  p_plan_exercise_id uuid,
  p_pain_score integer,
  p_comment text default null
)
returns table (
  log_id uuid,
  patient_id uuid,
  plan_exercise_id uuid,
  completed boolean,
  pain_score integer,
  comment text,
  completed_at timestamptz,
  completed_on date,
  was_created boolean,
  previous_pain_score integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (timezone('Europe/Belgrade', now()))::date;
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
  v_existing public.exercise_logs%rowtype;
  v_row public.exercise_logs%rowtype;
begin
  if p_patient_id is null or p_plan_exercise_id is null then
    raise exception using errcode = '22023', message = 'Patient and exercise are required.';
  end if;

  if p_pain_score is null or p_pain_score < 0 or p_pain_score > 10 then
    raise exception using errcode = '22023', message = 'Pain score must be between 0 and 10.';
  end if;

  if v_comment is not null and char_length(v_comment) > 500 then
    raise exception using errcode = '22001', message = 'Comment is too long.';
  end if;

  if not exists (
    select 1
    from public.patients pa
    join public.plans pl
      on pl.patient_id = pa.id
     and pl.status = 'active'
    join public.plan_exercises pe
      on pe.plan_id = pl.id
    where pa.id = p_patient_id
      and pa.status = 'active'
      and pe.id = p_plan_exercise_id
  ) then
    raise exception using errcode = '42501', message = 'Exercise is not assigned to the active patient plan.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_patient_id::text || ':' || p_plan_exercise_id::text || ':' || v_today::text,
      0
    )
  );

  select el.*
  into v_existing
  from public.exercise_logs el
  where el.patient_id = p_patient_id
    and el.plan_exercise_id = p_plan_exercise_id
    and el.completed_on = v_today
    and el.completed is true
  for update;

  if found then
    update public.exercise_logs el
    set pain_score = p_pain_score,
        comment = v_comment,
        completed_at = now(),
        completed = true
    where el.id = v_existing.id
    returning el.* into v_row;

    return query
    select v_row.id, v_row.patient_id, v_row.plan_exercise_id, v_row.completed,
           v_row.pain_score, v_row.comment, v_row.completed_at, v_row.completed_on,
           false, v_existing.pain_score;
  else
    insert into public.exercise_logs (
      patient_id,
      plan_exercise_id,
      completed,
      pain_score,
      comment,
      completed_at,
      completed_on
    )
    values (
      p_patient_id,
      p_plan_exercise_id,
      true,
      p_pain_score,
      v_comment,
      now(),
      v_today
    )
    returning * into v_row;

    return query
    select v_row.id, v_row.patient_id, v_row.plan_exercise_id, v_row.completed,
           v_row.pain_score, v_row.comment, v_row.completed_at, v_row.completed_on,
           true, null::integer;
  end if;
end;
$$;

revoke all on function public.record_patient_exercise_completion(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.record_patient_exercise_completion(uuid, uuid, integer, text)
  to service_role;
