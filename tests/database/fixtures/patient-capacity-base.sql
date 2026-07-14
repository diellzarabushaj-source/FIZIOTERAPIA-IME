\set ON_ERROR_STOP on

create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null,
  first_name text not null,
  last_name text,
  date_of_birth date,
  phone text,
  diagnosis text,
  patient_code text not null unique,
  patient_username text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patients_physio_id_idx on public.patients (physio_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_physio_id_idx on public.subscriptions (physio_id);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.patients to service_role;
grant select, insert, update, delete on public.subscriptions to service_role;
