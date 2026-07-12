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
  9.90,
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

insert into exercise_library (
  id,
  name,
  category,
  diagnosis,
  video_url,
  instructions_sq,
  ai_enabled,
  scoring_rules,
  is_default,
  owner_physio_id,
  status
)
values
  (
    '44444444-4444-4444-8444-444444444441'::uuid,
    'Pelvic tilt',
    'Lumbar mobility',
    'Dhimbje lumbale',
    null,
    'Shtrihu me gjunjët e përkulur. Aktivizo lehtë barkun dhe rrafsho mesin pa e mbajtur frymën.',
    false,
    '{}'::jsonb,
    true,
    null,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444442'::uuid,
    'Glute bridge',
    'Strengthening',
    'Dhimbje lumbale',
    null,
    'Ngrije legenin ngadalë duke aktivizuar gluteus. Mos e harko tepër mesin.',
    true,
    '{}'::jsonb,
    true,
    null,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444443'::uuid,
    'Bird dog',
    'Core stability',
    'Dhimbje lumbale',
    null,
    'Nga pozita në katër pika, zgjat krahun dhe këmbën e kundërt duke mbajtur legenin stabil.',
    true,
    '{}'::jsonb,
    true,
    null,
    'published'
  ),
  (
    '44444444-4444-4444-8444-444444444444'::uuid,
    'Cat cow',
    'Spinal mobility',
    'Dhimbje lumbale',
    null,
    'Lëviz shtyllën ngadalë ndërmjet fleksionit dhe ekstenzionit, pa e shtyrë në dhimbje.',
    false,
    '{}'::jsonb,
    true,
    null,
    'published'
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  diagnosis = excluded.diagnosis,
  instructions_sq = excluded.instructions_sq,
  ai_enabled = excluded.ai_enabled,
  status = excluded.status;

delete from plan_exercises
where plan_id = '33333333-3333-4333-8333-333333333333'::uuid;

insert into plan_exercises (
  id,
  plan_id,
  exercise_id,
  sets,
  reps,
  frequency,
  day_number,
  instructions
)
values
  (
    '55555555-5555-4555-8555-555555555551'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444441'::uuid,
    2,
    12,
    'Çdo ditë',
    1,
    'Kryeje ngadalë. Ndalo nëse dhimbja rritet.'
  ),
  (
    '55555555-5555-4555-8555-555555555552'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444442'::uuid,
    3,
    10,
    '5 herë në javë',
    1,
    'Mbaje legenin stabil dhe mos e harko tepër mesin.'
  ),
  (
    '55555555-5555-4555-8555-555555555553'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444443'::uuid,
    2,
    8,
    '4 herë në javë',
    2,
    'Mbaje trungun stabil dhe lëviz me kontroll.'
  ),
  (
    '55555555-5555-4555-8555-555555555554'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444444'::uuid,
    2,
    10,
    'Çdo ditë',
    1,
    'Lëviz ngadalë dhe brenda tolerancës.'
  );

commit;

select
  pr.email as physio_email,
  pr.full_name as physio_name,
  s.status as subscription_status,
  s.current_period_end,
  p.patient_username,
  p.patient_code,
  pl.title as active_plan,
  count(pe.id) as exercise_count
from profiles pr
join subscriptions s on s.physio_id = pr.id
join patients p on p.physio_id = pr.id
left join plans pl on pl.patient_id = p.id and pl.status = 'active'
left join plan_exercises pe on pe.plan_id = pl.id
where pr.email = 'xhavitrabushaj63@gmail.com'
group by pr.email, pr.full_name, s.status, s.current_period_end, p.patient_username, p.patient_code, pl.title
order by s.current_period_end desc
limit 1;
