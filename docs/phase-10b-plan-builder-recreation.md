# Phase 10B — Plan Builder Recreation

Status: Started and implemented first working version.

## Goal

Recreate the plan builder so a physiotherapist can create a patient and select a safe clinical program template instead of manually building everything from zero.

## Files changed

- `lib/clinical-programs.ts`
- `app/physiotherapist-portal/actions.ts`
- `app/physiotherapist-portal/page.tsx`
- `app/phase3.css`

## What was added

### 1. Clinical program template system

Created:

```text
lib/clinical-programs.ts
```

The file defines reusable clinical program templates for:

- Lumbosciatica / low back pain
- Neck pain / cervical pain
- Knee rehabilitation
- Shoulder mobility
- Core stability
- General mobility

Each template contains:

- key
- title
- category
- diagnosis label
- duration in days
- short description
- safety note
- exercises
- sets/reps/frequency
- day number
- instructions
- AI recommendation flag

### 2. Patient creation now uses templates

Updated:

```text
app/physiotherapist-portal/actions.ts
```

`createPatientAction()` now reads:

```text
programKey
```

Then it:

1. Finds the clinical program template.
2. Creates the patient.
3. Creates the plan title/duration from the template.
4. Searches matching exercises in `exercise_library`.
5. Inserts matching template exercises into `plan_exercises`.
6. Adds the template safety note to each instruction.
7. Falls back to default exercises if template exercises are missing.

### 3. Dashboard UI now has template selection

Updated:

```text
app/physiotherapist-portal/page.tsx
```

The new patient form now includes:

- Program template selector
- optional diagnosis field
- optional plan title field
- safety rule box

Also added a visible program template overview card section.

### 4. Styling

Updated:

```text
app/phase3.css
```

Added:

- `.program-template-grid`
- `.program-template-card`
- responsive program template cards

## Safety rules preserved

- Patient login remains username + code.
- Physio/admin login remains Clerk.
- Supabase service role is still server-side only.
- Billing gate is still enforced before creating patients/plans.
- Patient ownership check remains for manual plan changes.
- Exercise access check remains for manual plan changes.
- AI remains movement-quality feedback only.
- Pain 7/10 or higher still means stop/contact physiotherapist.

## Current limitation

Templates currently reuse the existing default exercises available in the database:

- Glute bridge
- Cat cow
- Pelvic tilt
- Piriformis stretch

Next step is to expand the default exercise library with more specific exercises for neck, knee, shoulder and core programs.

## Next steps

### Phase 10B.2 — Exercise library expansion

Add default exercises for:

- Neck retraction / chin tuck
- Scapular setting
- Wall slides
- Heel slides
- Quad sets
- Straight leg raise
- Bird dog
- Dead bug
- Thoracic rotation

### Phase 10C — Patient progress recreation

Improve the patient dashboard so it displays:

- today's exercises
- completed by day
- pain trend
- AI trend
- clearer AI check button only for AI-enabled exercises
