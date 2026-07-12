# Fizioterapia ime — App-first detailed product plan

Status: Working plan.

## Decision

Focus first on the app experience.

Priority order:

1. Patient app
2. Physiotherapist app/dashboard
3. Admin/owner dashboard
4. Website/marketing pages
5. Store release and scale

Reason:

The main value is not the landing page. The main value is the daily flow between patient and physiotherapist:

```text
Physiotherapist creates plan → patient follows exercises → pain/AI/progress is tracked → physiotherapist reacts when needed
```

## Product structure

Fizioterapia ime has three user types.

### 1. Patient

Patient uses app/mobile-first interface.

Patient can:

- enter with code only
- scan QR code
- see active plan
- see today’s exercises
- watch/read exercise instructions
- complete exercises
- report pain 0–10
- use AI Movement Check only when enabled
- see progress
- see safety warnings
- receive messages/reminders

Patient cannot:

- create own plan
- choose diagnosis
- change exercises
- edit therapy
- access another patient’s data
- use AI as diagnosis

### 2. Physiotherapist

Physiotherapist uses web app first, later mobile/tablet app.

Physiotherapist can:

- sign in with Clerk
- pay/activate 9.90 EUR/month access
- create patient
- generate unique patient code
- print/share QR card
- choose clinical template
- create/edit exercise plan
- add private exercises
- monitor progress
- review pain alerts
- review AI alerts
- send messages/reminders
- generate PDF reports

Physiotherapist cannot:

- access another physiotherapist’s private patients unless owner/admin
- use dashboard without active subscription
- let AI change plans automatically

### 3. Owner/Admin

Admin uses hidden owner web dashboard.

Admin can:

- see platform overview
- manage physiotherapists
- activate/block subscriptions
- see MRR
- see clinical safety alerts
- manage default exercise library
- monitor notification logs
- prepare clinic launch

Admin is not the first app priority.

## App-first build philosophy

Every screen must feel like a real app, not a database table.

Design rules:

- mobile-first
- clean white cards
- teal/green clinical brand
- soft shadows
- rounded cards
- minimal text
- clear primary action
- Apple-style spacing
- patient sees only what matters today
- physiotherapist sees only what needs attention

## Phase A — Patient app core

Goal: patient can use the app alone at home.

### A1. Code-only login

Screen:

```text
Enter your code
or scan QR
```

Requirements:

- patient enters only one code
- no username
- no password
- no Clerk
- code is validated server-side
- code belongs to exactly one patient
- httpOnly cookie session
- wrong code shows friendly error

Routes:

```text
/patient-portal
/p/[code]
/patient-dashboard
```

Acceptance criteria:

- patient with valid code enters dashboard
- invalid code is rejected
- QR opens dashboard
- no username is shown as required login field

### A2. Patient home screen

The patient should see:

```text
Good morning, Arber
Today's exercises
Progress
Pain
Recovery Score
Continue
```

Requirements:

- plan title
- diagnosis/problem label
- current day
- progress percent
- number of completed exercises
- latest pain score
- latest AI score
- safety warning when needed

Acceptance criteria:

- patient understands what to do in 5 seconds
- no clutter
- no clinical admin table

### A3. Today exercises

Each exercise card shows:

- exercise name
- image/video placeholder
- sets/reps/frequency
- instructions
- status: done/not done
- pain score input
- complete button
- AI button only if AI is enabled

Acceptance criteria:

- patient can complete exercise
- pain score saves to Supabase
- completed state updates
- pain 7/10+ triggers warning and notification/log

### A4. Plan timeline

Show plan as days:

```text
Day 1 ✓
Day 2 ✓
Day 3 Today
Day 4 Locked/Next
```

Requirements:

- show current day
- show completed days
- show upcoming days
- keep it simple

Acceptance criteria:

- patient can see progress through the plan
- no confusion about which day is active

### A5. Recovery Score

Recovery Score is user-facing combination of:

- AI score if available
- pain trend
- exercise completion

Rules:

```text
85–100 = Excellent progress
65–84 = Good progress
0–64 = Needs attention
```

Important:

Recovery Score is motivational. It is not diagnosis.

Acceptance criteria:

- score is visible
- safety wording remains clear
- low score does not automatically change plan

### A6. Pain safety flow

If pain >= 7:

- show red/orange warning
- tell patient to stop
- tell patient to contact physiotherapist
- notify/log for physiotherapist

Wording:

```text
Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.
```

Acceptance criteria:

- warning appears immediately after high pain log
- physiotherapist dashboard shows alert

### A7. AI Movement Check

AI is only available per exercise when enabled by physiotherapist.

AI can:

- detect body landmarks
- provide movement quality feedback
- save score
- save feedback
- show low score warning

AI cannot:

- diagnose
- prescribe
- change plan
- replace physiotherapist

Wording:

```text
AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk vendos diagnozë dhe nuk e zëvendëson fizioterapeutin.
```

Acceptance criteria:

- AI route validates patient code session
- AI validates exercise belongs to patient
- score saves only for assigned exercise

### A8. Patient messages/reminders

Patient should see:

- message from physiotherapist
- reminder to complete exercises
- reminder for re-control
- safety reminder

Initial MVP:

- show messages from `physio_messages`
- later add push notifications

Acceptance criteria:

- messages appear in dashboard
- no spam/clutter

## Phase B — Physiotherapist app/dashboard

Goal: physiotherapist can run daily practice.

### B1. Premium dashboard overview

Top dashboard should show:

- sessions today
- active patients
- active programs
- billing/subscription status
- pain alerts
- low AI alerts

Acceptance criteria:

- physiotherapist immediately sees who needs attention
- dashboard looks like modern clinic software

### B2. Patient creation

Physiotherapist creates patient with:

- first name
- last name
- phone
- age
- diagnosis/problem
- clinical template
- plan title optional

System automatically creates:

- unique patient code
- patient QR
- patient record
- active plan
- template exercises

Acceptance criteria:

- one click creates usable patient plan
- code is unique
- QR card exists

### B3. Patient QR/code card

Each patient has actions:

- Printo QR
- Testo linkun
- PDF report

Routes:

```text
/patient-access/[code]
/p/[code]
/reports/[patientId]
```

Acceptance criteria:

- QR opens patient login/dashboard flow
- card is printable

### B4. Patient monitoring

For each patient show:

- plan name
- progress
- latest pain
- latest AI score
- last completed exercise
- alert status

Acceptance criteria:

- pain 7/10+ visible as alert
- AI score under 60 visible as alert

### B5. Plan builder

Physiotherapist can:

- choose patient
- choose exercise
- set sets/reps/day
- write instructions
- save to active plan

Acceptance criteria:

- ownership checks stay enforced
- blocked/unpaid physio cannot write

### B6. Exercise library

Two library types:

1. Default exercises by admin
2. Private exercises by physiotherapist

Exercise fields:

- name
- category
- diagnosis
- instructions
- video URL/image later
- AI enabled yes/no

Acceptance criteria:

- physiotherapist can use default exercises
- physiotherapist can create private exercises
- no access to other physio private exercises

### B7. Reports

Physiotherapist can generate PDF-style report with:

- patient info
- plan info
- adherence
- pain trend
- AI checks
- clinical summary
- re-control note

Acceptance criteria:

- report loads from real data
- browser print/save as PDF works

## Phase C — App design system

Goal: all screens look consistent.

Design tokens:

- primary: teal/green
- background: light blue/white clinical gradient
- cards: white glass
- border: soft slate line
- text: dark navy
- warning: orange/red
- success: green

Components:

- AppShell
- Sidebar
- Topbar
- MobilePhoneFrame
- KPI Card
- PatientExerciseCard
- PlanTimeline
- SafetyBanner
- QRCard
- ReportCard
- EmptyState
- FormCard

Acceptance criteria:

- patient app and physio dashboard look like one product
- no ugly default table feel
- mobile screens feel native

## Phase D — Mobile Expo app

Goal: prepare real mobile app package.

Mobile app screens:

1. Splash screen
2. Code login
3. Patient home
4. Today exercises
5. Exercise detail
6. AI Movement Check
7. Progress
8. Messages
9. Profile/safety

Mobile app must reuse same logic:

- code-only access
- no service role key in mobile
- server API routes only
- camera permission for AI
- safety wording

Acceptance criteria:

- Expo preview build can be generated
- app icons/splash generated
- no secret keys in mobile app

## Phase E — Notifications

Initial:

- dashboard alerts
- notification logs
- email via Resend if configured

Later:

- push notification
- missed exercise reminder
- plan updated reminder
- weekly summary
- re-control reminder

Notification examples:

```text
Ushtrimet e sotme janë gati.
Ke harruar ushtrimet dje.
Fizioterapeuti e përditësoi planin.
Koha për rikontroll.
```

Acceptance criteria:

- no medical claims
- all safety alerts are visible

## Phase F — Admin after app core

Admin is after patient/physio app core.

Admin should manage:

- subscriptions
- physiotherapists
- default exercise library
- safety alerts
- usage/MRR
- notification logs

Do not over-focus on admin before patient/physio app is solid.

## Phase G — Launch readiness

Before launch:

- patient code-only flow tested
- QR tested
- patient dashboard tested
- exercise complete tested
- pain alert tested
- AI check tested
- physio create patient tested
- physio print QR tested
- report tested
- subscription gate tested
- no runtime errors in Vercel logs

## Current app priorities

### Priority 1

Finish patient app screens:

- patient portal premium login
- patient dashboard polished
- exercise detail screen
- AI check screen polish
- progress/timeline screen
- messages screen

### Priority 2

Finish physiotherapist dashboard:

- premium dashboard polish
- better patient detail view
- better plan builder
- QR/print actions
- alerts view

### Priority 3

Make real demo clinic:

- demo physio
- demo patients
- demo plans
- demo logs
- demo AI checks
- demo messages

### Priority 4

Mobile Expo app:

- generate assets
- connect to API routes
- build preview

## What we should NOT do yet

Do not spend too much time on:

- big marketing website
- investor pages
- complex admin analytics
- payments automation
- too many AI features
- replacing physiotherapist decisions

First make the core app beautiful and usable.

## Final product promise

```text
Fizioterapia ime helps physiotherapists create safe home exercise plans, and helps patients follow them simply with code/QR, progress tracking, pain reporting, AI movement feedback, and clear re-control reminders.
```

## Next build step

Start with:

```text
Patient Portal premium code-only login screen
```

Then continue:

```text
Exercise detail screen → AI check polish → Progress screen → Messages screen
```
