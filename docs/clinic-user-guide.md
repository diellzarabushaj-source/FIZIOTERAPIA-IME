# Fizioterapia ime — Clinic user guide

This guide is for the clinic owner, physiotherapist, and support team.

## Roles

### Owner/Admin

The owner/admin can:

- manage platform access
- activate physiotherapist subscription
- view admin dashboard
- manage default exercise library
- review billing status
- access reports when needed

Owner email:

```text
diellzarabushaj@gmail.com
```

### Physiotherapist

The physiotherapist can:

- create patients
- generate username + code
- create treatment plans
- use default exercises
- create private exercises
- monitor progress
- review pain score and AI score
- print PDF reports

The physiotherapist needs active access:

```text
29.90 EUR / month
```

### Patient

The patient can:

- log in with username + code
- view assigned plan
- complete exercises
- report pain 0–10
- use AI Movement Check if assigned
- view messages/instructions

The patient does not create a normal account.

## Daily workflow

### Step 1 — Activate physiotherapist

1. Owner signs in.
2. Opens `/admin-billing`.
3. Finds physiotherapist.
4. Enters invoice/reference.
5. Clicks `+ 1 muaj`.

### Step 2 — Create patient

1. Physiotherapist opens `/physiotherapist-portal`.
2. Clicks or scrolls to `Shto pacient`.
3. Adds name, phone, age, diagnosis, plan title.
4. Saves patient.
5. Gives patient username + code.

### Step 3 — Assign exercises

1. Physiotherapist selects patient.
2. Selects exercise from library.
3. Adds sets, reps, day number, and instructions.
4. Saves into plan.

### Step 4 — Patient uses app

1. Patient opens `/patient-portal`.
2. Enters username + code.
3. Opens daily plan.
4. Completes exercise.
5. Reports pain.
6. Uses AI check if available.

### Step 5 — Monitor progress

Physiotherapist checks:

- completed exercises
- latest pain score
- pain alerts
- AI score
- low AI score alerts
- PDF report

## Safety rules

### Pain score

If patient reports:

```text
0–6/10: continue only if safe and comfortable
7–10/10: stop exercise and contact physiotherapist
```

### AI Movement Check

AI is only a support tool for movement-quality feedback.

AI must not be described as:

- diagnosis
- prescription
- replacement for physiotherapist
- emergency tool

### Emergency symptoms

If patient reports severe/worsening symptoms, chest pain, dizziness, numbness, weakness, or emergency signs, they should stop exercising and contact a healthcare professional or emergency services.

## Reports

Reports are available from physiotherapist dashboard.

The report includes:

- patient details
- diagnosis/problem
- plan details
- adherence
- pain score
- AI score
- exercise list
- logs
- clinical summary

Use `Shkarko / Printo PDF` to save or print.

## Support workflow

When a patient has a problem:

1. Confirm username and code are typed correctly.
2. Confirm patient status is active.
3. Confirm plan exists.
4. Confirm exercises are assigned.
5. Confirm browser camera permission if AI check fails.
6. If pain is high, do not troubleshoot exercise continuation; tell patient to stop and contact physiotherapist.

## Data privacy

- Do not share patient codes publicly.
- Do not send screenshots with real patient data in public chats.
- Do not put service role keys in mobile app.
- Do not put secret keys in GitHub.
- Use demo patient only for reviewers and screenshots.

## Clinic launch recommendation

Start with 1–2 physiotherapists and 3–5 test patients before full launch.
