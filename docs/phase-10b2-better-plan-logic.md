# Phase 10B.2 — Better plan logic based on Replit decisions

Status: Implemented.

## Why this phase exists

The Replit ZIP memory showed that the safest product logic is more important than only making the UI look good:

- patient auth must stay username + code
- physio/admin auth must stay Clerk
- service-role key must stay server-only
- physio write actions need billing gate
- patient/plan writes need ownership checks
- AI must never diagnose
- pain 7/10 or higher means stop/contact physiotherapist

Based on that, this phase improves the plan builder logic so the app becomes more clinical and production-ready.

## What was improved

### 1. Clinical templates are now richer

Updated:

```text
lib/clinical-programs.ts
```

Templates now include:

- clinical goals
- red flags
- safety note
- AI safety rule
- exact exercise sequence
- day number
- sets/reps/frequency
- clinical instructions
- AI recommended flag

Programs now feel closer to a physiotherapy plan instead of a random exercise list.

### 2. Exercise library expanded

Added:

```text
supabase/seed-expanded-clinical-exercises.sql
```

New default exercises:

- Chin tuck
- Scapular setting
- Thoracic rotation
- Quad sets
- Heel slides
- Straight leg raise
- Sit to stand
- Pendulum shoulder exercise
- Wall slides
- Dead bug
- Bird dog

These are now also inserted into Supabase production as published default exercises.

### 3. AI-enabled exercises are more selective

AI is enabled only where movement-quality feedback makes sense, for example:

- Chin tuck
- Scapular setting
- Straight leg raise
- Sit to stand
- Wall slides
- Dead bug
- Bird dog
- Glute bridge
- Pelvic tilt
- Cat cow

Static stretches or very simple mobility drills can remain non-AI.

### 4. Patient creation now creates better plans

`createPatientAction()` now:

1. reads selected `programKey`
2. finds the matching clinical template
3. creates patient
4. creates plan with correct title and duration
5. finds matching default exercises in Supabase
6. inserts structured plan exercises
7. adds safety note to exercise instructions
8. falls back to default exercises if needed

## Result

A physiotherapist can now create a patient and select a real program template:

- Lumbosciatica
- Neck pain
- Knee rehab
- Shoulder mobility
- Core stability
- General mobility

The system then creates a structured plan instead of just adding three random default exercises.

## Next improvement

Phase 10B.3 should add a better UI preview before saving:

- show selected template goals
- show red flags
- show exercises that will be added
- show which exercises have AI check
- allow physio to confirm before creating plan

This would make the app feel more professional than the original Replit version.
