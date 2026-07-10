alter table public.patients add column if not exists date_of_birth date null;
alter table public.patients add column if not exists identity_key text null;

create or replace function public.normalize_patient_identity_part(p_value text)
returns text
language sql
immutable
set search_path = public, pg_catalog
as $$
  select regexp_replace(lower(trim(coalesce(p_value, ''))), '[^a-z0-9]+', '', 'g');
$$;

create or replace function public.set_patient_identity_key()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.date_of_birth is null then
    new.identity_key := null;
  else
    new.identity_key := public.normalize_patient_identity_part(new.first_name)
      || ':' || public.normalize_patient_identity_part(new.last_name)
      || ':' || to_char(new.date_of_birth, 'YYYY-MM-DD');
  end if;
  return new;
end;
$$;

drop trigger if exists patients_set_identity_key on public.patients;
create trigger patients_set_identity_key
before insert or update of first_name, last_name, date_of_birth on public.patients
for each row execute function public.set_patient_identity_key();

update public.patients
set identity_key = public.normalize_patient_identity_part(first_name)
  || ':' || public.normalize_patient_identity_part(last_name)
  || ':' || to_char(date_of_birth, 'YYYY-MM-DD')
where date_of_birth is not null and identity_key is null;

create unique index if not exists patients_unique_identity_per_physio_idx
on public.patients(physio_id, identity_key)
where physio_id is not null and identity_key is not null;

create table if not exists public.patient_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  physio_id uuid not null references public.profiles(id) on delete restrict,
  session_date timestamptz not null default now(),
  status text not null default 'completed' check (status in ('planned','in_progress','completed','cancelled')),
  pain_before smallint null check (pain_before between 0 and 10),
  pain_after smallint null check (pain_after between 0 and 10),
  treatment_summary text null,
  clinical_notes text null,
  next_steps text null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patient_sessions_patient_date_idx
on public.patient_sessions(patient_id, session_date desc);
create index if not exists patient_sessions_physio_date_idx
on public.patient_sessions(physio_id, session_date desc);

alter table public.patient_sessions enable row level security;
revoke all on table public.patient_sessions from public, anon, authenticated;
grant select, insert, update on table public.patient_sessions to service_role;

create or replace function public.create_or_get_patient(
  p_physio_id uuid,
  p_first_name text,
  p_last_name text,
  p_date_of_birth date,
  p_phone text default null,
  p_diagnosis text default null,
  p_patient_code text default null,
  p_patient_username text default null
)
returns table(patient public.patients, created boolean)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_identity_key text;
  v_patient public.patients%rowtype;
begin
  if p_physio_id is null or p_date_of_birth is null then
    raise exception 'Physiotherapist and date of birth are required';
  end if;

  v_identity_key := public.normalize_patient_identity_part(p_first_name)
    || ':' || public.normalize_patient_identity_part(p_last_name)
    || ':' || to_char(p_date_of_birth, 'YYYY-MM-DD');

  select * into v_patient
  from public.patients
  where physio_id = p_physio_id and identity_key = v_identity_key
  limit 1
  for update;

  if found then
    if v_patient.status = 'inactive' then
      update public.patients
      set status = 'active',
          phone = coalesce(nullif(trim(p_phone), ''), phone),
          diagnosis = coalesce(nullif(trim(p_diagnosis), ''), diagnosis)
      where id = v_patient.id
      returning * into v_patient;
    end if;
    return query select v_patient, false;
    return;
  end if;

  begin
    insert into public.patients(
      physio_id, first_name, last_name, date_of_birth, phone, diagnosis,
      patient_code, patient_username, status
    ) values (
      p_physio_id, trim(p_first_name), nullif(trim(p_last_name), ''), p_date_of_birth,
      nullif(trim(p_phone), ''), nullif(trim(p_diagnosis), ''),
      p_patient_code, p_patient_username, 'active'
    ) returning * into v_patient;
    return query select v_patient, true;
  exception when unique_violation then
    select * into v_patient
    from public.patients
    where physio_id = p_physio_id and identity_key = v_identity_key
    limit 1;
    return query select v_patient, false;
  end;
end;
$$;

revoke all on function public.create_or_get_patient(uuid,text,text,date,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_or_get_patient(uuid,text,text,date,text,text,text,text) to service_role;
