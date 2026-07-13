# Current-state audit — Fizioterapia Ime

Status: **In progress**  
Branch: `rebuild/fizioterapia-ime-v2`  
Baseline: `main` at `1a32e3d97b67bf3202703351f2080b618d53c4cf`

## Verified baseline

- Next.js App Router, React and strict TypeScript project.
- Clerk is used for physiotherapist and owner/admin authentication.
- Supabase/PostgreSQL is the clinical data store.
- Sanity Studio provides public blog content.
- Resend provides email delivery.
- MediaPipe Pose Landmarker provides movement-quality feedback.
- Expo React Native pilot exists under `apps/mobile-app`.
- Playwright, backend node tests, ESLint, typecheck and production build gates exist.
- The repository pins application dependencies rather than using floating ranges.
- Node runtime is currently declared as `24.x` and npm as `10.9.2`.

## Product rules verified from repository documentation

- Up to five patients are free for an approved physiotherapist.
- Creating patient six and above requires an active subscription.
- Pilot price is EUR 9.90/month.
- Subscription activation is manual by owner/admin.
- Existing patients and their plans, sessions and reports remain accessible after expiry.
- Patient access uses signed sessions rather than Clerk.
- Pain score 7/10 or higher requires stopping exercise and contacting the physiotherapist.
- The platform does not diagnose, prescribe autonomously or replace the physiotherapist.

## Existing quality gates

The root scripts already expose dependency, route, environment, security, database-schema, recovery, backend-test, lint, typecheck, build, production smoke, monitoring, mobile typecheck and Sanity build commands. The rebuild must preserve and strengthen these contracts instead of bypassing them.

## Initial security findings

1. `proxy.ts` correctly treats patient routes as public only at the Clerk layer; clinical access must continue to be checked through signed patient sessions, ownership and active-plan validation.
2. Protected-route matching currently centralizes authentication routing, but role authorization must not rely on route visibility or `ADMIN_EMAIL` alone.
3. `ADMIN_EMAIL` is documented as a bootstrap/synchronization value, not the sole authorization source. The rebuild will enforce a database-backed profile and explicit role/disabled state.
4. Service-role Supabase, Clerk secret, patient-session secret and monitoring secret are server-only variables and must be guarded by import boundaries.
5. Sentry and structured logs require systematic redaction of clinical content, identities, access codes, tokens, cookies and authorization headers.

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
