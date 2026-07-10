-- The legacy RPC referenced columns that are no longer part of patient_sessions.
-- Clinical sessions are now written by the authenticated server action using
-- treatment_summary, clinical_notes and next_steps.
drop function if exists public.create_patient_session_safely(
  uuid,
  uuid,
  date,
  integer,
  integer,
  text,
  text,
  text,
  text,
  text
);
