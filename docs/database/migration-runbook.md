# Database migration runbook

## Scope

This runbook applies to append-only migrations under `supabase/migrations/`. It is designed for a phased rebuild where the current production application remains available until feature parity is verified.

## Preconditions

- Use a dedicated non-production Supabase project or isolated branch.
- Confirm the target environment and project reference before running any command.
- Export a schema-only snapshot and create a database backup according to the provider's supported process.
- Verify that required environment variables point to the intended environment.
- Run repository checks from a clean commit.
- Never paste production credentials into issues, pull requests, CI logs or screenshots.

## Repository checks

Run in this order:

```bash
npm ci --no-audit --no-fund
npm run check:dependencies
npm run check:env:contract
npm run check:database-schema
npm run check:recovery
npm run test:backend
npm run typecheck
npm run build
```

A migration is not approved when a check is skipped or converted into a warning.

## Applying migrations in preview/staging

1. Record the current `app_schema_state` value and latest applied migration.
2. Apply only migrations not already present in the target environment.
3. Confirm the migration transaction completed successfully.
4. Run the protected readiness endpoint with the monitor secret.
5. Verify that no required tables, columns, functions or policies are reported missing.
6. Exercise the affected flow using non-production fixtures.
7. Check structured logs and Sentry for redacted, actionable errors.

## Atomic patient-capacity verification

For `20260713_atomic_patient_capacity.sql`:

1. Verify `public.create_or_get_patient_atomic` exists with `security definer` and a fixed search path.
2. Verify execute privilege is revoked from `public`, `anon` and `authenticated` and granted only to `service_role`.
3. With an approved physiotherapist and no subscription, create records zero through five successfully.
4. Attempt patient six and confirm `subscription_required` is returned.
5. Activate a future-dated subscription manually and confirm patient six succeeds.
6. Expire the subscription and confirm existing records remain readable while new creation is denied.
7. Send two concurrent requests at the fifth-slot boundary and confirm only the valid capacity outcome commits.
8. Submit the same name/surname/date twice and confirm the second request returns the existing record rather than consuming a slot.

## Production rollout

1. Schedule a controlled deployment window.
2. Confirm a current recoverable backup.
3. Apply the additive database migration before deploying application code that calls the new RPC.
4. Run readiness checks.
5. Deploy the compatible application build.
6. Run smoke tests for staff authentication, patient creation, patient-session access, reports and admin billing.
7. Monitor error rate, database errors and authorization denials.
8. Keep the prior deployment available for immediate rollback.

## Rollback

Application rollback is preferred over destructive schema rollback.

1. Roll back the Vercel deployment to the last compatible version.
2. Leave additive tables/functions/columns in place unless they cause a demonstrated production fault.
3. If the new RPC must be disabled, revoke execute from `service_role` in a new emergency migration and deploy the prior application version.
4. Restore data from backup only when data integrity is compromised and after preserving evidence for incident analysis.
5. Document the incident, affected migration, timestamps, verification queries and recovery result.

Do not edit or delete an applied migration to simulate rollback. Every corrective database change must be a new migration.

## Evidence required for sign-off

- exact commit SHA;
- target environment identifier;
- migration command/result;
- readiness response without secrets;
- relevant automated-test output;
- concurrent-capacity test result;
- smoke-test checklist;
- rollback owner and prior deployment reference.
