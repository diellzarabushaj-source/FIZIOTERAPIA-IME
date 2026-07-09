# Fizioterapia ime — App-first detailed build plan

Status: Working plan.

Decision: Focus on the app experience first. Website, admin polish, marketing pages and investor pages come later.

## Product focus

Fizioterapia ime has three app surfaces, but the build priority is:

1. Patient app
2. Physiotherapist app/dashboard
3. Owner/admin app

For this phase, the patient app gets priority because it is the core product experience.

## Core product rule

The patient must have the simplest possible flow:

```text
Scan QR or enter one code → open personal plan → do today's exercises → report pain → optional AI Movement Check
```

The patient does not create an account.

The patient does not create a plan.

The patient does not choose exercises.

The patient only follows the plan assigned by the physiotherapist.

## Non-negotiable safety rules

- One code belongs to one patient only.
- Patient enters only one code.
- QR opens direct login route `/p/[code]`.
- Patient sees only their own assigned plan.
- Physiotherapist creates and controls the plan.
- AI Movement Check is movement-quality feedback only.
- AI does not diagnose.
- AI does not prescribe therapy.
- AI does not replace the physiotherapist.
- Pain 7/10 or higher means stop and contact the physiotherapist.
- Service-role key stays server-only.

---

# Phase A — Patient app foundation

Goal: Make the patient app feel finished, calm and premium.

## A1. Patient code login

Current status: implemented.

Need to polish:

- mobile-first login screen
- one large code input
- QR explanation
- clinic/physio branding
- error states
- loading state after submit
- support/help link

Routes:

```text
/patient-portal
/p/[code]
/patient-dashboard
```

Acceptance criteria:

- patient can enter only code
- invalid code shows clear error
- direct QR route works
- patient dashboard opens after valid code
- no username visible as required input

## A2. Patient dashboard home

Current status: redesigned as premium mobile dashboard.

Next polish:

- make first screen extremely simple
- show only today's most important information
- reduce noise
- improve empty state if no plan exists
- show next exercise clearly

Main widgets:

```text
Plan title
Current day
Progress
Recovery Score
Pain score
Today's exercises
Safety note
Bottom nav
```

Acceptance criteria:

- patient understands what to do within 5 seconds
- no clinical/admin complexity visible
- exercise actions are thumb-friendly
- bottom navigation looks app-like

## A3. Today's exercise flow

Goal: Each exercise should feel like one clean task.

For each exercise card:

- exercise name
- short dosage
- simple instruction
- completion status
- pain score dropdown 0–10
- optional comment
- complete button
- AI button only when enabled

Needed improvement:

- create single exercise detail screen later
- add video/image area
- add timer for stretches
- add clearer completed animation

Acceptance criteria:

- patient can complete exercise easily
- pain score is saved
- high pain warning appears
- AI button is not shown for non-AI exercises

## A4. Exercise detail screen

New route planned:

```text
/patient-exercise/[planExerciseId]
```

Purpose:

- bigger video/image area
- exercise instructions
- sets/reps/timer
- pain score form
- completion button
- AI Movement Check link
- safety note

Acceptance criteria:

- exercise card can open detail screen
- detail screen validates patient owns exercise
- completion works from detail screen
- AI opens with correct `planExerciseId`

## A5. Pain reporting

Current status: implemented.

Polish needed:

- pain score UI should be buttons/slider, not just dropdown
- 0–3 green, 4–6 orange, 7–10 red
- if patient selects 7+, show stop warning before save
- notify/log physiotherapist

Acceptance criteria:

- pain is always 0–10
- pain 7+ triggers warning and notification flow
- patient sees clear clinical instruction

## A6. Recovery Score

Current status: basic calculated score.

Improve logic:

Inputs:

- AI average
- pain average
- completion percentage
- consistency/streak

Suggested formula:

```text
Recovery Score =
40% AI average
25% completion
20% pain improvement
15% streak/consistency
```

Labels:

```text
85–100 Excellent progress
65–84 Good progress
40–64 Needs attention
0–39 Contact physiotherapist
```

Acceptance criteria:

- score is understandable
- score never claims diagnosis
- score is explained as progress indicator

## A7. AI Movement Check inside app

Current status: route and API exist.

Focus:

- camera permission page
- movement check screen
- live feedback text
- save AI result
- low score warning
- physiotherapist alert

Rules:

- AI only feedback
- no diagnosis
- no plan changes
- no treatment prescription

Acceptance criteria:

- AI works only for assigned exercise
- patient cannot send AI check for another patient's exercise
- low AI score under 60 logs alert
- if no camera permission, show fallback instruction

## A8. Messages

Current status: patient can see messages from physio.

Planned app feature:

- patient message list
- physiotherapist messages
- system safety alerts
- re-control reminders

Later:

- two-way chat if needed

Acceptance criteria:

- patient sees latest instructions
- messages do not replace emergency care
- physio/admin can review communication history

## A9. Notifications/reminders

MVP approach:

- in-app reminders first
- email later
- push notifications later with Expo

Notification types:

```text
Today's exercises are ready
You missed yesterday's exercises
Pain 7+ warning
Plan updated
Re-control reminder
```

Acceptance criteria:

- reminders are visible inside app
- no spam
- clinical alerts are separate from motivational reminders

## A10. Offline-friendly behavior

For mobile later:

- cache current plan
- cache instructions
- allow patient to view exercises offline
- sync completion when online

MVP web can skip offline save, but Expo mobile should plan for it.

---

# Phase B — Physiotherapist app/dashboard

Goal: Make physiotherapist dashboard look like the reference image and work like a real clinic tool.

## B1. Premium dashboard layout

Current status: started.

Includes:

- sidebar
- topbar
- KPI cards
- patient table
- safety banner
- phone preview
- reminders

Next polish:

- patient search
- filters by diagnosis/status
- quick actions menu
- better patient details drawer

## B2. Create patient

Current status: implemented.

Important:

- app generates unique code
- QR card available
- plan template creates plan
- patient does not need username/password

Next polish:

- after creating patient, show success screen with code + QR
- add button `Printo QR / Kod`
- add button `Dërgo kodin pacientit`

## B3. Patient detail screen

New route planned:

```text
/physio/patient/[patientId]
```

Purpose:

- patient profile
- code + QR
- current plan
- exercise list
- pain trend
- AI trend
- messages
- report button
- plan edit actions

Acceptance criteria:

- physio only sees own patients
- owner/admin can access if needed
- patient data is not mixed between users

## B4. Plan builder

Current status: template + manual exercise assignment.

Next:

- visual plan timeline
- day-by-day builder
- drag/reorder later
- duplicate template
- save plan draft
- publish plan

Clinical rule:

- AI can suggest, but physiotherapist decides.

## B5. Exercise library

Current status: default + private exercises.

Next:

- exercise detail modal
- video/image support
- category filters
- AI-enabled filter
- default template mapping

## B6. Alerts center

Needed:

- high pain alerts
- low AI alerts
- inactive patient alerts
- missed exercises
- plan ending soon

Acceptance criteria:

- pain 7+ always visible
- low AI score under 60 visible
- alerts can be reviewed and marked handled later

## B7. Reports

Current status: PDF route exists.

Next:

- report preview inside patient detail
- one-click print PDF
- weekly summary
- end-of-plan report

---

# Phase C — Owner/admin app

Goal: Keep admin hidden and functional. Do not prioritize visual polish until patient and physio app are good.

Admin must do:

- see physiotherapists
- activate/block subscription
- see MRR
- see usage
- see safety alerts
- manage default exercise library

Billing rule:

```text
Physiotherapist access = 29.90 EUR / month
```

Admin app can remain simple for now.

---

# Phase D — Mobile Expo app

Goal: convert the patient experience into a real mobile app.

Current app folder:

```text
apps/mobile-app
```

Priority screens:

1. Splash
2. Code login
3. Patient dashboard
4. Today's exercises
5. Exercise detail
6. AI Movement Check
7. Messages
8. Profile/logout

Technical notes:

- do not put Supabase service-role key in mobile app
- use server API routes for sensitive actions
- patient auth should still be code-based
- QR deep link should open app later

Planned deep links:

```text
fizioterapiaime://p/[code]
https://fizioterapia-ime.vercel.app/p/[code]
```

---

# Phase E — Design system

Style direction based on reference image:

- teal/green medical brand
- white cards
- soft glass background
- rounded 16–32px cards
- clean sidebar for physio
- phone-first patient UI
- large readable typography
- minimal text for patient
- professional SaaS metrics for physio

Components to standardize:

```text
AppShell
Sidebar
Topbar
MetricCard
AlertBanner
PatientCard
ExerciseCard
RecoveryScoreCard
PainScoreInput
BottomNav
QRCodeCard
ReportButton
```

---

# Build order from now

## Step 1 — Finish patient app screens

- polish `/patient-portal`
- polish `/patient-dashboard`
- add `/patient-exercise/[planExerciseId]`
- improve pain score input
- improve empty states

## Step 2 — Finish physiotherapist app screens

- polish `/physiotherapist-portal`
- add patient detail route
- add QR success card after patient creation
- add alerts center

## Step 3 — App testing with demo patient

- create one real demo patient
- test QR route
- test code login
- test exercise completion
- test pain 7+ alert
- test AI check
- test PDF report

## Step 4 — Expo mobile app

- copy app design into Expo screens
- add code login
- add patient dashboard
- add exercise detail
- prepare preview build

## Step 5 — Admin/billing polish

- only after patient/physio flow is smooth

---

# MVP app definition

The app is MVP-ready when:

- physiotherapist can create patient
- patient gets unique code and QR
- patient opens dashboard with code
- patient sees exercises
- patient completes exercises
- patient reports pain
- pain 7+ creates warning/alert
- AI Movement Check saves result for enabled exercises
- physiotherapist sees progress
- report can be generated
- no patient can access another patient's data
- app looks premium enough for a clinic demo

---

# Current next implementation step

Next code task:

```text
Polish /patient-portal into premium mobile-first code login screen.
```

After that:

```text
Create /patient-exercise/[planExerciseId] detail screen.
```
