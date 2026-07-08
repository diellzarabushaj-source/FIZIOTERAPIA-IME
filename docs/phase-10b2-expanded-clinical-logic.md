# Phase 10B.2 — Expanded clinical logic + exercise library

Status: Implemented in GitHub.

## Goal

Use the Replit/artifacts logic as a base, then improve it so the plan builder becomes more clinically structured and safer.

## Files changed

- `lib/clinical-programs.ts`
- `supabase/seed-default-exercise-library-expanded.sql`

## What improved

### 1. Better template logic

The program templates now include:

- clinical goals
- red flags
- safety notes
- AI disclaimer
- day-based exercise progression
- specific exercise instructions
- AI-recommended movement checks

### 2. Expanded programs

Programs now have better exercises for:

- Lumbosciatica
- Neck pain
- Knee rehab
- Shoulder mobility
- Core stability
- General mobility

### 3. Expanded exercise library seed

Added SQL seed:

```text
supabase/seed-default-exercise-library-expanded.sql
```

This adds or updates default exercises:

- Chin tuck
- Scapular setting
- Thoracic rotation
- Quad sets
- Heel slides
- Straight leg raise
- Sit to stand
- Pendulum shoulder exercise
- Wall slides
- Bird dog
- Dead bug
- Clamshell
- Heel raises

## How to apply in Supabase

Open Supabase SQL Editor and run:

```sql
-- File: supabase/seed-default-exercise-library-expanded.sql
```

After running it, the template-based plan builder will be able to find the new exercises by name and insert them into patient plans.

## Safety rules preserved

- AI does not diagnose.
- AI does not prescribe treatment.
- AI only gives movement-quality feedback.
- Pain 7/10 or higher means stop and contact physiotherapist.
- Red flags are included in program-level safety notes.
- Physiotherapist still controls the plan.

## Why this is better than the first MVP

The first MVP created a patient and attached a few generic default exercises.

This version creates a more realistic clinical workflow:

1. choose a program template
2. create the patient
3. create a duration-based plan
4. insert specific exercises by day
5. include clinical instructions
6. include safety rules
7. mark AI-relevant movement checks
8. keep manual editing possible afterward

## Next step

Phase 10C should improve patient progress view:

- today's exercises
- completed by day
- pain trend
- AI trend
- clearer AI button for AI-enabled exercises only
- stronger pain 7/10 safety warning
