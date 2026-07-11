begin;

alter table public.exercise_library
  add column if not exists is_default boolean not null default true,
  add column if not exists owner_physio_id uuid references public.profiles(id) on delete cascade,
  add column if not exists status text not null default 'published',
  add column if not exists updated_at timestamptz not null default now();

-- Rows that existed before private libraries were introduced are global defaults.
update public.exercise_library
set is_default = true,
    status = coalesce(nullif(status, ''), 'published'),
    updated_at = coalesce(updated_at, created_at, now())
where owner_physio_id is null;

create index if not exists exercise_library_visibility_idx
  on public.exercise_library (status, is_default, owner_physio_id);
create index if not exists exercise_library_owner_status_idx
  on public.exercise_library (owner_physio_id, status)
  where owner_physio_id is not null;

create or replace function public.touch_exercise_library_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists exercise_library_touch_updated_at on public.exercise_library;
create trigger exercise_library_touch_updated_at
before update on public.exercise_library
for each row execute function public.touch_exercise_library_updated_at();

insert into public.app_schema_state (singleton, schema_version, applied_at)
values (true, '20260711.4', now())
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
  v_missing_columns text[];
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
    'patient_auth_sessions',
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

  select coalesce(array_agg(required_column order by required_column), array[]::text[])
  into v_missing_columns
  from (
    values
      ('patient_sessions.session_date', 'patient_sessions', 'session_date'),
      ('patient_sessions.physio_id', 'patient_sessions', 'physio_id'),
      ('patient_auth_sessions.token_hash', 'patient_auth_sessions', 'token_hash'),
      ('patient_auth_sessions.expires_at', 'patient_auth_sessions', 'expires_at'),
      ('patient_auth_sessions.revoked_at', 'patient_auth_sessions', 'revoked_at'),
      ('exercise_library.is_default', 'exercise_library', 'is_default'),
      ('exercise_library.owner_physio_id', 'exercise_library', 'owner_physio_id'),
      ('exercise_library.status', 'exercise_library', 'status'),
      ('exercise_library.updated_at', 'exercise_library', 'updated_at')
  ) as required(required_column, table_name, column_name)
  where not exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = required.table_name
      and c.column_name = required.column_name
  );

  select coalesce(array_agg(required_name order by required_name), array[]::text[])
  into v_missing_functions
  from unnest(array[
    'activate_plan_safely',
    'check_patient_login_attempt',
    'create_or_get_patient',
    'record_patient_exercise_completion',
    'record_patient_login_result',
    'rotate_patient_access_code'
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
      and cardinality(v_missing_columns) = 0
      and cardinality(v_missing_functions) = 0,
    'schema_version', v_schema_version,
    'expected_schema_version', p_expected_version,
    'missing_tables', v_missing_tables,
    'missing_columns', v_missing_columns,
    'missing_functions', v_missing_functions,
    'checked_at', now()
  );
end;
$$;

revoke all on function public.deployment_readiness(text) from public, anon, authenticated;
grant execute on function public.deployment_readiness(text) to service_role;

commit;
