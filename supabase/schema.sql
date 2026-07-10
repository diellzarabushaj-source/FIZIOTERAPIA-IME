-- FizioPlan MVP Supabase schema draft.
-- Run carefully in Supabase SQL editor after review.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  email text unique not null,
  role text not null check (role in ('owner', 'admin', 'physio')),
  full_name text,
  clinic_name text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid references profiles(id) on delete cascade,
  first_name text not null,
  last_name text,
  phone text,
  age int,
  diagnosis text,
  patient_username text unique,
  patient_code text unique not null,
  status text default 'active',
  notes text,
  created_at timestamptz default now()
);

create table if not exists exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  diagnosis text,
  video_url text,
  instructions_sq text,
  ai_enabled boolean default false,
  scoring_rules jsonb default '{}'::jsonb,
  is_default boolean not null default false,
  owner_physio_id uuid references profiles(id) on delete set null,
  status text not null default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  physio_id uuid references profiles(id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  exercise_id uuid references exercise_library(id),
  sets int,
  reps int,
  frequency text,
  day_number int,
  instructions text
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  plan_exercise_id uuid references plan_exercises(id) on delete cascade,
  completed boolean default false,
  pain_score int check (pain_score between 0 and 10),
  comment text,
  completed_at timestamptz default now()
);

create table if not exists ai_checks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  plan_exercise_id uuid references plan_exercises(id) on delete cascade,
  score int check (score between 0 and 100),
  feedback text,
  alert_type text,
  created_at timestamptz default now()
);

create table if not exists physio_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  physio_id uuid references profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid references profiles(id),
  plan_name text,
  price numeric,
  currency text default 'EUR',
  status text default 'trial',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  invoice_reference text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists patients_physio_status_idx on patients (physio_id, status);
create index if not exists exercise_library_owner_status_idx on exercise_library (owner_physio_id, status);
create index if not exists exercise_library_default_status_idx on exercise_library (is_default, status);
create index if not exists plans_patient_status_idx on plans (patient_id, status);
