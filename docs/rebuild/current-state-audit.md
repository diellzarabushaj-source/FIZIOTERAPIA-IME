# Current-state audit — Fizioterapia Ime

Status: **In progress**  
Branch: `rebuild/fizioterapia-ime-v2`  
Baseline: `main` at `1a32e3d97b67bf3202703351f2080b618d53c4cf`

## Verified baseline

- Next.js App Router and React application deployed through Vercel.
- Clerk is used for physiotherapist and owner/admin authentication.
- Supabase/PostgreSQL is the clinical data store.
- Sanity Studio provides public blog content.
- Resend provides email delivery.
- MediaPipe Pose Landmarker provides movement-quality feedback.
- Expo React Native pilot exists under `apps/mobile-app`.
- Playwright, backend node tests, ESLint, typecheck and production build gates exist.
- The repository pins application dependencies rather than using floating ranges.
- Node runtime is currently declared as `24.x` and npm as `10.9.2`.

## Product rules verified from repository documentation and code

- Up to five patients are free for an approved physiotherapist.
- Creating patient six and above requires an active subscription.
- Pilot price is EUR 9.90/month.
- Subscription activation is manual by owner/admin.
- Existing patients and their plans, sessions and reports remain accessible after expiry.
- Patient access uses signed sessions rather than Clerk.
- Pain score 7/10 or higher requires stopping exercise and contacting the physiotherapist.
- The platform does not diagnose, prescribe autonomously or replace the physiotherapist.

## Existing strengths that must be preserved

1. `lib/backend/access.ts` already resolves a verified Clerk identity to a database profile, validates role/status, links `clerk_user_id` through a controlled RPC and rejects identity mismatch.
2. `proxy.ts` correctly treats patient routes as public only at the Clerk layer; clinical data is guarded by signed patient sessions on the server.
3. Patient authentication sessions are separated from clinical treatment sessions through `patient_auth_sessions` and `patient_sessions`.
4. Health and readiness routes fail closed, disable caching and protect detailed diagnostics with `HEALTH_MONITOR_SECRET`.
5. Existing backend and security-regression suites cover important ownership, plan, session, billing and recovery contracts.
6. Database migrations are append-only and include deployment-readiness checks.

## Verified architecture and maintainability findings

### TypeScript contract is not strict yet

`tsconfig.json` currently declares `"strict": false`. The repository therefore does not yet satisfy the requested strict-mode definition of done, even though the current typecheck passes. Strict mode must be enabled through a controlled migration with all resulting errors fixed; it must not be switched on while suppressing errors.

### Styling has accumulated without a clear boundary

The root layout imports more than twenty global CSS files, including sequential phase files and route-specific refresh/fix files. This creates ordering risk, hidden coupling, difficult visual regression analysis and unnecessary global style reach. The rebuild should consolidate tokens and primitives first, then migrate public, patient, physiotherapist and admin surfaces into explicit layout boundaries.

### Authorization logic has overlapping representations

The mature `lib/backend/domain.ts` and `lib/backend/access.ts` model is already used by production routes, while the new `src/server/permissions/policy.ts` foundation initially introduced a narrower parallel status model. The target implementation must converge on one canonical role/profile-state vocabulary rather than maintain two policy sources.

### Patient capacity had a concurrency gap

The baseline checked patient count and subscription in Node before invoking the patient RPC. Two concurrent requests could observe the same fifth-slot state and both proceed. The rebuild branch now introduces `create_or_get_patient_atomic`, which serializes creation per physiotherapist and evaluates duplicate reuse, patient count and subscription inside one PostgreSQL transaction.

### Pull-request E2E targeted the wrong deployment

The baseline Playwright workflow ran pull-request tests against the existing production URL, so it could fail because production was degraded while never exercising the proposed branch. The rebuild workflow now starts the checked-out branch locally for pull requests and keeps production health smoke behavior for `main`/manual runs.

### Logging redaction was incomplete

Audit persistence redacted a small set of credential keys, but console failure paths could include raw database messages and readable entity identifiers. The rebuild branch adds recursive centralized redaction and applies it to audit snapshots and audit failure logs.

## Existing quality gates

The root scripts expose dependency, route, environment, security, database-schema, recovery, backend-test, lint, typecheck, build, production smoke, monitoring, mobile typecheck and Sanity build commands. The rebuild must preserve and strengthen these contracts instead of bypassing them.

The first integrated rebuild slice has passed `Launch CI` and `Web build check` on commit `da46ac3d9b078ea79245c2ae8f514c21f739ea77`. The Playwright run on that commit exposed the production-targeting problem described above; the corrected branch-targeting workflow is being re-verified on the subsequent commit.

## Security findings and controls

1. Protected-route matching centralizes authentication routing, but role authorization must continue to be enforced by database-backed actor resolution and resource ownership.
2. `ADMIN_EMAIL` may be used only as a bootstrap/synchronization value, never as the sole runtime authorization source.
3. `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, `PATIENT_SESSION_SECRET`, monitoring secrets and email secrets are server-only and require explicit import boundaries.
4. Sentry and structured logs must redact clinical content, identities, access codes, tokens, cookies and authorization headers.
5. Service-role repositories bypass RLS and therefore still require explicit application-level authorization on every clinical operation.
6. Patient IDs and other route parameters are untrusted input and must never determine ownership by themselves.

## Audit inventory still being expanded

The following inventories must be completed before feature-parity sign-off:

- every App Router page, layout, loading/error/not-found file and route handler;
- every server action and backend service;
- every table, migration, index, constraint and RLS policy;
- all roles, permissions, ownership rules and administrative actions;
- every email template and notification trigger;
- all Sanity schemas and Portable Text renderers;
- all mobile endpoints and client flows;
- all CI workflows, scripts, recovery and production monitoring contracts;
- all clinical warnings and legal-page occurrences.

## Rebuild constraints

- No destructive replacement of `main`.
- No edits to already-applied migrations; schema evolution uses new migrations.
- No production mocks or inert UI.
- No TypeScript, lint, test, security or coverage bypasses.
- Feature completion requires implementation plus automated verification.
