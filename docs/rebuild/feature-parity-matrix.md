# Feature parity matrix

Legend:

- `inventory` — verified existing capability; implementation mapping is still being completed.
- `foundation` — executable domain/policy code exists but is not yet consumed by the production path.
- `integrated` — the existing application path consumes the rebuilt service/policy and repository quality gates pass, but preview/database integration or complete E2E evidence is still outstanding.
- `verified` — implementation, negative authorization, integration and E2E checks all pass in the required environment.

| Capability | Current route/surface | Current components/API/data | Roles | New implementation target | Verification | Migration status |
|---|---|---|---|---|---|---|
| Public home | `/` | App Router public page | Public | `src/app/(public)` with shared public shell and SEO metadata | Public-navigation E2E | inventory |
| FAQ | `/faq` | Public content | Public | Accessible FAQ sections and structured data where valid | Public-navigation E2E | inventory |
| Blog index/articles | `/blog`, article routes | Sanity, Portable Text, images | Public | Typed Sanity repository, safe renderer, loading/error/missing-content handling | Sanity integration + E2E | inventory |
| Support/help | `/support` and existing help routes | Public forms/content | Public | Validated contact/help service with safe email abstraction | Route/integration/E2E | inventory |
| Legal and consent pages | Existing legal routes | Static/public content | Public/patient | Central clinical/legal copy constants plus page-specific metadata | Link crawl + E2E | inventory |
| Physiotherapist auth | `/sign-in`, `/sign-up` | Clerk + database profile | Physiotherapist | Server-side identity mapping, approval/suspension checks and safe redirects | Existing database-backed actor resolution verified; v2 policy convergence and live negative E2E remain | foundation |
| Physiotherapist dashboard | `/physiotherapist-portal` and existing aliases | Clinical repositories | Physiotherapist | Domain dashboard with owner-filtered queries and responsive navigation | Dashboard E2E | inventory |
| Patient list/search/filter | Portal routes | Patients table/repository | Physiotherapist | Paginated server query, debounced search, mobile cards and desktop table | Repository + E2E | inventory |
| Patient create/edit | Portal actions | Patients, validation and billing | Physiotherapist | Central validation and atomic backend quota enforcement | `patient-profile.ts`, `patients.ts`, `patient-profile.ts` service, validation tests and schema contract pass; deployed migration/concurrency integration remains | integrated |
| Treatment plans/exercises | Plan builder routes | Plans/exercises | Physiotherapist/patient | Typed plan service and ownership authorization | Integration + E2E | inventory |
| Sessions/progress/notes | Existing portal/patient routes | Sessions/progress/notes | Physiotherapist/patient | Domain services with validated clinical input and audit metadata | Integration + E2E | inventory |
| Clinical pain stop rule | Patient/progress/AI surfaces | Pain scores and clinical copy | Physiotherapist/patient | One canonical `>=7/10` stop-and-contact decision shared by all clients | Domain tests pass; UI/mobile/report wiring remains | foundation |
| Reports | Patient-ID report routes | Reports and source clinical data | Owner physio/patient/admin | Central report-access policy, printable and PDF-ready layout | Shared ownership policy foundation exists; report-specific integration + negative E2E required | foundation |
| Patient signed session | Existing patient-code/login flow | Signed cookie + registry | Patient | httpOnly secure cookie, expiry, revocation, ownership and plan checks | Existing controls verified; session registry integration and revocation E2E remain | inventory |
| Admin dashboard | Existing admin routes | Profiles/subscriptions/health/audit | Admin/owner | Database-backed role policy and audited destructive actions | Permission unit coverage exists; live profile integration/E2E required | foundation |
| Manual billing activation | `/admin-billing` | Subscription records | Admin/owner | Transactional manual activation, history and audit event | Billing integration + E2E | inventory |
| Free patient limit | Backend patient creation | Patients + subscriptions + atomic RPC | Physiotherapist | Atomic quota reservation/enforcement in PostgreSQL | 0–5/sixth/expiry domain tests, atomic RPC contract and service wiring pass; non-production concurrent DB test remains | integrated |
| AI Movement Check | Existing movement route | MediaPipe Pose Landmarker | Patient/pilot | Client-only frames, explicit consent, dynamic load and safe fallback | Permission-denied/unsupported E2E | inventory |
| Email notifications | Existing triggers | Resend | System | Typed templates, test recipient guard, retry-safe dispatch after DB commit | Email integration tests | inventory |
| Mobile pilot | `apps/mobile-app` | Expo API client | Patient pilot | Typed client, secure session, offline/loading/error and accessible navigation | Mobile typecheck + flow tests | inventory |
| Health/readiness | `/api/health`, `/api/readiness` | DB/Sanity/email checks | Monitor/public-safe | Redacted public summary and protected diagnostics | Existing fail-closed contract; branch E2E now verifies safe degraded mode and production smoke requires healthy mode | integrated |
| Monitoring and audit logging | Sentry + scripts + `audit_logs` | Client/server config | Operations | Central redaction, correlation IDs and structured logs | Recursive redaction unit tests and audit integration pass; full Sentry integration review remains | integrated |
| Pull-request E2E isolation | GitHub Actions | Playwright | Engineering | Test checked-out branch locally; reserve production URL for main/manual smoke | Workflow and health-mode contract added; latest Actions result required | integrated |

## Completion rule

A row moves to `verified` only when the concrete source files, database objects, authorization rule and executable test are linked here and the corresponding commands have real passing output on the rebuild branch. `Foundation` and `integrated` must never be interpreted as full feature parity or production readiness.
