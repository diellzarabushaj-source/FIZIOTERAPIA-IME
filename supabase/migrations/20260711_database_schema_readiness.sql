begin;

create table if not exists public.app_schema_state (
  singleton boolean primary key default true check (singleton),
  schema_version text not null,
  applied_at timestamptz not null default now()
);

insert into public.app_schema_state (singleton, schema_version, applied_at)
values (true, '20260711.1', now())
on conflict (singleton) do update set
  schema_version = excluded.schema_version,
  applied_at = excluded.applied_at;

alter table public.app_schema_state enable row level security;
revoke all on public.app_schema_state from public, anon, authenticated;
grant select on public.app_schema_state to service_role;

create or replace function public.deployment_readiness(p_expected_version text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_schema_version text;
  v_missing_tables text[];
  v_missing_functions text[];
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role required' using errcode = '42501';
  end if;

  select schema_version
  into v_schema_version
  from public.app_schema_state
  where singleton = true;

  select coalesce(array_agg(required_name order by required_name), array[]::text[])
  into v_missing_tables
  from unnest(array[
    'profiles',
    'patients',
    'exercise_library',
    'plans',
    'plan_exercises',
    'exercise_logs',
    'audit_logs',
    'clinical_alerts',
    'app_notifications',
    'payment_requests'
  ]::text[]) as required_name
  where to_regclass(format('public.%I', required_name)) is null;

  select coalesce(array_agg(required_name order by required_name), array[]::text[])
  into v_missing_functions
  from unnest(array[
    'activate_plan_safely',
    'check_patient_login_attempt',
    'create_or_get_patient',
    'record_patient_exercise_completion',
    'record_patient_login_result'
  ]::text[]) as required_name
  where not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = required_name
  );

  return jsonb_build_object(
    'ready',
      v_schema_version = p_expected_version
      and cardinality(v_missing_tables) = 0
      and cardinality(v_missing_functions) = 0,
    'schema_version', v_schema_version,
    'expected_schema_version', p_expected_version,
    'missing_tables', v_missing_tables,
    'missing_functions', v_missing_functions,
    'checked_at', now()
  );
end;
$$;

revoke all on function public.deployment_readiness(text) from public, anon, authenticated;
grant execute on function public.deployment_readiness(text) to service_role;

commit;
