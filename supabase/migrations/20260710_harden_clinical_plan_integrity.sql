create unique index if not exists plans_one_active_per_patient_idx
on public.plans(patient_id)
where status = 'active';

create or replace function public.enforce_plan_exercise_editable()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_plan_id uuid := coalesce(new.plan_id, old.plan_id);
  v_status text;
begin
  select status into v_status from public.plans where id = v_plan_id for update;
  if v_status is distinct from 'draft' then
    raise exception 'Plan exercises may only be changed while the plan is draft';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists plan_exercises_draft_only on public.plan_exercises;
create trigger plan_exercises_draft_only
before insert or update or delete on public.plan_exercises
for each row execute function public.enforce_plan_exercise_editable();

create or replace function public.enforce_plan_status_transition()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if old.status = new.status then return new; end if;

  if not (
    (old.status = 'draft' and new.status in ('pending_review','archived')) or
    (old.status = 'pending_review' and new.status in ('draft','approved','archived')) or
    (old.status = 'approved' and new.status in ('active','draft','archived')) or
    (old.status = 'active' and new.status in ('paused','completed','archived')) or
    (old.status = 'paused' and new.status in ('active','completed','archived')) or
    (old.status = 'completed' and new.status = 'archived')
  ) then
    raise exception 'Invalid plan status transition: % -> %', old.status, new.status;
  end if;

  if new.status in ('pending_review','approved','active') and not exists (
    select 1 from public.plan_exercises where plan_id = new.id
  ) then
    raise exception 'A plan needs at least one exercise before review or activation';
  end if;

  return new;
end;
$$;

drop trigger if exists plans_status_transition_guard on public.plans;
create trigger plans_status_transition_guard
before update of status on public.plans
for each row execute function public.enforce_plan_status_transition();

create or replace function public.transition_plan_safely(
  p_plan_id uuid,
  p_expected_status text,
  p_target_status text
)
returns public.plans
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_plan public.plans%rowtype;
begin
  select * into v_plan from public.plans where id = p_plan_id for update;
  if not found then raise exception 'Plan not found'; end if;
  if v_plan.status <> p_expected_status then raise exception 'Plan changed concurrently'; end if;

  if p_target_status = 'active' then
    update public.plans
    set status = 'archived'
    where patient_id = v_plan.patient_id and status = 'active' and id <> p_plan_id;
  end if;

  update public.plans set status = p_target_status where id = p_plan_id returning * into v_plan;
  return v_plan;
end;
$$;

revoke all on function public.transition_plan_safely(uuid, text, text) from public, anon, authenticated;
grant execute on function public.transition_plan_safely(uuid, text, text) to service_role;
