revoke all on table public.audit_logs from service_role;
grant select, insert on table public.audit_logs to service_role;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

drop trigger if exists audit_logs_prevent_update_delete on public.audit_logs;
create trigger audit_logs_prevent_update_delete
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();
