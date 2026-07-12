# Fizioterapia ime — Shared backend/database plan for app + website

Status: Working plan.

Decision: The app and website must use the same backend, the same database, the same patient codes, the same plans, the same exercise library and the same safety rules.

Do not build separate logic for app and website.

The web app, mobile app and public website should all point to one source of truth:

```text
Supabase database + Next.js API/server actions
```

---

# 1. System principle

## One backend, many frontends

There are multiple frontends:

1. Patient web app
2. Patient mobile app
3. Physiotherapist web dashboard
4. Physiotherapist mobile/tablet view later
5. Owner/admin web dashboard
6. Public marketing website

But they must all use the same backend objects:

```text
profiles
patients
exercise_library
plans
plan_exercises
exercise_logs
ai_checks
physio_messages
subscriptions
notifications
notification_logs
```

## Same rules everywhere

The same behavior must apply in web and mobile:

- patient enters only one code
- QR uses the same code
- one code belongs to one patient only
- patient sees only assigned plan
- physiotherapist creates and controls plan
- pain 7+ triggers safety warning
- AI is feedback only
- physiotherapist access requires active subscription
- admin/owner can manage subscriptions

---

# 2. Source of truth

Supabase is the source of truth for clinical/business data.

Next.js server routes/server actions are the secure gateway.

Mobile app must not directly use service role keys.

## Server-only secret rule

Never expose this to browser or mobile:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Allowed only in:

- Next.js server actions
- Next.js route handlers
- Vercel server environment

Not allowed in:

- Expo app
- React client components
- browser local storage
- public env vars

---

# 3. Shared database model

## profiles

Purpose: physiotherapists, admins, owner.

Used by:

- physiotherapist dashboard
- admin dashboard
- billing
- reports
- patient app only indirectly to show physio/clinic name

Important fields:

```text
id
clerk_user_id
email
role: owner | admin | physio
full_name
clinic_name
status
created_at
```

Rules:

- physiotherapist/admin login uses Clerk
- patient login does not use Clerk
- owner email should remain configurable with `ADMIN_EMAIL`

## patients

Purpose: one patient profile and one unique code.

Used by:

- patient app
- physiotherapist dashboard
- reports
- AI checks
- notifications

Important fields:

```text
id
physio_id
first_name
last_name
phone
age
diagnosis
patient_code
patient_username optional/backward compatibility
status
created_at
```

Rules:

- `patient_code` must be unique
- patient enters only `patient_code`
- QR route uses `patient_code`
- patient cannot create patient row
- physiotherapist creates patient row

Required DB constraint:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_code_unique_idx
ON public.patients (patient_code)
WHERE patient_code IS NOT NULL AND patient_code <> '';
```

## exercise_library

Purpose: all exercises.

Used by:

- physio dashboard
- patient app
- plan builder
- AI Movement Check
- reports

Important fields:

```text
id
name
category
diagnosis
instructions_sq
video_url
ai_enabled
scoring_rules
is_default
owner_physio_id
status
created_at
```

Rules:

- default exercises are shared by all physios
- private exercises belong to one physio
- AI button appears only if `ai_enabled = true`
- exercise content should be identical in web and mobile

## plans

Purpose: treatment/exercise plan assigned to patient.

Used by:

- patient app
- physio dashboard
- reports

Important fields:

```text
id
patient_id
physio_id
title
start_date
end_date
status
created_at
```

Rules:

- patient can have active plan
- physiotherapist creates/updates plan
- patient only reads assigned plan

## plan_exercises

Purpose: concrete exercises inside a plan.

Used by:

- patient app exercise list
- exercise detail
- AI route
- completion logs
- reports

Important fields:

```text
id
plan_id
exercise_id
sets
reps
frequency
day_number
instructions
created_at
```

Rules:

- every write must verify physio owns the patient
- patient can only access plan exercises assigned to their own patient ID
- AI route must validate `planExerciseId` belongs to current patient

## exercise_logs

Purpose: patient completion + pain score.

Used by:

- patient app
- physio alerts
- progress charts
- reports

Important fields:

```text
id
patient_id
plan_exercise_id
completed
pain_score
comment
completed_at
```

Rules:

- pain_score must be 0–10
- pain_score >= 7 triggers safety alert
- logs belong to patient
- physio can read logs for own patients

Recommended DB check:

```sql
ALTER TABLE public.exercise_logs
ADD CONSTRAINT exercise_logs_pain_score_range
CHECK (pain_score IS NULL OR (pain_score >= 0 AND pain_score <= 10));
```

## ai_checks

Purpose: store AI Movement Check result.

Used by:

- patient app
- physio dashboard
- alerts
- reports

Important fields:

```text
id
patient_id
plan_exercise_id
score
feedback
alert_type
created_at
```

Rules:

- score must be 0–100
- score < 60 creates low AI alert
- AI feedback cannot diagnose
- AI feedback cannot prescribe treatment

Recommended DB check:

```sql
ALTER TABLE public.ai_checks
ADD CONSTRAINT ai_checks_score_range
CHECK (score IS NULL OR (score >= 0 AND score <= 100));
```

## physio_messages

Purpose: messages from physiotherapist to patient.

Used by:

- patient app messages
- physio dashboard later

Important fields:

```text
id
patient_id
physio_id
message
created_at
```

Rules:

- physio can message own patients
- patient reads own messages
- messages are not emergency care

## subscriptions

Purpose: physiotherapist billing access.

Used by:

- physio dashboard paywall
- admin billing
- owner metrics

Important fields:

```text
id
physio_id
plan_name
price
currency
status
current_period_start
current_period_end
invoice_reference
created_at
```

Rules:

- active subscription unlocks physio write actions
- monthly price is 9.90 EUR
- owner/admin bypass can exist
- unpaid physiotherapist cannot create patients/plans

## notifications and notification_logs

Purpose: safety/business notifications.

Used by:

- pain alerts
- low AI alerts
- missed exercises later
- plan update alerts later

Important events:

```text
high_pain
low_ai_score
plan_updated
missed_exercise
subscription_expiring
subscription_blocked
recontrol_due
```

---

# 4. Shared API/server actions plan

The mobile app and website should not duplicate database rules.

Create a shared server API layer used by both.

## Patient API routes

Planned routes:

```text
POST /api/patient/login-code
GET  /api/patient/me
GET  /api/patient/plan
GET  /api/patient/exercises
POST /api/patient/exercise-log
POST /api/patient/ai-check
GET  /api/patient/messages
POST /api/patient/logout
```

Current existing routes/actions:

```text
/p/[code]
/patient-portal action
/patient-dashboard actions
/api/patient/ai-check
/api/patient/access-qr/[code]
```

Goal:

- keep current web routes
- add clean JSON APIs for Expo mobile
- both web and mobile use the same validation logic

## Physiotherapist API/server actions

Planned actions/routes:

```text
createPatient
createPlan
addExerciseToPlan
createPrivateExercise
getPhysioDashboard
getPatientDetail
sendMessageToPatient
markAlertHandled
```

Rules:

- every write checks subscription
- every patient write checks ownership
- owner/admin can access broader data

## Admin API/server actions

Planned:

```text
activateSubscription
blockSubscription
getOwnerMetrics
manageDefaultExercise
viewNotificationLogs
```

---

# 5. Auth model

## Patient auth

Patient auth is code-based.

Patient flow:

```text
code or QR → server validates code → httpOnly cookie/session → dashboard
```

Cookie:

```text
fizioplan_patient_code
```

Do not require patient username.

For mobile app later, use one of these:

Option A — session token created by backend:

```text
patient_sessions table
```

Option B — secure Expo storage with code + server validation per request.

Recommended later:

```text
patient_sessions
```

Fields:

```text
id
patient_id
session_token_hash
device_label
expires_at
created_at
revoked_at
```

This gives better security for mobile without using Clerk for patients.

## Physiotherapist/admin auth

Use Clerk.

Web:

```text
Clerk session → profile lookup → subscription check
```

Mobile physio app later:

- either Clerk mobile SDK
- or keep physio as web dashboard only first

---

# 6. Data ownership and IDOR prevention

Every route that accepts IDs must validate ownership.

## Patient side

If patient sends:

```text
planExerciseId
```

Server must verify:

```text
plan_exercises.plan_id → plans.patient_id = current patient.id
```

## Physiotherapist side

If physio sends:

```text
patientId
planId
exerciseId
```

Server must verify:

```text
patients.physio_id = profile.id
```

Default exercises allowed to all.
Private exercises only owner physio.

## Admin side

Owner/admin can access broader records, but this must be explicit.

---

# 7. Web app vs mobile app mapping

## Same patient screens

| Feature | Web route | Mobile screen | Backend |
|---|---|---|---|
| Code login | `/patient-portal` | CodeLoginScreen | patient code API |
| QR direct login | `/p/[code]` | Deep link | patient login API |
| Dashboard | `/patient-dashboard` | PatientHomeScreen | patient plan API |
| Exercise detail | `/patient-exercise/[id]` planned | ExerciseDetailScreen | plan exercise API |
| Complete exercise | server action | API call | exercise_logs |
| Pain score | server action | API call | exercise_logs |
| AI check | `/ai-check` | AiCheckScreen | ai_checks |
| Messages | dashboard section | MessagesScreen | physio_messages |
| Logout | server action | logout API | session clear |

## Same physiotherapist screens

| Feature | Web route | Mobile/tablet later | Backend |
|---|---|---|---|
| Dashboard | `/physiotherapist-portal` | later | profiles/patients/plans |
| Create patient | server action | later | patients/plans |
| Print QR | `/patient-access/[code]` | share QR later | QR endpoint |
| Patient detail | planned | later | patient detail API |
| Plan builder | dashboard | later | plans/plan_exercises |
| Reports | `/reports/[patientId]` | PDF/share later | reports data |

---

# 8. Database migration plan

## Already important

- patient_code unique index exists/applied
- base schema exists
- RLS exists
- subscriptions exist
- notifications exist

## Next migrations to prepare

### 1. Add patient_sessions for mobile

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

CREATE INDEX IF NOT EXISTS patient_sessions_patient_id_idx
ON public.patient_sessions(patient_id);

CREATE UNIQUE INDEX IF NOT EXISTS patient_sessions_token_hash_idx
ON public.patient_sessions(session_token_hash);
```

### 2. Add range checks

```sql
ALTER TABLE public.exercise_logs
ADD CONSTRAINT IF NOT EXISTS exercise_logs_pain_score_range
CHECK (pain_score IS NULL OR (pain_score >= 0 AND pain_score <= 10));

ALTER TABLE public.ai_checks
ADD CONSTRAINT IF NOT EXISTS ai_checks_score_range
CHECK (score IS NULL OR (score >= 0 AND score <= 100));
```

Postgres does not support `ADD CONSTRAINT IF NOT EXISTS` in all contexts, so implementation should wrap with `DO $$ BEGIN IF NOT EXISTS ... END IF; END $$;`.

### 3. Add plan update notifications

Later:

```text
plan_updated
new_message
recontrol_due
```

### 4. Add alert handled state

Possible table:

```text
clinical_alerts
```

Fields:

```text
id
patient_id
physio_id
source_type: high_pain | low_ai | missed_exercise
source_id
severity
status: open | handled | dismissed
handled_by
handled_at
created_at
```

For now notification logs are enough.

---

# 9. Shared business rules module

Create shared TypeScript modules so app and website do not drift.

Suggested files:

```text
lib/shared/constants.ts
lib/shared/patient-access.ts
lib/shared/clinical-safety.ts
lib/shared/recovery-score.ts
lib/shared/permissions.ts
lib/shared/routes.ts
```

## constants.ts

```text
PHYSIO_PRICE_EUR = 9.90
PAIN_STOP_THRESHOLD = 7
AI_LOW_SCORE_THRESHOLD = 60
PATIENT_CODE_COOKIE = fizioplan_patient_code
```

## clinical-safety.ts

Functions:

```text
isHighPain(score)
isLowAiScore(score)
getPainSafetyMessage(score)
getAiSafetyMessage(score)
```

## recovery-score.ts

Function:

```text
calculateRecoveryScore({ aiAverage, completionPercentage, painAverage, streakDays })
```

## permissions.ts

Functions:

```text
canPhysioAccessPatient(profile, patient)
canPatientAccessPlanExercise(patient, planExercise)
hasActivePhysioAccess(role, subscription)
```

---

# 10. Implementation priority from here

## Step 1 — Freeze shared backend rules

Create shared constants and safety modules.

Do not hardcode pain threshold and AI threshold in many files.

## Step 2 — Create mobile-ready patient API

Add JSON endpoints:

```text
/api/patient/login-code
/api/patient/me
/api/patient/plan
/api/patient/exercise-log
/api/patient/messages
```

Web can continue using server actions, but logic should move toward shared functions.

## Step 3 — Create patient exercise detail route

Add:

```text
/patient-exercise/[planExerciseId]
```

Use same backend validation as API.

## Step 4 — Add patient_sessions migration

Prepare mobile session model before Expo app gets serious.

## Step 5 — Expo app reads same backend

Expo app should call API routes, not Supabase service role.

---

# 11. What must stay identical in app and website

These must never differ:

- patient code logic
- QR access logic
- patient plan data
- exercise library data
- pain score rule
- AI score rule
- subscription status
- physiotherapist ownership rules
- report data
- notifications/alerts
- recovery score formula
- clinical disclaimer text

Shared text:

```text
AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk vendos diagnozë, nuk cakton terapi dhe nuk e zëvendëson fizioterapeutin.
```

Shared pain rule:

```text
Nëse dhimbja është 7/10 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin.
```

---

# 12. Next concrete task

Next implementation should not be only UI.

Next task:

```text
Create shared backend constants/safety modules + mobile-ready patient API plan files.
```

Then:

```text
Add /patient-exercise/[planExerciseId] using shared validation.
```

Then:

```text
Add patient_sessions migration for future mobile app.
```
