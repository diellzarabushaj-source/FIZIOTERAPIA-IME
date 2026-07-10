-- Final backend hardening. Apply after the other 20260710 migrations.

create or replace function public.activate_plan_safely(
  p_plan_id uuid,
  p_expected_status text,
  p_actor_profile_id uuid
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
  if v_plan.status not in ('approved', 'paused') then raise exception 'Plan is not eligible for activation'; end if;

  -- The application has already authenticated the actor. This extra check blocks
  -- a service-layer programming error from activating another physio's plan.
  if v_plan.physio_id is distinct from p_actor_profile_id and not exists (
    select 1 from public.profiles p
    where p.id = p_actor_profile_id and p.role in ('owner', 'admin') and coalesce(p.status, 'pending') = 'active'
  ) then
    raise exception 'Actor cannot activate this plan';
  end if;

  update public.plans
  set status = 'archived'
  where patient_id = v_plan.patient_id and status = 'active' and id <> p_plan_id;

  update public.plans
  set status = 'active', updated_at = now()
  where id = p_plan_id and status = p_expected_status
  returning * into v_plan;

  if not found then raise exception 'Plan changed concurrently'; end if;
  return v_plan;
end;
$$;

revoke all on function public.activate_plan_safely(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.activate_plan_safely(uuid, text, uuid) to service_role;

-- Browser clients must never query clinical or billing data directly. The Next.js
-- server authenticates users and performs scoped service-role operations.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','patients','plans','plan_exercises','exercise_library','exercise_logs',
    'pain_logs','ai_checks','patient_messages','audit_logs','notification_logs',
    'subscriptions','payment_requests'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on table public.%I from anon, authenticated', table_name);
    end if;
  end loop;
end;
$$;

-- Prevent accidental hard deletion of clinical records. Archiving/status changes
-- are used instead. Service-role deletions are blocked too unless this trigger is
-- deliberately removed in a controlled migration.
create or replace function public.prevent_clinical_hard_delete()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  raise exception 'Clinical records must be archived, not hard deleted';
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['patients','plans','exercise_logs','pain_logs','ai_checks','patient_messages'] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('drop trigger if exists prevent_%I_hard_delete on public.%I', table_name, table_name);
      execute format('create trigger prevent_%I_hard_delete before delete on public.%I for each row execute function public.prevent_clinical_hard_delete()', table_name, table_name);
    end if;
  end loop;
end;
$$;
