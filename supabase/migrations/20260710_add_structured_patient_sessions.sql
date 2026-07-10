create table if not exists public.patient_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  physio_id uuid not null references public.profiles(id) on delete restrict,
  session_number integer not null,
  session_date date not null default current_date,
  pain_before integer null check (pain_before between 0 and 10),
  pain_after integer null check (pain_after between 0 and 10),
  subjective text null,
  objective text null,
  treatment text null,
  response text null,
  next_plan text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, session_number)
);

create index if not exists patient_sessions_patient_date_idx
  on public.patient_sessions(patient_id, session_date desc, created_at desc);
create index if not exists patient_sessions_physio_date_idx
  on public.patient_sessions(physio_id, session_date desc);

alter table public.patient_sessions enable row level security;
revoke all on table public.patient_sessions from public, anon, authenticated;
grant select, insert, update on table public.patient_sessions to service_role;

create or replace function public.create_patient_session_safely(
  p_patient_id uuid,
  p_physio_id uuid,
  p_session_date date,
  p_pain_before integer,
  p_pain_after integer,
  p_subjective text,
  p_objective text,
  p_treatment text,
  p_response text,
  p_next_plan text
)
returns public.patient_sessions
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_patient public.patients%rowtype;
  v_next integer;
  v_session public.patient_sessions%rowtype;
begin
  select * into v_patient
  from public.patients
  where id = p_patient_id
  for update;

  if not found then raise exception 'Patient not found'; end if;
  if v_patient.physio_id is distinct from p_physio_id then raise exception 'Patient ownership mismatch'; end if;
  if v_patient.status <> 'active' then raise exception 'Patient is not active'; end if;

  select coalesce(max(session_number), 0) + 1 into v_next
  from public.patient_sessions
  where patient_id = p_patient_id;

  insert into public.patient_sessions(
    patient_id, physio_id, session_number, session_date,
    pain_before, pain_after, subjective, objective,
    treatment, response, next_plan
  ) values (
    p_patient_id, p_physio_id, v_next, coalesce(p_session_date, current_date),
    p_pain_before, p_pain_after, nullif(trim(p_subjective), ''), nullif(trim(p_objective), ''),
    nullif(trim(p_treatment), ''), nullif(trim(p_response), ''), nullif(trim(p_next_plan), '')
  ) returning * into v_session;

  return v_session;
end;
$$;

revoke all on function public.create_patient_session_safely(uuid, uuid, date, integer, integer, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_patient_session_safely(uuid, uuid, date, integer, integer, text, text, text, text, text) to service_role;
