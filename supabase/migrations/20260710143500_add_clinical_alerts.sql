create table if not exists public.clinical_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  physio_id uuid references public.profiles(id) on delete set null,
  source_type text not null,
  source_id uuid,
  severity text not null default 'warning',
  status text not null default 'open',
  title text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null,
  acknowledged_at timestamptz,
  acknowledged_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinical_alerts_severity_check check (severity in ('info','warning','critical')),
  constraint clinical_alerts_status_check check (status in ('open','acknowledged','resolved')),
  constraint clinical_alerts_title_length_check check (char_length(title) between 1 and 180),
  constraint clinical_alerts_message_length_check check (message is null or char_length(message) <= 1200),
  constraint clinical_alerts_dedupe_key_key unique (dedupe_key)
);

create index if not exists clinical_alerts_physio_status_created_idx
  on public.clinical_alerts (physio_id, status, created_at desc);
create index if not exists clinical_alerts_patient_created_idx
  on public.clinical_alerts (patient_id, created_at desc);

alter table public.clinical_alerts enable row level security;

revoke all on public.clinical_alerts from anon;
revoke insert, delete on public.clinical_alerts from authenticated;
grant select, update on public.clinical_alerts to authenticated;
grant all on public.clinical_alerts to service_role;

drop policy if exists clinical_alerts_select_own_or_admin on public.clinical_alerts;
create policy clinical_alerts_select_own_or_admin
  on public.clinical_alerts
  for select
  to authenticated
  using (private.is_platform_admin() or physio_id = private.current_profile_id());

drop policy if exists clinical_alerts_update_own_or_admin on public.clinical_alerts;
create policy clinical_alerts_update_own_or_admin
  on public.clinical_alerts
  for update
  to authenticated
  using (private.is_platform_admin() or physio_id = private.current_profile_id())
  with check (private.is_platform_admin() or physio_id = private.current_profile_id());
