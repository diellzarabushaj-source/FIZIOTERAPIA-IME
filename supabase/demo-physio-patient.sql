-- Demo data for Fizioterapia Ime
-- Run this file in the Supabase SQL Editor after the production schema/migrations.
-- Safe to run repeatedly: deterministic UUIDs + upserts are used.
--
-- Physio test login (create/sign in with this email in Clerk):
--   xhavitrabushaj63@gmail.com
-- Patient test access:
--   username: arta.demo
--   code: DEMO-2026

begin;

insert into profiles (
  id,
  clerk_user_id,
  email,
  role,
  full_name,
  clinic_name,
  status
)
values (
  '11111111-1111-4111-8111-111111111111'::uuid,
  null,
  'xhavitrabushaj63@gmail.com',
  'physio',
  'Xhavit Rabushaj',
  'Fizioterapia Ime · Demo Clinic',
  'active'
)
on conflict (email) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  clinic_name = excluded.clinic_name,
  status = excluded.status;

-- Remove older demo subscription rows, so the newest row is always active.
delete from subscriptions
where physio_id = (
  select id from profiles where email = 'xhavitrabushaj63@gmail.com'
)
and invoice_reference = 'DEMO-SUBSCRIPTION-2026';

insert into subscriptions (
  physio_id,
  plan_name,
  price,
  currency,
  status,
  current_period_start,
  current_period_end,
  paid_at,
  payment_method,
  invoice_reference,
  notes
)
select
  id,
  'Fizioterapeut Monthly · Demo',
  29.90,
  'EUR',
  'active',
  now(),
  now() + interval '12 months',
  now(),
  'demo',
  'DEMO-SUBSCRIPTION-2026',
  'Demo subscription for testing. Not a real payment.'
from profiles
where email = 'xhavitrabushaj63@gmail.com';

insert into patients (
  id,
  physio_id,
  first_name,
  last_name,
  phone,
  age,
  diagnosis,
  patient_code,
  patient_username,
  status
)
select
  '22222222-2222-4222-8222-222222222222'::uuid,
  id,
  'Arta',
  'Demo',
  '+383 44 000 000',
  34,
  'Dhimbje jo-specifike lumbale · rast demonstrues',
  'DEMO-2026',
  'arta.demo',
  'active'
from profiles
where email = 'xhavitrabushaj63@gmail.com'
on conflict (patient_code) do update set
  physio_id = excluded.physio_id,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  phone = excluded.phone,
  age = excluded.age,
  diagnosis = excluded.diagnosis,
  patient_username = excluded.patient_username,
  status = excluded.status;

insert into plans (
  id,
  patient_id,
  physio_id,
  title,
  start_date,
  end_date,
  status
)
select
  '33333333-3333-4333-8333-333333333333'::uuid,
  p.id,
  p.physio_id,
  'Program demo · Stabilizim lumbar 14 ditë',
  current_date,
  current_date + 13,
  'active'
from patients p
where p.patient_code = 'DEMO-2026'
on conflict (id) do update set
  patient_id = excluded.patient_id,
  physio_id = excluded.physio_id,
  title = excluded.title,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  status = excluded.status;

commit;

-- Verification
select
  pr.email as physio_email,
  pr.full_name as physio_name,
  s.status as subscription_status,
  s.current_period_end,
  p.patient_username,
  p.patient_code,
  pl.title as active_plan
from profiles pr
join subscriptions s on s.physio_id = pr.id
join patients p on p.physio_id = pr.id
left join plans pl on pl.patient_id = p.id and pl.status = 'active'
where pr.email = 'xhavitrabushaj63@gmail.com'
order by s.created_at desc
limit 1;
