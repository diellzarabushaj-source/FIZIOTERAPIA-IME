# AI Check API input validation

`/api/patient/ai-check` is patient-session protected and saves AI Movement Check results.

## Required checks

- Patient must have a valid patient code cookie.
- Patient code must match an active patient.
- Submitted `planExerciseId` must belong to the current patient through `plans.patient_id`.
- `score` must be numeric and within `0–100`.
- `alertType` must be one of:
  - `good`
  - `needs_attention`
  - `contact_physio`
- `feedback` must be trimmed and limited to 600 characters.
- Invalid JSON must return `400 invalid_json`.

## Safety rule

The API stores only score, feedback and alert metadata. Video/camera frames are not stored in MVP.

AI feedback is movement feedback only and must not be treated as diagnosis or a treatment decision.
