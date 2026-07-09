# Fizioterapia ime — Simple Duolingo-inspired app direction

Status: Started and pushed to GitHub.

## Goal

Make the app very simple, friendly and motivating, inspired by Duolingo-style learning paths, but adapted for physiotherapy.

This is not a copy of Duolingo. It uses the same type of simplicity:

- one main task at a time
- friendly progress path
- streak
- points
- hearts/safety
- big rounded buttons
- minimal text
- clear feedback

## App audiences

The product has two app experiences:

1. Patient app
2. Physiotherapist app

The patient app must be the simplest.

The physiotherapist app can have more data, but still should feel simple and guided.

---

# Patient app

## Patient flow

```text
Scan QR / enter code
→ Today's plan
→ Follow recovery path
→ Open exercise
→ Report pain
→ AI check if available
→ Done
```

## Patient sees only

- today's exercise
- recovery path
- progress
- streak
- hearts/safety
- pain score
- AI check if available
- messages from physiotherapist

Patient does not see:

- admin settings
- billing
- database details
- complex charts first
- plan builder
- other patients

## Duolingo-style physiotherapy concepts

| Duolingo concept | Fizioterapia ime concept |
|---|---|
| Lesson path | Recovery path |
| Lesson | Exercise |
| Streak | Rehab streak |
| Hearts | Safety/pain status |
| XP | Completed exercise points |
| Locked lessons | Future plan days |
| Daily goal | Today's exercises |
| Review mistake | Contact physio / repeat safely |

## Patient home screen

The patient should understand the screen in 5 seconds.

Top:

```text
🔥 streak
💚 safety hearts
⭐ progress points
```

Main card:

```text
Today's exercise
Big continue button
Progress bar
```

Path:

```text
Exercise node 1 ✅
Exercise node 2 ▶
Exercise node 3 🔒
Exercise node 4 🔒
```

Safety:

```text
Dhimbje 7/10 ose më shumë = ndalo dhe kontakto fizioterapeutin.
```

## Patient completion

Completion should feel like finishing a lesson:

- big green button
- small positive feedback
- progress increases
- streak continues
- points increase

But clinical safety is more important than motivation.

If pain is 7+:

- do not motivate continuation
- show stop warning
- notify physiotherapist

---

# Physiotherapist app

## Physiotherapist role

The physiotherapist is the coach.

They do not need a complicated medical software feel.

They need:

- patients needing attention
- create patient
- create plan
- assign exercises
- print QR/code
- see pain alerts
- see AI alerts
- generate report

## Simple physiotherapist dashboard

The first screen should show:

```text
Today
Patients needing attention
New patient
Active plans
High pain alerts
Low AI alerts
```

Then patient list:

```text
Patient name
Code
Status
Pain
AI
QR
Report
```

## Physiotherapist Duolingo-style idea

For physio, the app can show patient rehab progress like a path:

```text
Patient recovery path
Day 1 done
Day 2 done
Day 3 attention
Day 4 locked/future
```

Physio should quickly see:

- who is progressing
- who stopped
- who has pain
- who needs re-control

---

# Backend/database must stay the same

The simple UI must still use the real backend.

Do not fake different logic for app and website.

Same tables:

```text
patients
plans
plan_exercises
exercise_library
exercise_logs
ai_checks
physio_messages
subscriptions
notification_logs
```

Same rules:

- patient enters one code
- one code equals one patient
- QR uses `/p/[code]`
- patient dashboard reads only assigned plan
- physiotherapist owns their patients
- pain 7+ is stop/contact rule
- AI score under 60 is needs-attention rule
- AI does not diagnose

---

# What was changed now

## Patient dashboard

Updated `/patient-dashboard` into a simpler Duolingo-inspired recovery path.

New concepts added:

- streak
- safety hearts
- progress points
- big continue button
- recovery path
- exercise nodes
- done/current/locked states
- simplified safety text

## Files changed

- `app/patient-dashboard/page.tsx`
- `app/duo-app.css`
- `app/layout.tsx`

---

# Next steps

## Step 1

Polish `/patient-portal` as the simple code login screen:

```text
Enter code
or scan QR
Continue
```

## Step 2

Create exercise detail screen:

```text
/patient-exercise/[planExerciseId]
```

It should feel like one Duolingo lesson.

## Step 3

Simplify physiotherapist dashboard into coach mode:

```text
Patients needing attention
Create patient
Print QR
Reports
```

## Step 4

Create shared backend API for app + website so mobile Expo app uses the same data and rules.
