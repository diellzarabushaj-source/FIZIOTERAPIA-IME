# Migration plan — v1 to v2

## Principles

- `main` remains the stable implementation until parity is verified.
- Existing production migrations are immutable.
- New database changes are additive and backward-compatible during rollout.
- Old and new routes may coexist behind internal rollout controls until v2 is verified.
- No production credentials or production database are used for local or automated tests.

## Phases

1. Complete route, service, schema, permission, integration and test inventory.
2. Freeze and document current API contracts and database schema version.
3. Add the v2 source boundaries and design tokens without changing production behavior.
4. Centralize environment validation, errors, logging/redaction and authorization.
5. Introduce typed repositories over the existing schema.
6. Rebuild physiotherapist patient workflows with owner-scoped reads/writes.
7. Rebuild patient signed-session portal with registry and revocation.
8. Rebuild admin and billing workflows with audited manual activation.
9. Rebuild reports and access policies.
10. Rebuild AI Movement Check with explicit consent and client-only frame processing.
11. Rebuild public/Sanity surfaces and email abstraction.
12. Align Expo pilot client with stable typed API contracts.
13. Run unit, integration, E2E, mobile, Studio, security, database and recovery gates.
14. Deploy preview, run visual/mobile checks and production-like smoke tests.
15. Complete parity matrix, known limitations and rollback verification.
16. Promote only after explicit review of the Draft PR.

## Database rollout

- Capture the current expected schema version before changes.
- Add indexes only from verified query plans or frequent repository access paths.
- Enforce concurrent patient-limit logic in an atomic database operation or transaction-safe service.
- Add constraints in stages when existing data may violate them: audit, backfill, validate, then enforce.
- Apply staging migrations first and run database-contract plus recovery checks.
- Backups and restoration procedure must be verified before production migration.

## Application rollout

- Deploy v2 as a Vercel preview from the rebuild branch.
- Use separate preview Clerk/Supabase/Resend configuration.
- Validate public routes without authentication and protected routes with test identities.
- Confirm that old patient links and existing API consumers remain compatible.
- Avoid public caching of authenticated or clinical responses.

## Rollback

1. Stop promotion and retain `main` as the production source.
2. Revert traffic/deployment to the last known-good production deployment.
3. Disable newly introduced feature flags or routes without deleting existing data.
4. For additive migrations, prefer application rollback while retaining compatible columns/tables.
5. Use a compensating migration only when required; never edit an applied migration.
6. Verify health, readiness, Clerk login, patient session, existing-patient access and report access after rollback.
7. Record the incident and any data reconciliation steps in an audit-safe operational note.

## Promotion gate

Promotion is blocked until the feature-parity matrix is fully linked to implementation and tests, all mandated commands have real recorded output, preview smoke tests pass, negative authorization tests pass, and the rollback procedure has been rehearsed against a non-production environment.
