# Fizioterapia ime — Step-by-step app build master plan

Status: Master plan for next implementation.

Focus: App first. The website and app must use the same backend/database. The app is for patients and physiotherapists, but the patient experience must be extremely simple, inspired by Duolingo-style progress.

---

# Product principle

## One sentence

```text
Pacienti skanon QR ose shkruan kodin, hap rrugën e rikuperimit, kryen ushtrimet, raporton dhimbjen dhe merr AI feedback vetëm kur fizioterapeuti e ka lejuar.
```

## App users

1. Patient
2. Physiotherapist
3. Owner/admin

## Priority order

1. Patient app
2. Physiotherapist app
3. Shared backend/API
4. Mobile Expo app
5. Admin/billing polish
6. Public website polish

---

# Non-negotiable rules

These rules must stay the same in web app, mobile app and website.

```text
1. Patient enters only one code.
2. QR opens /p/[code].
3. One code belongs to one patient only.
4. Patient sees only their assigned plan.
5. Patient cannot create or change plan.
6. Physiotherapist creates and controls plan.
7. Physiotherapist access costs 29.90 EUR/month.
8. AI gives movement-quality feedback only.
9. AI does not diagnose.
10. AI does not prescribe therapy.
11. Pain 7/10 or more = stop + contact physiotherapist.
12. Supabase service-role key stays server-only.
```

---

# STEP 0 — Freeze shared backend rules

Goal: stop repeating important rules in many files.

## 0.1 Create shared constants

Create:

```text
lib/shared/constants.ts
```

Must include:

```text
PATIENT_CODE_COOKIE = fizioplan_patient_code
PAIN_STOP_THRESHOLD = 7
AI_LOW_SCORE_THRESHOLD = 60
PHYSIO_MONTHLY_PRICE_EUR = 29.90
```

## 0.2 Create clinical safety helpers

Create:

```text
lib/shared/clinical-safety.ts
```

Functions:

```text
isHighPain(score)
isLowAiScore(score)
getPainSafetyMessage(score)
getAiSafetyMessage(score)
```

## 0.3 Create recovery score helper

Create:

```text
lib/shared/recovery-score.ts
```

Formula:

```text
Recovery Score =
40% AI average
25% completion
20% pain safety
15% streak
```

Labels:

```text
85–100 Shumë mirë
65–84 Mirë
40–64 Kërkon kujdes
0–39 Kontakto fizioterapeutin
```

## 0.4 Create route helpers

Create:

```text
lib/shared/routes.ts
```

Routes:

```text
patientPortal = /patient-portal
patientDashboard = /patient-dashboard
patientDirectAccess(code) = /p/[code]
patientAccessCard(code) = /patient-access/[code]
patientExercise(id) = /patient-exercise/[id]
aiCheck(id) = /ai-check?planExerciseId=[id]
```

## Acceptance criteria

- no hardcoded pain threshold in many files
- app and website use same messages
- future Expo app can reuse same constants

---

# STEP 1 — Database hardening

Goal: database prevents dangerous or inconsistent data.

## 1.1 Keep unique patient code

Already done, but must remain:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_code_unique_idx
ON public.patients (patient_code)
WHERE patient_code IS NOT NULL AND patient_code <> '';
```

## 1.2 Add pain score range check

Migration:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exercise_logs_pain_score_range'
  ) THEN
    ALTER TABLE public.exercise_logs
    ADD CONSTRAINT exercise_logs_pain_score_range
    CHECK (pain_score IS NULL OR (pain_score >= 0 AND pain_score <= 10));
  END IF;
END $$;
```

## 1.3 Add AI score range check

Migration:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_checks_score_range'
  ) THEN
    ALTER TABLE public.ai_checks
    ADD CONSTRAINT ai_checks_score_range
    CHECK (score IS NULL OR (score >= 0 AND score <= 100));
  END IF;
END $$;
```

## 1.4 Prepare patient_sessions for mobile later

Migration:

```sql
CREATE TABLE IF NOT EXISTS public.patient_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL,
  device_label text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Acceptance criteria

- duplicate patient codes impossible
- pain outside 0–10 impossible
- AI score outside 0–100 impossible
- mobile session model ready

---

# STEP 2 — Patient app: simple Duolingo-style login

Goal: patient opens app without confusion.

Route:

```text
/patient-portal
```

## 2.1 Screen layout

Only show:

```text
Fizioterapia ime
Enter your code
Continue
Scan QR note
Help note
```

## 2.2 Remove complexity

Do not show:

- physio portal link as main CTA
- admin link
- long explanations
- too many cards

## 2.3 Error states

Errors:

```text
Kodi mungon
Kodi nuk është aktiv
Kodi nuk u gjet
```

## 2.4 Success

After valid code:

```text
/patient-dashboard
```

## Acceptance criteria

- patient understands in 3 seconds
- code input is large
- QR explanation is simple
- no username/password
- mobile-first

---

# STEP 3 — Patient app: recovery path dashboard

Goal: dashboard feels like a rehabilitation path, not a medical table.

Route:

```text
/patient-dashboard
```

Current status: started with Duolingo-inspired design.

## 3.1 Top status

Show:

```text
🔥 streak
💚 safety hearts
⭐ points
```

## 3.2 Main action card

Show:

```text
Today's exercise
Continue button
Progress bar
```

## 3.3 Recovery path

Show exercise nodes:

```text
✅ done
▶ current
🔒 future day
🤖 AI-enabled exercise
```

## 3.4 Exercise node behavior

Each node should open details inline now.

Later it should open:

```text
/patient-exercise/[planExerciseId]
```

## 3.5 Safety

Always visible:

```text
Dhimbje 7/10 ose më shumë = ndalo dhe kontakto fizioterapeutin.
```

## Acceptance criteria

- patient sees only today's recovery path
- future days appear locked
- done/current states are obvious
- AI appears only where enabled
- pain warning appears when needed

---

# STEP 4 — Patient exercise detail screen

Goal: one exercise feels like one Duolingo lesson.

New route:

```text
/patient-exercise/[planExerciseId]
```

## 4.1 Backend validation

Before showing screen:

```text
current patient code cookie
→ find patient
→ verify planExercise belongs to patient
```

If not valid:

```text
redirect /patient-dashboard
```

## 4.2 Screen sections

Show:

```text
Exercise name
Video/image placeholder
Sets/reps/frequency
Simple instruction
Pain input 0–10
Complete button
AI Check button if enabled
Safety note
```

## 4.3 Pain input

Use button scale, not dropdown:

```text
0 1 2 3 4 5 6 7 8 9 10
```

Colors:

```text
0–3 green
4–6 orange
7–10 red
```

## 4.4 Complete action

On submit:

- insert exercise_log
- if pain >= 7, notify/log physiotherapist
- return to dashboard or next exercise

## Acceptance criteria

- patient can focus on one exercise
- no clutter
- safe pain reporting
- AI route gets correct planExerciseId

---

# STEP 5 — AI Movement Check screen

Goal: AI is helpful but not dangerous.

Route:

```text
/ai-check?planExerciseId=[id]
```

## 5.1 Pre-check screen

Before camera:

```text
AI Movement Check is feedback only.
It does not diagnose.
Stop if pain is 7/10 or more.
```

## 5.2 Camera screen

Show:

- camera preview
- movement status
- score
- simple feedback
- save result button

## 5.3 Backend validation

API must verify:

```text
planExerciseId belongs to current patient
exercise is AI-enabled
```

## 5.4 Save result

Table:

```text
ai_checks
```

If score < 60:

```text
alert_type = contact_physio / needs_attention
notify/log physiotherapist
```

## Acceptance criteria

- AI cannot be used on someone else's exercise
- AI not shown for disabled exercises
- low score creates alert
- text never sounds like diagnosis

---

# STEP 6 — Patient messages and reminders

Goal: patient knows what to do next.

## 6.1 Messages

Patient sees:

```text
latest physiotherapist messages
plan update messages
safety alerts
```

## 6.2 Reminders

In-app reminders first:

```text
Today's exercises are ready
You missed yesterday
Plan updated
Re-control due
```

## 6.3 Future push notifications

Later with Expo:

```text
Push notification reminders
```

## Acceptance criteria

- reminders are helpful, not noisy
- safety alerts are separated from motivational reminders
- messages are visible in app and web

---

# STEP 7 — Physiotherapist app: coach dashboard

Goal: physiotherapist sees what matters first.

Route:

```text
/physiotherapist-portal
```

## 7.1 First screen

Show only:

```text
Patients needing attention
Create patient
Active plans
High pain alerts
Low AI alerts
```

## 7.2 Patient list

Columns:

```text
Patient
Code
QR
Plan
Pain
AI
Status
Report
```

## 7.3 Quick actions

Actions:

```text
Print QR / Kod
Open patient detail
Edit plan
Send message
PDF report
```

## Acceptance criteria

- physiotherapist can identify risk in 10 seconds
- create patient is easy
- QR is one click
- no unnecessary complexity

---

# STEP 8 — Physiotherapist patient detail

Goal: one patient page with everything.

New route:

```text
/physio/patient/[patientId]
```

## 8.1 Backend validation

Physio can see patient only if:

```text
patients.physio_id = current profile.id
```

Owner/admin can access explicitly.

## 8.2 Sections

Show:

```text
Patient info
Code + QR
Active plan
Recovery path
Exercise logs
Pain trend
AI trend
Messages
Report button
```

## 8.3 Actions

```text
Edit plan
Add exercise
Send message
Print QR
Generate report
Archive patient
```

## Acceptance criteria

- physio sees full patient story
- ownership is protected
- patient detail mirrors patient app path

---

# STEP 9 — Plan builder

Goal: physiotherapist creates plan without complicated software.

## 9.1 Template start

Physio chooses:

```text
Lumbosciatica
Neck pain
Knee rehab
Shoulder mobility
Core stability
General mobility
```

## 9.2 Day-by-day view

Show:

```text
Day 1
Day 2
Day 3
...
```

Each day has exercises.

## 9.3 Exercise assignment

Fields:

```text
exercise
sets
reps
frequency
instructions
AI enabled or not from library
```

## 9.4 Publish plan

Patient sees only published/active plan.

## Acceptance criteria

- template creates plan fast
- physio can edit safely
- patient app updates from same database

---

# STEP 10 — Shared API for mobile app and website

Goal: mobile app and website use the same backend.

## 10.1 Patient API routes

Create:

```text
POST /api/patient/login-code
GET  /api/patient/me
GET  /api/patient/plan
GET  /api/patient/exercises
POST /api/patient/exercise-log
GET  /api/patient/messages
POST /api/patient/logout
```

## 10.2 Use shared validation

Every API uses same helpers:

```text
getCurrentPatientByCode
requirePatientPlanExercise
isHighPain
isLowAiScore
```

## 10.3 Mobile compatibility

Expo app later uses JSON APIs, not server actions.

## Acceptance criteria

- web app and mobile app receive same data
- no service-role key in mobile
- no duplicate business logic

---

# STEP 11 — Mobile Expo app

Goal: real app for patients first.

Folder:

```text
apps/mobile-app
```

## 11.1 Screens

Build in order:

```text
Splash
Code login
Recovery path dashboard
Exercise detail
AI Movement Check
Messages
Profile/logout
```

## 11.2 Deep links

Support later:

```text
fizioterapiaime://p/[code]
https://fizioterapia-ime.vercel.app/p/[code]
```

## 11.3 Mobile storage

For first MVP:

- store patient session token/code securely
- validate with backend API

Later better:

```text
patient_sessions table
```

## Acceptance criteria

- patient can use app without website
- QR link can open app later
- same backend data

---

# STEP 12 — Admin/billing app

Goal: keep simple and functional.

## 12.1 Admin dashboard

Show:

```text
active physiotherapists
blocked physiotherapists
MRR
subscription status
safety alerts
usage
```

## 12.2 Billing

Rule:

```text
29.90 EUR/month per physiotherapist
```

Actions:

```text
activate +1 month
block
view invoice reference
```

## 12.3 Exercise library admin

Owner/admin can manage default exercises.

## Acceptance criteria

- owner can control access
- unpaid physio cannot create patients/plans
- admin sees safety issues

---

# STEP 13 — Reports

Goal: reports use the same data.

Route:

```text
/reports/[patientId]
```

## Report data

Use:

```text
patients
plans
plan_exercises
exercise_logs
ai_checks
physio_messages
```

## Report types

```text
Weekly summary
End-of-plan report
Progress report
```

## Acceptance criteria

- report matches patient app data
- no duplicate fake data
- printable PDF

---

# STEP 14 — QA and production checks

Goal: test before clinic demo.

## Test patient flow

```text
create patient
get code
open /patient-access/[code]
scan/open /p/[code]
open dashboard
complete exercise
pain 3/10
pain 7/10
AI check
view report
logout
```

## Test physio flow

```text
login
subscription active
create patient
print QR
add exercise
view alerts
open report
```

## Test security

```text
wrong code fails
patient cannot open another planExerciseId
physio cannot access another physio patient
service-role not exposed
pain score range enforced
AI score range enforced
```

## Test deploy

```text
Vercel READY
runtime logs no critical errors
Supabase migrations applied
routes return 200/redirect correctly
```

---

# Build order checklist

## Immediate next tasks

```text
[ ] Create shared constants/safety helpers
[ ] Polish /patient-portal Duolingo-style
[ ] Create /patient-exercise/[planExerciseId]
[ ] Add pain button scale 0–10
[ ] Add DB range checks migration
[ ] Add patient JSON API endpoints
```

## After that

```text
[ ] Physio patient detail route
[ ] Coach dashboard simplification
[ ] Patient messages/send message flow
[ ] Alerts center
[ ] Expo mobile screens
[ ] Admin/billing polish
[ ] Final QA
```

---

# Final MVP definition

Fizioterapia ime app is MVP-ready when:

```text
1. Physio creates patient.
2. System creates unique patient code.
3. QR opens patient access.
4. Patient enters only code.
5. Patient sees recovery path.
6. Patient completes exercises.
7. Patient reports pain 0–10.
8. Pain 7+ triggers stop warning and physio alert.
9. AI check works only for AI-enabled assigned exercises.
10. Physio sees patient progress and alerts.
11. Report can be printed.
12. App and website use the same backend/database.
13. No patient can access another patient's data.
14. Product looks simple, friendly and clinic-ready.
```
