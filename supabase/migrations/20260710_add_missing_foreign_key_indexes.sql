create index if not exists clinical_alerts_acknowledged_by_idx
  on public.clinical_alerts(acknowledged_by)
  where acknowledged_by is not null;

create index if not exists clinical_alerts_resolved_by_idx
  on public.clinical_alerts(resolved_by)
  where resolved_by is not null;

create index if not exists patients_archived_by_idx
  on public.patients(archived_by)
  where archived_by is not null;

create index if not exists payment_requests_reviewed_by_idx
  on public.payment_requests(reviewed_by)
  where reviewed_by is not null;

create index if not exists plans_archived_by_idx
  on public.plans(archived_by)
  where archived_by is not null;
