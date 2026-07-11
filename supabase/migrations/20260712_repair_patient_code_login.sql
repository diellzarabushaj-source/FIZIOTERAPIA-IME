-- Idempotent repair for production environments where the patient-code login
-- migrations were not fully applied or pgcrypto lives in the extensions schema.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.patient_login_attempts (
  id bigint generated always as identity primary key,
  code_fingerprint text not null,
  ip_address inet null,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists patient_login_attempts_lookup_idx
on public.patient_login_attempts (code_fingerprint, ip_address, created_at desc);

alter table public.patient_login_attempts enable row level security;
revoke all on table public.patient_login_attempts from public, anon, authenticated;
grant select, insert, delete on table public.patient_login_attempts to service_role;
grant usage, select on sequence public.patient_login_attempts_id_seq to service_role;

create or replace function public.patient_login_fingerprint(p_code text)
returns text
language sql
immutable
strict
set search_path = public, extensions, pg_catalog
as $$
  select encode(
    extensions.digest(
      convert_to(upper(regexp_replace(trim(p_code), '\s+', '', 'g')), 'UTF8'),
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.check_patient_login_attempt(
  p_code text,
  p_ip_address text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_catalog
as $$
declare
  v_fingerprint text := public.patient_login_fingerprint(p_code);
  v_ip inet := nullif(p_ip_address, '')::inet;
  v_count integer;
begin
  delete from public.patient_login_attempts
  where created_at < now() - interval '24 hours';

  select count(*) into v_count
  from public.patient_login_attempts
  where success = false
    and created_at >= now() - interval '15 minutes'
    and (
      code_fingerprint = v_fingerprint
      or (v_ip is not null and ip_address = v_ip)
    );

  return v_count < 8;
exception when invalid_text_representation then
  return false;
end;
$$;

create or replace function public.record_patient_login_result(
  p_code text,
  p_ip_address text default null,
  p_success boolean default false
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_catalog
as $$
declare
  v_fingerprint text := public.patient_login_fingerprint(p_code);
  v_ip inet := nullif(p_ip_address, '')::inet;
begin
  if p_success then
    delete from public.patient_login_attempts
    where code_fingerprint = v_fingerprint
      and (v_ip is null or ip_address = v_ip);
  else
    insert into public.patient_login_attempts(code_fingerprint, ip_address, success)
    values (v_fingerprint, v_ip, false);
  end if;
exception when invalid_text_representation then
  insert into public.patient_login_attempts(code_fingerprint, ip_address, success)
  values (v_fingerprint, null, false);
end;
$$;

revoke all on function public.patient_login_fingerprint(text) from public, anon, authenticated;
revoke all on function public.check_patient_login_attempt(text, text) from public, anon, authenticated;
revoke all on function public.record_patient_login_result(text, text, boolean) from public, anon, authenticated;

grant execute on function public.check_patient_login_attempt(text, text) to service_role;
grant execute on function public.record_patient_login_result(text, text, boolean) to service_role;
