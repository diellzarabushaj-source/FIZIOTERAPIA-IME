# Database schema overview

Status: rebuild inventory in progress  
Owner: server/database boundary  
Source of truth: append-only files in `supabase/migrations/`

## Safety rules

- Never edit a migration that may already have run in an environment.
- Application code uses the Supabase service role only from server-only modules.
- Browser and mobile clients do not receive the service-role key.
- Clinical queries must be scoped by the authenticated actor, patient session and resource ownership.
- Production data is never used as a development or automated-test fixture.

## Core tables verified by application contracts

| Table | Purpose | Important relationships and constraints |
| --- | --- | --- |
| `profiles` | Database-backed identity, role and lifecycle state for Clerk users | `clerk_user_id` is linked once through the controlled identity-linking RPC; role/state are checked server-side. |
| `patients` | Physiotherapist-owned patient record | `physio_id` defines tenant ownership. Name, surname and date of birth are used by the atomic create-or-get operation to prevent accidental duplicate records. |
| `subscriptions` | Manual pilot subscription state | Linked by `physio_id`; active status and `current_period_end` unlock patient creation after five records. Existing records remain readable after expiry. |
| `patient_auth_sessions` | Revocable signed patient-session registry | Stores token hashes and lifecycle metadata. It is deliberately separate from clinical treatment sessions. |
| `patient_sessions` | Planned/in-progress/completed clinical sessions | Linked to patient and physiotherapist; contains clinical session date, pain scores and treatment documentation. |
| `treatment_plans` | Professional treatment plan assigned to a patient | Ownership follows the patient/physiotherapist relationship and plan status gates patient access. |
| `treatment_plan_exercises` | Exercises assigned to a treatment plan | Child of `treatment_plans`; ordering and prescription fields belong here rather than in UI state. |
| `progress_entries` | Patient progress and adherence events | Must be authorized through the associated plan/patient before reading or writing. |
| `exercise_library` | Default and physiotherapist-owned exercise catalogue | Ownership columns include `is_default`, `owner_physio_id`, `status` and `updated_at`. |
| `audit_logs` | Administrative and clinical-operation audit events | Snapshots are redacted before persistence; console failures use the centralized safe-log payload. |
| `app_schema_state` | Deployment/readiness schema marker | Read by the protected readiness service to fail closed when migrations are missing. |

## Atomic patient capacity

`20260713_atomic_patient_capacity.sql` introduces `public.create_or_get_patient_atomic`.

The function:

1. validates required identity fields;
2. acquires a transaction-scoped advisory lock keyed by physiotherapist ID;
3. returns an existing matching patient before consuming another slot;
4. counts that physiotherapist's patient records;
5. requires an active, non-expired subscription when the count is already five or more;
6. inserts and returns the new patient in the same database transaction;
7. is executable only by `service_role`.

This closes the concurrent sixth-patient race that existed when count and subscription were checked in Node before insertion.

## Readiness and schema contracts

`npm run check:database-schema` statically verifies the required migrations, readiness RPC, patient-session separation, exercise ownership fields and atomic patient-capacity contract. Runtime readiness remains responsible for checking the deployed database rather than assuming migration success from repository state.

## Index review

Indexes must follow measured query paths. Current priority query shapes are:

- patient list by `physio_id`, archive state and creation date;
- exact patient identity lookup by `physio_id`, normalized names and date of birth;
- latest subscription by `physio_id` and creation date;
- active patient session lookup by token hash and expiry/revocation state;
- plan/session/progress lookup by patient and physiotherapist ownership.

Any new index must be introduced by a new migration and verified with query plans in a non-production environment before rollout.
