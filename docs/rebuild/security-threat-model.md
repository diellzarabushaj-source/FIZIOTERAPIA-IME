# Security threat model

## Assets

- Patient identity and contact data.
- Clinical notes, plans, sessions, progress and reports.
- Physiotherapist and administrator identities.
- Patient access sessions/codes.
- Subscription and manual payment state.
- Supabase, Clerk, Resend, Sanity, Sentry and monitor credentials.
- Audit records and recovery metadata.

## Trust boundaries

1. Public browser to Next.js public routes.
2. Clerk-authenticated browser to protected web routes.
3. Patient browser/mobile client to signed-session endpoints.
4. Next.js server to Supabase, Clerk, Sanity, Resend and Sentry.
5. Administrator operations to privileged services.
6. CI/preview/production environment boundaries.

## Primary threats and required controls

| Threat | Example | Required controls |
|---|---|---|
| IDOR/tenant escape | Physio changes patient ID in URL | Server ownership policy on every read/write; negative tests |
| Privilege escalation | Approved physio calls admin endpoint | Database-backed role check inside mutation; audit event |
| Admin-by-email bypass | Matching email but no admin profile | Email never grants access alone; verified DB role and active state |
| Patient-session theft/replay | Leaked code or cookie | httpOnly/secure/sameSite cookie, expiry, registry, revocation, rotation-safe signing |
| Concurrent quota bypass | Two sixth-patient requests | Transaction/advisory lock or atomic database function plus unique invariant |
| Secret leakage | Service role imported by Client Component | Server-only modules, environment schema, bundle/security regression checks |
| PHI in monitoring | Clinical note sent to Sentry/log | Allow-list technical fields; recursive redaction; tests for forbidden keys |
| CSRF | Cross-site privileged mutation | SameSite cookies, origin checks where applicable, framework-safe server actions and no state changes via GET |
| Open redirect | Crafted post-login redirect | Relative-path allow-list and normalization |
| Injection/XSS | Unsafe form/Portable Text output | Boundary validation, parameterized queries, safe Portable Text components, output encoding |
| Abuse/rate attack | Repeated patient-login/admin action | Per-IP/identity rate limits with safe failure mode |
| Unsafe file upload | Malicious or oversized attachment | MIME/signature/size validation, isolated storage and authorization if uploads exist |
| Cache disclosure | Private response reused cross-user | `no-store`/private caching for clinical data; no shared cache keys |
| Recovery exposure | Readiness leaks schema or credentials | Minimal public status and monitor-secret-protected diagnostics |

## Logging prohibition

Never log or send to Sentry: patient names, diagnoses, clinical notes, readable patient IDs, access codes, session tokens, cookies, authorization headers, Supabase/Clerk/Resend secrets or raw request bodies from clinical mutations.

## Security verification

- Permission unit tests for every role/resource pair.
- Integration tests for session revocation and suspended users.
- E2E negative authorization for reports, patients and admin actions.
- Static checks preventing server secrets in client modules.
- Dependency and lockfile policy checks.
- Production smoke tests against health/readiness without exposing diagnostics.
