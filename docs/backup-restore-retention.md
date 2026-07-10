# Backup, Restore and Data Retention

## Scope

This runbook covers production PostgreSQL data, Supabase Storage objects, environment configuration and release evidence for Fizioterapia Ime.

Clinical records must not be hard-deleted by normal application flows. Patients and plans are archived with timestamps, actor identity and reason. Restoration is audited.

## Recovery objectives

- Recovery Point Objective (RPO): target no more than 24 hours of data loss until verified point-in-time recovery is enabled.
- Recovery Time Objective (RTO): target restoration of the core patient and plan service within 4 hours.
- These are operational targets, not guarantees. They must be re-approved whenever the hosting plan or database tier changes.

## Data classes

### Clinical records

Patients, plans, exercise logs, clinical alerts and audit evidence are retained and reviewed. They are never automatically purged by the application.

### Operational records

Archived in-app notifications may become purge candidates after 365 days. Purging must run as a reviewed owner operation and must never cascade into clinical data.

### Payment records

Payment requests use a conservative ten-year review window. Proof files require a separate private Storage lifecycle and legal confirmation before deletion.

## Backup checklist

1. Confirm the production Supabase project is healthy.
2. Confirm the latest database backup or point-in-time recovery position in the Supabase dashboard.
3. Export the migration list and current schema version.
4. Verify private Storage buckets and object counts.
5. Record the application commit SHA and Vercel deployment ID.
6. Record Clerk, Resend and Sanity configuration names without copying secret values.
7. Store backup evidence outside the production project with restricted owner access.

## Restore drill

Run a restore drill at least quarterly and before a major launch.

1. Create or use an isolated staging database.
2. Restore the selected backup into staging only.
3. Apply all repository migrations that are newer than the backup.
4. Use synthetic credentials and disable outbound patient email.
5. Verify patient count, active plans, plan exercises, exercise logs, clinical alerts and audit logs.
6. Test one archived patient restore and confirm an audit event is created.
7. Test that a direct DELETE from patients and plans is rejected.
8. Run backend tests, security checks and smoke tests.
9. Record elapsed restore time, recovered timestamp and any missing objects.
10. Destroy or sanitize the restored staging data after the drill.

Production patient data must not be copied into general development environments. A restore drill containing real data must remain access-restricted and must not send notifications.

## Incident restore sequence

1. Freeze writes or place the application in maintenance mode.
2. Capture the failing deployment, logs and database timestamp.
3. Select the last known-good recovery point.
4. Restore into an isolated project first when time permits.
5. Validate ownership, active-plan visibility and patient sessions.
6. Switch application configuration only after validation.
7. Reconcile writes made after the recovery point.
8. Create an audit incident record and document affected records.

## Retention governance

The `data_retention_policies` table is configuration and evidence, not automatic legal authorization. Final periods must be approved for the operating jurisdiction before launch.

The `retention_candidate_counts()` function is read-only. It reports candidate counts and does not delete data.

Any future purge job must:

- be owner-approved;
- be idempotent;
- generate an audit event;
- support dry-run mode;
- exclude clinical records;
- remove Storage objects only after database confirmation;
- produce a signed execution report.

## Hard-delete emergency override

Database triggers block hard deletion of patients and plans. Emergency deletion requires a privileged database session that explicitly sets `app.allow_hard_delete=on`, documented legal approval and a verified backup. The application service role must not use this override in normal operation.
