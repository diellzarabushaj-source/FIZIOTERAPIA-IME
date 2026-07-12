# Replit ZIP recreation plan — Fizioterapia ime

Status: Started from uploaded `FIZIOTERAPIA-IME.zip` review.

## What was found in the ZIP

The Replit project contains `.agents/memory/` with durable decisions for the app:

- Next.js App Router project under `artifacts/web-app`
- Patient auth uses httpOnly cookies, not Clerk
- Physiotherapist/admin auth uses Clerk
- Supabase service-role key is server-only
- Billing access is enforced in server actions
- Price is `9.90 EUR / muaj`
- Pain score `>= 7/10` triggers physiotherapist alert
- AI score `< 60` triggers physiotherapist alert
- AI must never diagnose or prescribe therapy
- IDOR/ownership checks must exist before writing to patient/plan data

## What was recreated in GitHub

### 1. Physio server action safety

Updated:

```text
app/physiotherapist-portal/actions.ts
```

Recreated and improved the Replit safety approach:

- `ADMIN_EMAIL` fallback for owner role
- `requireOwnedPatient()` helper
- `requireAccessibleExercise()` helper
- ownership check before adding an exercise to a plan
- exercise access check before adding an exercise
- owners/admins can access platform-wide data
- normal physios can only access their own patients and default/private exercises

### 2. Backend rules preserved

Still preserved:

- Supabase service-role stays server-only
- Clerk stays for physio/admin only
- patient login stays username + code
- billing gate remains enforced before physio writes
- AI safety rules remain unchanged
- pain alert and AI low-score alert remain unchanged

## Next recreation phases

### Phase 10A — Security parity check

Goal: make GitHub match the safest parts of the Replit project.

Checklist:

- [x] Add ownership check to `addExerciseToPlanAction`
- [x] Add exercise access check
- [x] Use `ADMIN_EMAIL` env fallback in `requireProfile`
- [ ] Review all actions accepting `patientId`
- [ ] Review all API routes accepting `planExerciseId`
- [ ] Confirm owners/admins can access reports without breaking physio ownership

### Phase 10B — Full route QA

Routes to test:

```text
/
/patient-portal
/patient-dashboard
/physiotherapist-portal
/admin-dashboard
/admin-billing
/ai-check
/reports/[patientId]
```

### Phase 10C — Demo patient execution

Run:

```text
supabase/seed-demo-patient.sql
```

Then test:

```text
Username: demo-patient-4821
Code: ARB-4821
```

### Phase 10D — Mobile preview

Run locally or in Replit:

```bash
cd apps/mobile-app
npm install
npm run generate:assets
npm run build:preview
```

### Phase 10E — Final launch docs

Create:

- clinic onboarding checklist
- physiotherapist onboarding guide
- patient instruction PDF/text
- admin billing SOP
- support FAQ

## Non-negotiable rules

Do not change these without explicit approval:

- no patient Clerk login
- no service-role key in client/mobile
- physiotherapist pays `9.90 EUR / muaj`
- patient enters username + code
- AI only gives movement-quality feedback
- pain `7/10` or more means stop/contact physiotherapist
- low AI score notifies physiotherapist

## Current next step

Continue with Phase 10B and Phase 10E:

1. Review route/API security.
2. Create clinic launch docs.
3. Test deployment after this safety update.
