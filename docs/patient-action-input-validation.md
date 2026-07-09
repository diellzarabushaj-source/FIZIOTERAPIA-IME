# Patient action input validation

Patient dashboard server actions must accept only bounded clinical input.

## Pain score

Pain score is optional, but when present it must be numeric and within:

- minimum: `0`
- maximum: `10`

Invalid, non-numeric, negative, or above-range values must be rejected.

## AI score

AI Movement Check score must be numeric and within:

- minimum: `0`
- maximum: `100`

Invalid values must be rejected before insertion into `ai_checks`.

## Text fields

Patient comments and AI feedback must be trimmed and length-limited before insertion.

Current limits:

- patient comment: 500 characters
- AI feedback: 600 characters

## Ownership boundary

The existing server action ownership check remains required:

- read current patient from secure patient code cookie;
- verify the submitted `planExerciseId` belongs to that patient through `plans.patient_id`;
- reject the action if the exercise is not assigned to the current patient.
