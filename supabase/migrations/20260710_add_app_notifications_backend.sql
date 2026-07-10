create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid null references public.profiles(id) on delete cascade,
  patient_id uuid null references public.patients(id) on delete set null,
  type text not null,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  title text not null,
  message text null,
  link text null,
  status text not null default 'unread' check (status in ('unread','read','archived')),
  dedupe_key text not null unique,
  read_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_notifications_recipient_status_created_idx
  on public.app_notifications(recipient_profile_id, status, created_at desc);
create index if not exists app_notifications_patient_idx
  on public.app_notifications(patient_id, created_at desc);

alter table public.app_notifications enable row level security;
revoke all on table public.app_notifications from anon, authenticated;
grant select, insert, update, delete on table public.app_notifications to service_role;

create or replace function public.touch_app_notifications_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_app_notifications_updated_at on public.app_notifications;
create trigger trg_app_notifications_updated_at
before update on public.app_notifications
for each row execute function public.touch_app_notifications_updated_at();

revoke all on function public.touch_app_notifications_updated_at() from public, anon, authenticated;
grant execute on function public.touch_app_notifications_updated_at() to service_role;
