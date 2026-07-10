create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid null references public.profiles(id) on delete set null,
  actor_role text null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  before_data jsonb null,
  after_data jsonb null,
  request_id text null,
  ip_address inet null,
  user_agent text null,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_length check (char_length(action) between 3 and 120),
  constraint audit_logs_entity_type_length check (char_length(entity_type) between 2 and 80)
);

create index if not exists audit_logs_actor_profile_id_idx on public.audit_logs(actor_profile_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

revoke all on table public.audit_logs from anon, authenticated;
grant all on table public.audit_logs to service_role;

comment on table public.audit_logs is 'Immutable server-side audit trail for clinical, access and payment changes.';
