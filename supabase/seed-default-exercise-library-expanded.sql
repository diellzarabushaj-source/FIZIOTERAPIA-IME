-- Expanded default exercise library.
-- Run in Supabase SQL Editor after migrations.
-- Safe to run multiple times: it updates existing exercise names and inserts missing ones.

WITH exercises(name, category, diagnosis, instructions_sq, ai_enabled) AS (
  VALUES
    ('Chin tuck', 'Cervical / posture', 'Dhimbje qafe / tension cervikal', 'Terhiq mjekren lehte prapa sikur po krijon mjekerr te dyfishte. Mos e perkul qafen poshte. Ndalo nese shfaqet marramendje ose mpirje.', true),
    ('Scapular setting', 'Shoulder / posture', 'Kontroll skapular / dhimbje qafe-shpatulle', 'Afro shpatullat lehte mbrapa-poshte, pa i ngritur drejt vesheve. Mbaje 2-3 sekonda dhe lesho ngadale.', true),
    ('Thoracic rotation', 'Thoracic mobility', 'Mobilitet kraharori / qafe / shpatull', 'Rrotullo kraharorin ngadale me frymemarrje te qete. Qafa qendron neutrale dhe levizja nuk duhet te shkaktoje marramendje.', false),
    ('Quad sets', 'Knee / activation', 'Rehabilitim gjuri / aktivizim quadriceps', 'Shtrengo muskujt para te kofshes dhe mbaje 3-5 sekonda. Mos e shty gjurin ne dhimbje te forte.', false),
    ('Heel slides', 'Knee / mobility', 'Rehabilitim gjuri / ROM', 'Rreshqite thembren drejt vitheve ngadale, vetem deri ku lejon dhimbja. Kthehu me kontroll.', false),
    ('Straight leg raise', 'Knee / strength', 'Rehabilitim gjuri / forcim bazik', 'Mbaje gjurin drejt, ngrije kemben ngadale dhe mos e humb kontrollin gjate kthimit poshte.', true),
    ('Sit to stand', 'Knee / function', 'Kontroll funksional i gjurit', 'Cohu nga karrigia me kontroll. Gjuri nuk duhet te bjere brenda dhe pesha duhet te shperndahet ne te dy kembet.', true),
    ('Pendulum shoulder exercise', 'Shoulder / mobility', 'Dhimbje shpatulle / mobilitet i bute', 'Lejo krahun te levize lehte si pendulum. Mos e ngrit me force dhe mos provoko dhimbje te forte.', false),
    ('Wall slides', 'Shoulder / mobility', 'Mobilitet shpatulle / kontroll skapular', 'Rreshqit krahet ngadale ne mur. Mbaje qafen te relaksuar dhe ndalo para dhimbjes se forte.', true),
    ('Bird dog', 'Core / stabilization', 'Stabilizim core / dhimbje mesi', 'Mbaje trungun stabil. Levize krahun dhe kemben ngadale pa rotacion te legenit.', true),
    ('Dead bug', 'Core / stabilization', 'Stabilizim core / kontroll i trungut', 'Mbaje mesin neutral. Leviz ngadale krahun dhe kemben pa e humbur kontrollin e trungut.', true),
    ('Clamshell', 'Hip / glute activation', 'Stabilizim legeni / aktivizim gluteus medius', 'Hape gjurin lart pa rrotulluar legenin. Leviz ngadale dhe mbaje kontrollin.', true),
    ('Heel raises', 'Ankle / calf strength', 'Forcim i lehte i kembes / ekuiliber', 'Ngrihu ne maje te gishtave me kontroll dhe kthehu ngadale. Mbaju ne mur nese duhet stabilitet.', true)
)
UPDATE public.exercise_library existing
SET
  category = exercises.category,
  diagnosis = exercises.diagnosis,
  instructions_sq = exercises.instructions_sq,
  ai_enabled = exercises.ai_enabled,
  is_default = true,
  owner_physio_id = null,
  status = 'published',
  scoring_rules = COALESCE(existing.scoring_rules, '{}'::jsonb)
FROM exercises
WHERE lower(existing.name) = lower(exercises.name);

WITH exercises(name, category, diagnosis, instructions_sq, ai_enabled) AS (
  VALUES
    ('Chin tuck', 'Cervical / posture', 'Dhimbje qafe / tension cervikal', 'Terhiq mjekren lehte prapa sikur po krijon mjekerr te dyfishte. Mos e perkul qafen poshte. Ndalo nese shfaqet marramendje ose mpirje.', true),
    ('Scapular setting', 'Shoulder / posture', 'Kontroll skapular / dhimbje qafe-shpatulle', 'Afro shpatullat lehte mbrapa-poshte, pa i ngritur drejt vesheve. Mbaje 2-3 sekonda dhe lesho ngadale.', true),
    ('Thoracic rotation', 'Thoracic mobility', 'Mobilitet kraharori / qafe / shpatull', 'Rrotullo kraharorin ngadale me frymemarrje te qete. Qafa qendron neutrale dhe levizja nuk duhet te shkaktoje marramendje.', false),
    ('Quad sets', 'Knee / activation', 'Rehabilitim gjuri / aktivizim quadriceps', 'Shtrengo muskujt para te kofshes dhe mbaje 3-5 sekonda. Mos e shty gjurin ne dhimbje te forte.', false),
    ('Heel slides', 'Knee / mobility', 'Rehabilitim gjuri / ROM', 'Rreshqite thembren drejt vitheve ngadale, vetem deri ku lejon dhimbja. Kthehu me kontroll.', false),
    ('Straight leg raise', 'Knee / strength', 'Rehabilitim gjuri / forcim bazik', 'Mbaje gjurin drejt, ngrije kemben ngadale dhe mos e humb kontrollin gjate kthimit poshte.', true),
    ('Sit to stand', 'Knee / function', 'Kontroll funksional i gjurit', 'Cohu nga karrigia me kontroll. Gjuri nuk duhet te bjere brenda dhe pesha duhet te shperndahet ne te dy kembet.', true),
    ('Pendulum shoulder exercise', 'Shoulder / mobility', 'Dhimbje shpatulle / mobilitet i bute', 'Lejo krahun te levize lehte si pendulum. Mos e ngrit me force dhe mos provoko dhimbje te forte.', false),
    ('Wall slides', 'Shoulder / mobility', 'Mobilitet shpatulle / kontroll skapular', 'Rreshqit krahet ngadale ne mur. Mbaje qafen te relaksuar dhe ndalo para dhimbjes se forte.', true),
    ('Bird dog', 'Core / stabilization', 'Stabilizim core / dhimbje mesi', 'Mbaje trungun stabil. Levize krahun dhe kemben ngadale pa rotacion te legenit.', true),
    ('Dead bug', 'Core / stabilization', 'Stabilizim core / kontroll i trungut', 'Mbaje mesin neutral. Leviz ngadale krahun dhe kemben pa e humbur kontrollin e trungut.', true),
    ('Clamshell', 'Hip / glute activation', 'Stabilizim legeni / aktivizim gluteus medius', 'Hape gjurin lart pa rrotulluar legenin. Leviz ngadale dhe mbaje kontrollin.', true),
    ('Heel raises', 'Ankle / calf strength', 'Forcim i lehte i kembes / ekuiliber', 'Ngrihu ne maje te gishtave me kontroll dhe kthehu ngadale. Mbaju ne mur nese duhet stabilitet.', true)
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
  exercises.name,
  exercises.category,
  exercises.diagnosis,
  exercises.instructions_sq,
  exercises.ai_enabled,
  '{}'::jsonb,
  true,
  null,
  'published'
FROM exercises
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercise_library existing WHERE lower(existing.name) = lower(exercises.name)
);
