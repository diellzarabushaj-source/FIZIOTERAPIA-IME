create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references public.profiles(id),
  patient_id uuid not null references public.patients(id),
  plan_id uuid references public.plans(id),
  diagnosis text,
  phase text not null,
  goal text not null,
  input_snapshot jsonb not null default '{}'::jsonb,
  candidate_exercise_ids uuid[] not null default '{}',
  suggestions jsonb not null default '[]'::jsonb,
  engine text not null default 'clinical-rules-v1',
  model text,
  status text not null default 'generated',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_suggestions_status_check check (status in ('generated','accepted','partially_accepted','rejected','expired')),
  constraint ai_suggestions_phase_check check (phase in ('acute','subacute','chronic','post_op','return_to_activity')),
  constraint ai_suggestions_goal_check check (goal in ('pain_relief','mobility','stretching','strengthening','stability','balance','walking','functional'))
);

create index if not exists ai_suggestions_physio_created_idx on public.ai_suggestions(physio_id, created_at desc);
create index if not exists ai_suggestions_patient_created_idx on public.ai_suggestions(patient_id, created_at desc);
create index if not exists ai_suggestions_plan_idx on public.ai_suggestions(plan_id) where plan_id is not null;

alter table public.ai_suggestions enable row level security;
revoke all privileges on public.ai_suggestions from anon, authenticated;
grant select, insert, update on public.ai_suggestions to service_role;

create or replace function public.touch_ai_suggestions_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_ai_suggestions_updated_at on public.ai_suggestions;
create trigger trg_touch_ai_suggestions_updated_at
before update on public.ai_suggestions
for each row execute function public.touch_ai_suggestions_updated_at();