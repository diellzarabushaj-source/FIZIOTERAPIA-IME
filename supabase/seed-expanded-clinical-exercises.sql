-- Expanded default clinical exercise library for Fizioterapia ime.
-- Run this in Supabase SQL editor after the base schema and migrations exist.

WITH exercise_seed(name, category, diagnosis, instructions_sq, ai_enabled, scoring_rules) AS (
  VALUES
    ('Chin tuck', 'Cervical / posture', 'Dhimbje qafe / tension cervikal', 'Terhiq mjekren lehte prapa sikur po krijon mjekerr te dyfishte. Mos e perkul qafen poshte. Levizja duhet te jete e vogel dhe e kontrolluar.', true, '{"focus":"neck_control","visibility_points":[0,11,12],"warning":"marramendje ose mpirje = stop"}'::jsonb),
    ('Scapular setting', 'Shoulder / posture', 'Kontroll skapular / posture', 'Afro shpatullat lehte mbrapa-poshte pa i ngritur drejt vesheve. Mbaje qafen te relaksuar.', true, '{"focus":"scapular_control","visibility_points":[11,12,13,14],"warning":"dhimbje e forte ne shpatull = stop"}'::jsonb),
    ('Thoracic rotation', 'Thoracic mobility', 'Ngurtesi torakale / mobilitet i pergjithshem', 'Rrotullo kraharorin ngadale. Mbaje frymemarrjen te qete dhe mos e shty levizjen ne dhimbje.', false, '{"focus":"mobility","warning":"marramendje ose dhimbje e forte = stop"}'::jsonb),
    ('Quad sets', 'Knee / lower limb', 'Rehabilitim gjuri / aktivizim quadriceps', 'Shtrengo muskujt para te kofshes dhe mbaje 3-5 sekonda. Mos e shty gjurin ne dhimbje.', false, '{"focus":"quad_activation","warning":"enjtje ose dhimbje e forte = stop"}'::jsonb),
    ('Heel slides', 'Knee / mobility', 'Mobilitet gjuri', 'Rreshqite thembren drejt vitheve ngadale dhe vetem deri ku lejon dhimbja. Kthehu me kontroll.', false, '{"focus":"knee_range","warning":"bllokim i gjurit = stop"}'::jsonb),
    ('Straight leg raise', 'Knee / strengthening', 'Forcim bazik i gjurit', 'Mbaje gjurin drejt, aktivizo quadriceps-in dhe ngrije kemben ngadale. Kontrollo kthimin poshte.', true, '{"focus":"leg_alignment","visibility_points":[23,24,25,26,27,28],"warning":"dhimbje e forte ose paqendrueshmeri = stop"}'::jsonb),
    ('Sit to stand', 'Functional strength', 'Kontroll funksional i gjurit', 'Cohu nga karrigia me kontroll. Gjuri duhet te qendroje ne linje me kemben dhe te mos bjere brenda.', true, '{"focus":"functional_alignment","visibility_points":[23,24,25,26,27,28],"warning":"dhimbje 7/10 ose humbje balance = stop"}'::jsonb),
    ('Pendulum shoulder exercise', 'Shoulder / mobility', 'Mobilitet i bute i shpatulles', 'Perkulu lehte perpara dhe lejo krahun te levize si pendulum. Mos e ngrit krahun me force.', false, '{"focus":"shoulder_relaxation","warning":"dhimbje e forte ose dobesi e papritur = stop"}'::jsonb),
    ('Wall slides', 'Shoulder / mobility', 'Mobilitet shpatulle / kontroll skapular', 'Rreshqit krahet ngadale ne mur. Ndalo para dhimbjes se forte dhe mbaje qafen te relaksuar.', true, '{"focus":"shoulder_range","visibility_points":[11,12,13,14,15,16],"warning":"dhimbje nate ose humbje force = stop"}'::jsonb),
    ('Dead bug', 'Core / stabilization', 'Stabilizim core', 'Shtrihu ne shpine, mbaje mesin neutral dhe leviz ngadale krahun e kemben pa humbur kontrollin.', true, '{"focus":"core_control","visibility_points":[11,12,23,24,25,26],"warning":"dhimbje qe perhapet poshte kembes = stop"}'::jsonb),
    ('Bird dog', 'Core / stabilization', 'Stabilizim mesit dhe legenit', 'Nga pozicioni ne kater pika, shtrij krahun dhe kemben kundert ngadale. Mos lejo rotacion te legenit.', true, '{"focus":"trunk_stability","visibility_points":[11,12,23,24,25,26],"warning":"dhimbje 7/10 ose humbje kontrolli = stop"}'::jsonb)
)
INSERT INTO public.exercise_library (
  name,
  category,
  diagnosis,
  instructions_sq,
  ai_enabled,
  scoring_rules,
  is_default,
  owner_physio_id,
  status
)
SELECT
  exercise_seed.name,
  exercise_seed.category,
  exercise_seed.diagnosis,
  exercise_seed.instructions_sq,
  exercise_seed.ai_enabled,
  exercise_seed.scoring_rules,
  true,
  null,
  'published'
FROM exercise_seed
WHERE NOT EXISTS (
  SELECT 1
  FROM public.exercise_library existing
  WHERE lower(existing.name) = lower(exercise_seed.name)
    AND existing.is_default = true
);
