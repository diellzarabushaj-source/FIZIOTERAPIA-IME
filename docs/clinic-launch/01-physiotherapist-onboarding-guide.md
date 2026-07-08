# Physiotherapist Onboarding Guide

Status: Draft for clinic use.

## Purpose

This guide explains how a physiotherapist starts using Fizioterapia ime in the clinic.

The physiotherapist can:

- sign in with Clerk
- access dashboard after subscription activation
- create patients
- generate unique patient code
- print or share QR code
- select clinical program templates
- assign exercises
- track pain and AI scores
- generate progress PDF reports

## Before onboarding

Admin must confirm:

- physiotherapist profile exists in `profiles`
- physiotherapist email is correct
- subscription is active
- subscription price is 29.90 EUR/month
- physiotherapist understands AI safety rules

## Step 1 — Sign in

Open:

```text
/physiotherapist-portal
```

Sign in with the physiotherapist email.

If access is blocked, admin must activate subscription through:

```text
/admin-billing
```

## Step 2 — Confirm billing access

The dashboard shows billing status.

Allowed:

```text
Qasje aktive
```

Blocked:

```text
Qasje e bllokuar
```

A blocked physiotherapist cannot create patients, exercises or plans.

## Step 3 — Create patient

Go to:

```text
Shto pacient
```

Fill:

- first name
- last name
- phone
- age
- diagnosis/problem
- clinical program template
- optional plan title

Then click:

```text
Ruaj pacientin + krijo planin
```

The system creates:

- patient record
- unique patient code
- active plan
- plan exercises
- safety note

## Step 4 — Give patient access

Patient access is code-only.

The patient does not need:

- username
- password
- account
- Clerk login

The patient needs only:

```text
patient_code
```

The code must be unique. One code belongs to one patient only.

## Step 5 — Print or share QR card

For a patient code like:

```text
ARB-123456
```

Open:

```text
/patient-access/ARB-123456
```

This page shows:

- QR code
- patient code
- short patient instructions
- clinical safety note

The patient can scan QR and enter directly.

Direct QR route:

```text
/p/ARB-123456
```

## Step 6 — Use clinical templates

Available templates:

- Lumbosciatica / low back pain
- Neck pain
- Knee rehabilitation
- Shoulder mobility
- Core stability
- General mobility

Each template includes:

- duration days
- goals
- red flags
- safety note
- exercises
- sets/reps/frequency
- AI recommended exercises

The physiotherapist remains responsible for checking and adjusting the plan.

## Step 7 — Manual plan editing

Use `Plan Builder manual` to add an exercise to an active patient plan.

Choose:

- patient
- exercise
- sets
- reps
- day number
- instructions

Safety rule remains active.

## Step 8 — Exercise library

Default exercises are visible to all physiotherapists.

Private exercises are visible only to the physiotherapist who created them.

Owner/admin can add default exercises.

Normal physiotherapist adds private exercises.

## Step 9 — Patient monitoring

Track:

- progress percentage
- completed exercises
- pain score
- AI score
- high pain alerts
- low AI alerts
- patient comments

Pain score 7/10 or higher means:

```text
Stop exercise + contact physiotherapist
```

AI score under 60 means:

```text
Review movement quality + consider contacting patient
```

## Step 10 — Reports

From patient table click:

```text
PDF
```

Report includes:

- patient details
- plan details
- adherence
- pain logs
- AI Movement Check results
- clinical summary

Use browser print to save PDF.

## Non-negotiable clinical wording

Say this to patients:

```text
AI Movement Check është vetëm feedback për lëvizje. Nuk është diagnozë dhe nuk e zëvendëson fizioterapeutin.
```

Say this for pain:

```text
Nëse dhimbja është 7/10 ose më shumë, ndalo ushtrimin dhe më kontakto.
```

## Quick daily workflow

1. Open physiotherapist portal.
2. Check high pain alerts.
3. Check low AI alerts.
4. Review new completed exercises.
5. Adjust plan if needed.
6. Message/call patient if safety threshold is reached.
7. Generate report when needed.
