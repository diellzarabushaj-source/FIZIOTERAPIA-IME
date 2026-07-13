# Feature parity matrix

Legend: `inventory` = verified as an existing product capability but implementation mapping is still being completed; `foundation` = executable v2 domain/policy code exists but is not yet wired to production routes and repositories; `verified` = implementation and test both pass in the required quality gates.

| Capability | Current route/surface | Current components/API/data | Roles | New implementation target | Verification | Migration status |
|---|---|---|---|---|---|---|
| Public home | `/` | App Router public page | Public | `src/app/(public)` with shared public shell and SEO metadata | Public-navigation E2E | inventory |
| FAQ | `/faq` | Public content | Public | Accessible FAQ sections and structured data where valid | Public-navigation E2E | inventory |
| Blog index/articles | `/blog`, article routes | Sanity, Portable Text, images | Public | Typed Sanity repository, safe renderer, loading/error/missing-content handling | Sanity integration + E2E | inventory |
| Support/help | `/support` and existing help routes | Public forms/content | Public | Validated contact/help service with safe email abstraction | Route/integration/E2E | inventory |
| Legal and consent pages | Existing legal routes | Static/public content | Public/patient | Central clinical/legal copy constants plus page-specific metadata | Link crawl + E2E | inventory |
| Physiotherapist auth | `/sign-in`, `/sign-up` | Clerk + database profile | Physiotherapist | Server-side identity mapping, approval/suspension checks and safe redirects | `src/server/permissions/policy.ts`; `tests/backend/v2-permissions.test.ts`; integration/E2E still required | foundation |
| Physiotherapist dashboard | `/physiotherapist-portal` and existing aliases | Clinical repositories | Physiotherapist | Domain dashboard with owner-filtered queries and responsive navigation | Dashboard E2E | inventory |
| Patient list/search/filter | Portal routes | Patients table/repository | Physiotherapist | Paginated server query, debounced search, mobile cards and desktop table | Repository + E2E | inventory |
| Patient create/edit | Portal routes/actions | Patients, billing rule | Physiotherapist | Transactional creation with backend quota enforcement | Domain: `src/features/billing/domain/patient-capacity.ts`; unit: `tests/backend/v2-billing-capacity.test.ts`; transaction/concurrency tests still required | foundation |
| Treatment plans/exercises | Plan builder routes | Plans/exercises | Physiotherapist/patient | Typed plan service and ownership authorization | Integration + E2E | inventory |
| Sessions/progress/notes | Existing portal/patient routes | Sessions/progress/notes | Physiotherapist/patient | Domain services with validated clinical input and audit metadata | Integration + E2E | inventory |
| Reports | Patient-ID report routes | Reports and source clinical data | Owner physio/patient/admin | Central report-access policy, printable and PDF-ready layout | Shared ownership policy foundation exists; report-specific integration + negative E2E required | foundation |
| Patient signed session | Existing patient-code/login flow | Signed cookie + registry | Patient | httpOnly secure cookie, expiry, revocation, ownership and plan checks | Session unit/integration/E2E | inventory |
| Admin dashboard | Existing admin routes | Profiles/subscriptions/health/audit | Admin/owner | Database-backed role policy and audited destructive actions | `src/server/permissions/policy.ts`; negative unit coverage exists; live profile integration/E2E required | foundation |
| Manual billing activation | `/admin-billing` | Subscription records | Admin/owner | Transactional manual activation, history and audit event | Billing integration + E2E | inventory |
| Free patient limit | Backend patient creation | Patient count + subscription | Physiotherapist | Atomic quota reservation/enforcement in service/database layer | 0–5, sixth and expiry domain tests added; manual activation and concurrent database creation remain | foundation |
| AI Movement Check | Existing movement route | MediaPipe Pose Landmarker | Patient/pilot | Client-only frames, explicit consent, dynamic load and safe fallback | Permission-denied/unsupported E2E | inventory |
| Email notifications | Existing triggers | Resend | System | Typed templates, test recipient guard, retry-safe dispatch after DB commit | Email integration tests | inventory |
| Mobile pilot | `apps/mobile-app` | Expo API client | Patient pilot | Typed client, secure session, offline/loading/error and accessible navigation | Mobile typecheck + flow tests | inventory |
| Health/readiness | `/api/health`, `/api/readiness` | DB/Sanity/email checks | Monitor/public-safe | Redacted public summary and protected diagnostics | Recovery/smoke tests | inventory |
| Monitoring | Sentry + scripts | Client/server config | Operations | Central redaction and correlation IDs | Security regression tests | inventory |

## Completion rule

A row moves to `verified` only when the concrete source files, database objects, authorization rule and executable test are linked here and the corresponding commands have real passing output on the rebuild branch. Foundation status must never be interpreted as production integration or feature completion.
