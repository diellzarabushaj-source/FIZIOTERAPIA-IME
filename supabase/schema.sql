-- FizioPlan MVP Supabase schema draft
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
  patient_code text unique not null,
  status text default 'active',
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
  created_at timestamptz default now()
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
  schedule_days integer[] not null default array[1],
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
  physio_id uuid references profiles(id) on delete cascade,
  plan_name text,
  price numeric,
  status text default 'trial',
  trial_ends_at timestamptz,
  created_at timestamptz default now()
);
