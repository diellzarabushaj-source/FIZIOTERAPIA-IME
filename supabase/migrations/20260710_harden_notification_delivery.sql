begin;

alter table if exists public.notification_logs
  add column if not exists attempt_count integer not null default 0;

alter table if exists public.notification_logs
  add constraint notification_logs_attempt_count_check
  check (attempt_count between 0 and 20) not valid;

alter table if exists public.notification_logs
  validate constraint notification_logs_attempt_count_check;

comment on column public.notification_logs.recipient_email is
  'Privacy-preserving SHA-256 prefix of recipient email; never store raw email here.';

revoke update, delete on table public.notification_logs from anon, authenticated;

commit;
