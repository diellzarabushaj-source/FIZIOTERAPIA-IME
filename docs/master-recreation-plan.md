# Fizioterapia ime — Master Recreation Plan

Status: Started.

This plan recreates the product in a clean, production-ready way based on the current GitHub app, the Replit ZIP decisions, Supabase rules, Vercel deployment, and the intended Fizioterapia ime business model.

## Product goal

Create a physiotherapy platform with three connected experiences:

1. Patient portal / mobile app
2. Physiotherapist dashboard
3. Owner/admin dashboard

The app must stay clinically safe, simple for patients, useful for physiotherapists, and ready for launch with a 9.90 EUR/month physiotherapist subscription model.

## Non-negotiable rules

These rules must never be removed without explicit approval:

- Patient login stays username + code.
- Patients do not create treatment plans.
- Physiotherapist/admin login uses Clerk.
- Supabase service role key is server-only.
- No service role key in browser or mobile app.
- Physiotherapists must pay 9.90 EUR/month for access.
- Unpaid physiotherapists cannot create patients, exercises, or plans.
- AI Movement Check only gives movement-quality feedback.
- AI does not diagnose.
- AI does not prescribe therapy.
- AI does not replace the physiotherapist.
- Pain score 7/10 or higher means stop and contact physiotherapist.
- Low AI score alerts the physiotherapist.
- Every write action that accepts patientId must check patient ownership.
- Every write action that accepts exerciseId must check exercise access.

## Current product state

### Done

- Brand foundation
- Premium homepage
- Patient portal polish
- Physiotherapist dashboard polish
- Admin billing page
- PDF report page
- Google MediaPipe AI Movement Check UI
- Supabase schema and RLS base
- Manual billing flow
- Resend notification helper
- Demo patient SQL seed prepared
- Mobile app Expo setup
- Mobile app asset generation workflow
- App Store / Play Store listing drafts
- Production deploy is READY on Vercel

### Needs recreation / hardening

- Full route/API security audit
- Better plan builder logic
- Better program templates
- Better patient progress UX
- Better exercise library management
- Real demo patient execution in Supabase
- Real mobile screenshots
- Full EAS preview build
- Clinic launch SOPs
- Support/onboarding documentation

## Recreation phases

## Phase 10A — Security parity with Replit

Goal: make GitHub match the safe behavior defined in the Replit ZIP.

Tasks:

- [x] Add `requireOwnedPatient()` to physiotherapist actions.
- [x] Add `requireAccessibleExercise()` to physiotherapist actions.
- [x] Use `ADMIN_EMAIL` fallback in physio profile creation.
- [ ] Audit all server actions that accept `patientId`.
- [ ] Audit all API routes that accept `planExerciseId`.
- [ ] Confirm report route owner/admin access.
- [ ] Confirm normal physio cannot access other physio patients.
- [ ] Confirm private exercises are only visible to owner physio.

## Phase 10B — Plan builder recreation

Goal: recreate plan creation so it feels like a real physiotherapy workflow, not just a rough MVP.

### Current weakness

Right now plan creation is basic. It can create a patient and assign default exercises, but the plan builder should be more structured.

### Target workflow

Physiotherapist should be able to:

1. Create patient
2. Select diagnosis/program type
3. Choose plan duration
4. Add exercises from default library or private library
5. Set day number
6. Set sets/reps/frequency
7. Enable AI check only where appropriate
8. Save plan
9. Give patient username + code
10. Track adherence and pain

### Program templates to create

MVP templates:

- Lumbosciatica / low back pain
- Neck pain / cervical pain
- Knee rehabilitation
- Shoulder mobility
- Posture / core stability
- General mobility

### Template fields

Each template should define:

- title
- diagnosis/category
- duration days
- default exercises
- clinical instructions
- AI-enabled exercises
- safety note

## Phase 10C — Patient progress recreation

Goal: make patient dashboard more useful.

Tasks:

- [ ] Show today exercises clearly.
- [ ] Show completed exercises by day.
- [ ] Show pain trend.
- [ ] Show AI score trend.
- [ ] Show physiotherapist messages.
- [ ] Make AI check button visible only for AI-enabled exercises.
- [ ] Add stronger safety warning when pain is 7/10 or higher.

## Phase 10D — Admin / Owner recreation

Goal: make owner dashboard useful for real clinic management.

Tasks:

- [ ] Manage physiotherapists.
- [ ] Activate/suspend subscription.
- [ ] See active paid physios.
- [ ] Manage default exercise library.
- [ ] See platform alerts.
- [ ] See patients count and usage.
- [ ] Add owner-only safeguards.

## Phase 10E — Clinical documents and launch SOP

Goal: create clear documents for clinic use.

Documents to create:

- Physiotherapist onboarding guide
- Patient instruction guide
- Admin billing SOP
- AI safety SOP
- Data/privacy support guide
- Launch checklist
- Demo patient checklist

## Phase 10F — Mobile app readiness

Goal: get mobile app ready for preview build and store screenshots.

Tasks:

- [ ] Run asset generator.
- [ ] Add generated PNG assets.
- [ ] Run EAS preview build.
- [ ] Test demo patient login.
- [ ] Capture screenshots.
- [ ] Add screenshots to store assets.
- [ ] Prepare reviewer notes.

## Phase 10G — Final QA

Goal: validate production.

Test these routes:

```text
/
/patient-portal
/patient-dashboard
/physiotherapist-portal
/admin-dashboard
/admin-billing
/ai-check
/reports/[patientId]
/privacy
/terms
/camera-consent
/data-deletion
/faq
```

Test roles:

- Owner/admin
- Paid physiotherapist
- Unpaid physiotherapist
- Patient with valid code
- Patient with invalid code

## Immediate next execution order

Start here:

1. Phase 10B — Plan builder recreation
2. Phase 10C — Patient progress polish
3. Phase 10E — Launch SOP docs
4. Phase 10G — QA

## First coding target

Create a reusable clinical program template system:

```text
lib/clinical-programs.ts
```

This file should contain safe default templates for physiotherapy plans.

Then connect it to:

```text
app/physiotherapist-portal/actions.ts
app/physiotherapist-portal/page.tsx
```

## Acceptance criteria

The recreated plan builder is acceptable when:

- A physiotherapist can create a patient and select a program template.
- The plan auto-fills correct exercises.
- The physiotherapist can still manually add exercises.
- Patient username + code still work.
- AI is only enabled for movement feedback.
- Pain 7/10 safety rule is visible.
- No backend security rules are weakened.
