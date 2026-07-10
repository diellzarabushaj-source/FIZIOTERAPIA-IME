begin;

alter table public.patients
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null,
  add column if not exists archive_reason text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.plans
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null,
  add column if not exists archive_reason text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists patients_physio_status_archived_idx on public.patients (physio_id, status, archived_at);
create index if not exists plans_patient_status_archived_idx on public.plans (patient_id, status, archived_at);

create table if not exists public.data_retention_policies (
  policy_key text primary key,
  entity_type text not null,
  retention_days integer,
  action text not null check (action in ('retain','review','anonymize','purge_operational')),
  enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (retention_days is null or retention_days >= 1)
);

insert into public.data_retention_policies (policy_key, entity_type, retention_days, action, notes)
values
  ('clinical_patients','patients',null,'review','No automatic deletion.'),
  ('clinical_plans','plans',null,'review','Preserve plan history.'),
  ('clinical_exercise_logs','exercise_logs',null,'review','No automatic deletion.'),
  ('audit_events','audit_logs',2555,'retain','Conservative seven-year default; verify legally.'),
  ('archived_notifications','app_notifications',365,'purge_operational','Archived operational notifications only.'),
  ('payment_requests','payment_requests',3650,'review','Conservative ten-year review period.'),
  ('resolved_clinical_alerts','clinical_alerts',2555,'retain','Clinical audit trail.')
on conflict (policy_key) do update set
  entity_type=excluded.entity_type,
  retention_days=excluded.retention_days,
  action=excluded.action,
  notes=excluded.notes,
  updated_at=now();

alter table public.data_retention_policies enable row level security;
revoke all on public.data_retention_policies from anon, authenticated;
grant select, insert, update, delete on public.data_retention_policies to service_role;

create or replace function public.prevent_clinical_hard_delete()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
  if coalesce(current_setting('app.allow_hard_delete', true), 'off') <> 'on' then
    raise exception 'Hard delete is disabled for clinical table %. Archive the record instead.', tg_table_name using errcode='42501';
  end if;
  return old;
end;
$$;
revoke all on function public.prevent_clinical_hard_delete() from public, anon, authenticated;

drop trigger if exists patients_prevent_hard_delete on public.patients;
create trigger patients_prevent_hard_delete before delete on public.patients for each row execute function public.prevent_clinical_hard_delete();
drop trigger if exists plans_prevent_hard_delete on public.plans;
create trigger plans_prevent_hard_delete before delete on public.plans for each row execute function public.prevent_clinical_hard_delete();

create or replace function public.enforce_patient_archive_metadata()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
  new.updated_at := now();
  if new.status='inactive' and old.status is distinct from 'inactive' then
    new.archived_at := coalesce(new.archived_at, now());
    new.archive_reason := coalesce(nullif(btrim(new.archive_reason),''),'Archived by clinical workflow');
  elsif new.status='active' and old.status is distinct from 'active' then
    new.archived_at := null; new.archived_by := null; new.archive_reason := null;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_plan_archive_metadata()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
  new.updated_at := now();
  if new.status='archived' and old.status is distinct from 'archived' then
    new.archived_at := coalesce(new.archived_at, now());
    new.archive_reason := coalesce(nullif(btrim(new.archive_reason),''),'Archived by plan lifecycle');
  elsif new.status<>'archived' and old.status='archived' then
    new.archived_at := null; new.archived_by := null; new.archive_reason := null;
  end if;
  return new;
end;
$$;

drop trigger if exists patients_archive_metadata on public.patients;
create trigger patients_archive_metadata before update on public.patients for each row execute function public.enforce_patient_archive_metadata();
drop trigger if exists plans_archive_metadata on public.plans;
create trigger plans_archive_metadata before update on public.plans for each row execute function public.enforce_plan_archive_metadata();

create or replace function public.activate_plan_safely(p_plan_id uuid,p_expected_status text,p_actor_profile_id uuid)
returns setof public.plans language plpgsql security definer set search_path=public as $$
declare v_plan public.plans%rowtype; v_actor_role text;
begin
  if auth.role()<>'service_role' then raise exception 'service_role required' using errcode='42501'; end if;
  select role into v_actor_role from public.profiles where id=p_actor_profile_id and status='active';
  if v_actor_role is null then raise exception 'Active actor profile required' using errcode='42501'; end if;
  select * into v_plan from public.plans where id=p_plan_id for update;
  if not found or v_plan.status is distinct from p_expected_status then return; end if;
  if v_actor_role not in ('owner','admin') and v_plan.physio_id is distinct from p_actor_profile_id then raise exception 'Plan ownership mismatch' using errcode='42501'; end if;
  update public.plans set status='archived',archived_at=coalesce(archived_at,now()),archived_by=coalesce(archived_by,p_actor_profile_id),archive_reason=coalesce(archive_reason,'Replaced by newly activated plan'),updated_at=now() where patient_id=v_plan.patient_id and status='active' and id<>p_plan_id;
  update public.plans set status='active',archived_at=null,archived_by=null,archive_reason=null,updated_at=now() where id=p_plan_id and status=p_expected_status returning * into v_plan;
  if found then return next v_plan; end if;
end;
$$;
revoke all on function public.activate_plan_safely(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.activate_plan_safely(uuid,text,uuid) to service_role;

create or replace function public.retention_candidate_counts()
returns table(policy_key text,entity_type text,candidate_count bigint,cutoff_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
  if auth.role()<>'service_role' then raise exception 'service_role required' using errcode='42501'; end if;
  return query
  select 'archived_notifications'::text,'app_notifications'::text,count(*)::bigint,now()-interval '365 days' from public.app_notifications where status='archived' and updated_at<now()-interval '365 days'
  union all
  select 'audit_events'::text,'audit_logs'::text,count(*)::bigint,now()-interval '2555 days' from public.audit_logs where created_at<now()-interval '2555 days'
  union all
  select 'payment_requests'::text,'payment_requests'::text,count(*)::bigint,now()-interval '3650 days' from public.payment_requests where created_at<now()-interval '3650 days';
end;
$$;
revoke all on function public.retention_candidate_counts() from public, anon, authenticated;
grant execute on function public.retention_candidate_counts() to service_role;

commit;
