-- Phase 13/14: Pilot feedback table + admin triage fields
-- Execute this in Supabase SQL Editor before using /pilot-feedback and /admin-feedback.

create table if not exists public.pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  respondent_name text not null,
  respondent_email text,
  clinic_name text,
  role text not null default 'physiotherapist',
  patient_creation_score int check (patient_creation_score between 1 and 5),
  exercise_assignment_score int check (exercise_assignment_score between 1 and 5),
  patient_login_score int check (patient_login_score between 1 and 5),
  ai_clarity_score int check (ai_clarity_score between 1 and 5),
  report_usefulness_score int check (report_usefulness_score between 1 and 5),
  payment_readiness_score int check (payment_readiness_score between 1 and 5),
  biggest_problem text,
  missing_feature text,
  safety_concern text,
  would_use_with_real_patient text,
  notes text,
  source text not null default 'pilot-feedback-page',
  triage_status text not null default 'new',
  priority text not null default 'P2 medium',
  triage_notes text,
  triaged_at timestamptz
);

alter table public.pilot_feedback
  add column if not exists triage_status text not null default 'new',
  add column if not exists priority text not null default 'P2 medium',
  add column if not exists triage_notes text,
  add column if not exists triaged_at timestamptz;

alter table public.pilot_feedback enable row level security;

-- Keep feedback private by default. The app inserts and admin reviews through the server with SUPABASE_SERVICE_ROLE_KEY.

drop policy if exists "pilot_feedback_private_no_public_select" on public.pilot_feedback;
create policy "pilot_feedback_private_no_public_select"
  on public.pilot_feedback
  for select
  using (false);

create index if not exists pilot_feedback_created_at_idx
  on public.pilot_feedback (created_at desc);

create index if not exists pilot_feedback_role_idx
  on public.pilot_feedback (role);

create index if not exists pilot_feedback_triage_status_idx
  on public.pilot_feedback (triage_status);

create index if not exists pilot_feedback_priority_idx
  on public.pilot_feedback (priority);
