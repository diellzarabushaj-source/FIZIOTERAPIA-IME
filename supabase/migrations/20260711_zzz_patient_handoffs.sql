begin;

create table if not exists public.patient_handoffs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  from_physio_id uuid not null references public.profiles(id) on delete restrict,
  to_physio_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  note text null,
  consent_confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  responded_at timestamptz null,
  responded_by uuid null references public.profiles(id) on delete set null,
  cancelled_at timestamptz null,
  updated_at timestamptz not null default now(),
  check (from_physio_id <> to_physio_id)
);

create unique index if not exists patient_handoffs_one_pending_per_patient_idx
  on public.patient_handoffs (patient_id)
  where status = 'pending';
create index if not exists patient_handoffs_sender_status_idx
  on public.patient_handoffs (from_physio_id, status, created_at desc);
create index if not exists patient_handoffs_recipient_status_idx
  on public.patient_handoffs (to_physio_id, status, created_at desc);

alter table public.patient_handoffs enable row level security;
revoke all on table public.patient_handoffs from public, anon, authenticated;
grant select, insert, update on table public.patient_handoffs to service_role;

create or replace function public.touch_patient_handoff_updated_at()
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

drop trigger if exists patient_handoffs_touch_updated_at on public.patient_handoffs;
create trigger patient_handoffs_touch_updated_at
before update on public.patient_handoffs
for each row execute function public.touch_patient_handoff_updated_at();

create or replace function public.create_patient_handoff(
  p_patient_id uuid,
  p_from_physio_id uuid,
  p_to_physio_id uuid,
  p_note text default null
)
returns public.patient_handoffs
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_patient public.patients%rowtype;
  v_handoff public.patient_handoffs%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role required' using errcode = '42501';
  end if;

  if p_from_physio_id is null or p_to_physio_id is null or p_from_physio_id = p_to_physio_id then
    raise exception 'invalid physiotherapist handoff' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_from_physio_id and role = 'physio' and status = 'active'
  ) then
    raise exception 'sender physiotherapist is not active' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_to_physio_id and role = 'physio' and status = 'active'
  ) then
    raise exception 'recipient physiotherapist is not active' using errcode = '22023';
  end if;

  select * into v_patient
  from public.patients
  where id = p_patient_id
  for update;

  if not found then
    raise exception 'patient not found' using errcode = 'P0002';
  end if;
  if v_patient.physio_id <> p_from_physio_id then
    raise exception 'patient ownership mismatch' using errcode = '42501';
  end if;
  if v_patient.status <> 'active' or v_patient.archived_at is not null then
    raise exception 'patient is not active' using errcode = '22023';
  end if;

  if v_patient.identity_key is not null and exists (
    select 1 from public.patients
    where physio_id = p_to_physio_id
      and identity_key = v_patient.identity_key
      and id <> v_patient.id
      and archived_at is null
  ) then
    raise exception 'recipient already has matching patient' using errcode = '23505';
  end if;

  if exists (
    select 1 from public.patient_handoffs
    where patient_id = p_patient_id and status = 'pending'
  ) then
    raise exception 'patient already has pending handoff' using errcode = '23505';
  end if;

  insert into public.patient_handoffs (
    patient_id,
    from_physio_id,
    to_physio_id,
    status,
    note,
    consent_confirmed_at
  ) values (
    p_patient_id,
    p_from_physio_id,
    p_to_physio_id,
    'pending',
    nullif(trim(coalesce(p_note, '')), ''),
    now()
  )
  returning * into v_handoff;

  return v_handoff;
end;
$$;

create or replace function public.respond_patient_handoff(
  p_handoff_id uuid,
  p_recipient_physio_id uuid,
  p_decision text
)
returns public.patient_handoffs
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_handoff public.patient_handoffs%rowtype;
  v_patient public.patients%rowtype;
  v_decision text := lower(trim(coalesce(p_decision, '')));
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role required' using errcode = '42501';
  end if;
  if v_decision not in ('accepted', 'declined') then
    raise exception 'invalid handoff decision' using errcode = '22023';
  end if;

  select * into v_handoff
  from public.patient_handoffs
  where id = p_handoff_id
  for update;

  if not found then
    raise exception 'handoff not found' using errcode = 'P0002';
  end if;
  if v_handoff.status <> 'pending' then
    raise exception 'handoff already resolved' using errcode = '40001';
  end if;
  if v_handoff.to_physio_id <> p_recipient_physio_id then
    raise exception 'handoff recipient mismatch' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = p_recipient_physio_id and role = 'physio' and status = 'active'
  ) then
    raise exception 'recipient physiotherapist is not active' using errcode = '42501';
  end if;

  if v_decision = 'declined' then
    update public.patient_handoffs
    set status = 'declined', responded_at = now(), responded_by = p_recipient_physio_id
    where id = v_handoff.id
    returning * into v_handoff;
    return v_handoff;
  end if;

  select * into v_patient
  from public.patients
  where id = v_handoff.patient_id
  for update;

  if not found then
    raise exception 'patient not found' using errcode = 'P0002';
  end if;
  if v_patient.physio_id <> v_handoff.from_physio_id then
    raise exception 'patient ownership changed' using errcode = '40001';
  end if;
  if v_patient.status <> 'active' or v_patient.archived_at is not null then
    raise exception 'patient is not active' using errcode = '22023';
  end if;

  if v_patient.identity_key is not null and exists (
    select 1 from public.patients
    where physio_id = v_handoff.to_physio_id
      and identity_key = v_patient.identity_key
      and id <> v_patient.id
      and archived_at is null
  ) then
    raise exception 'recipient already has matching patient' using errcode = '23505';
  end if;

  update public.patients
  set physio_id = v_handoff.to_physio_id,
      updated_at = now()
  where id = v_patient.id
    and physio_id = v_handoff.from_physio_id;

  update public.plans
  set physio_id = v_handoff.to_physio_id,
      updated_at = now()
  where patient_id = v_patient.id
    and physio_id = v_handoff.from_physio_id;

  update public.patient_sessions
  set physio_id = v_handoff.to_physio_id,
      updated_at = now()
  where patient_id = v_patient.id
    and physio_id = v_handoff.from_physio_id;

  update public.clinical_alerts
  set physio_id = v_handoff.to_physio_id,
      updated_at = now()
  where patient_id = v_patient.id
    and physio_id = v_handoff.from_physio_id;

  update public.patient_handoffs
  set status = 'accepted', responded_at = now(), responded_by = p_recipient_physio_id
  where id = v_handoff.id
  returning * into v_handoff;

  return v_handoff;
end;
$$;

create or replace function public.cancel_patient_handoff(
  p_handoff_id uuid,
  p_sender_physio_id uuid
)
returns public.patient_handoffs
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_handoff public.patient_handoffs%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role required' using errcode = '42501';
  end if;

  select * into v_handoff
  from public.patient_handoffs
  where id = p_handoff_id
  for update;

  if not found then
    raise exception 'handoff not found' using errcode = 'P0002';
  end if;
  if v_handoff.from_physio_id <> p_sender_physio_id then
    raise exception 'handoff sender mismatch' using errcode = '42501';
  end if;
  if v_handoff.status <> 'pending' then
    raise exception 'handoff already resolved' using errcode = '40001';
  end if;

  update public.patient_handoffs
  set status = 'cancelled', cancelled_at = now()
  where id = v_handoff.id
  returning * into v_handoff;

  return v_handoff;
end;
$$;

revoke all on function public.create_patient_handoff(uuid,uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.respond_patient_handoff(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.cancel_patient_handoff(uuid,uuid) from public, anon, authenticated;
grant execute on function public.create_patient_handoff(uuid,uuid,uuid,text) to service_role;
grant execute on function public.respond_patient_handoff(uuid,uuid,text) to service_role;
grant execute on function public.cancel_patient_handoff(uuid,uuid) to service_role;

insert into public.app_schema_state (singleton, schema_version, applied_at)
values (true, '20260711.5', now())
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

  select schema_version into v_schema_version
  from public.app_schema_state
  where singleton = true;

  select coalesce(array_agg(required_name order by required_name), array[]::text[])
  into v_missing_tables
  from unnest(array[
    'profiles','patients','patient_sessions','patient_auth_sessions','patient_handoffs',
    'exercise_library','plans','plan_exercises','exercise_logs','audit_logs',
    'clinical_alerts','app_notifications','payment_requests'
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
      ('patient_handoffs.from_physio_id', 'patient_handoffs', 'from_physio_id'),
      ('patient_handoffs.to_physio_id', 'patient_handoffs', 'to_physio_id'),
      ('patient_handoffs.consent_confirmed_at', 'patient_handoffs', 'consent_confirmed_at'),
      ('exercise_library.is_default', 'exercise_library', 'is_default'),
      ('exercise_library.owner_physio_id', 'exercise_library', 'owner_physio_id'),
      ('exercise_library.status', 'exercise_library', 'status'),
      ('exercise_library.updated_at', 'exercise_library', 'updated_at')
  ) as required(required_column, table_name, column_name)
  where not exists (
    select 1 from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = required.table_name
      and c.column_name = required.column_name
  );

  select coalesce(array_agg(required_name order by required_name), array[]::text[])
  into v_missing_functions
  from unnest(array[
    'activate_plan_safely','check_patient_login_attempt','create_or_get_patient',
    'record_patient_exercise_completion','record_patient_login_result','rotate_patient_access_code',
    'create_patient_handoff','respond_patient_handoff','cancel_patient_handoff'
  ]::text[]) as required_name
  where not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = required_name
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
