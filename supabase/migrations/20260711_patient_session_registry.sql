begin;

create table if not exists public.patient_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) = 64),
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoked_reason text check (revoked_reason is null or char_length(revoked_reason) <= 100),
  ip_hash text check (ip_hash is null or char_length(ip_hash) = 64),
  user_agent_hash text check (user_agent_hash is null or char_length(user_agent_hash) = 64),
  check (expires_at > created_at)
);

create index if not exists patient_sessions_patient_active_idx
  on public.patient_sessions (patient_id, expires_at)
  where revoked_at is null;

create index if not exists patient_sessions_expiry_idx
  on public.patient_sessions (expires_at);

alter table public.patient_sessions enable row level security;
revoke all on public.patient_sessions from public, anon, authenticated;
grant select, insert, update, delete on public.patient_sessions to service_role;

insert into public.app_schema_state (singleton, schema_version, applied_at)
values (true, '20260711.2', now())
on conflict (singleton) do update set
  schema_version = excluded.schema_version,
  applied_at = excluded.applied_at;

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
    'patient_sessions',
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
