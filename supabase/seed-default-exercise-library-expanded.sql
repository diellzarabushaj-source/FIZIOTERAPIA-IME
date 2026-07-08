-- Expanded default exercise library for Phase 10B.2.
-- Run in Supabase SQL Editor as owner/admin.
-- Safe to run multiple times: it updates existing exercise names and inserts missing ones.

WITH exercises(name, category, diagnosis, instructions_sq, ai_enabled) AS (
  VALUES
    ('Chin tuck', 'Cervical / posture', 'Dhimbje qafe / tension cervikal', 'Tërhiq mjekrën lehtë prapa sikur po krijon mjekër të dyfishtë. Mos e përkul qafën poshtë. Ndalo nëse shfaqet marramendje ose mpirje.', true),
    ('Scapular setting', 'Shoulder / posture', 'Kontroll skapular / dhimbje qafe-shpatulle', 'Afro shpatullat lehtë mbrapa-poshtë, pa i ngritur drejt veshëve. Mbaje 2–3 sekonda dhe lësho ngadalë.', true),
    ('Thoracic rotation', 'Thoracic mobility', 'Mobilitet kraharori / qafë / shpatull', 'Rrotullo kraharorin ngadalë me frymëmarrje të qetë. Qafa qëndron neutrale dhe lëvizja nuk duhet të shkaktojë marramendje.', false),
    ('Quad sets', 'Knee / activation', 'Rehabilitim gjuri / aktivizim quadriceps', 'Shtrëngo muskujt para të kofshës dhe mbaje 3–5 sekonda. Mos e shty gjurin në dhimbje të fortë.', false),
    ('Heel slides', 'Knee / mobility', 'Rehabilitim gjuri / ROM', 'Rrëshqite thembrën drejt vitheve ngadalë, vetëm deri ku lejon dhimbja. Kthehu me kontroll.', false),
    ('Straight leg raise', 'Knee / strength', 'Rehabilitim gjuri / forcim bazik', 'Mbaje gjurin drejt, ngrije këmbën ngadalë dhe mos e humb kontrollin gjatë kthimit poshtë.', true),
    ('Sit to stand', 'Knee / function', 'Kontroll funksional i gjurit', 'Çohu nga karrigia me kontroll. Gjuri nuk duhet të bjerë brenda dhe pesha duhet të shpërndahet në të dy këmbët.', true),
    ('Pendulum shoulder exercise', 'Shoulder / mobility', 'Dhimbje shpatulle / mobilitet i butë', 'Lejo krahun të lëvizë lehtë si pendulum. Mos e ngrit me forcë dhe mos provoko dhimbje të fortë.', false),
    ('Wall slides', 'Shoulder / mobility', 'Mobilitet shpatulle / kontroll skapular', 'Rrëshqit krahët ngadalë në mur. Mbaje qafën të relaksuar dhe ndalo para dhimbjes së fortë.', true),
    ('Bird dog', 'Core / stabilization', 'Stabilizim core / dhimbje mesi', 'Mbaje trungun stabil. Lëvize krahun dhe këmbën ngadalë pa rotacion të legenit.', true),
    ('Dead bug', 'Core / stabilization', 'Stabilizim core / kontroll i trungut', 'Mbaje mesin neutral. Lëviz ngadalë krahun dhe këmbën pa e humbur kontrollin e trungut.', true),
    ('Clamshell', 'Hip / glute activation', 'Stabilizim legeni / aktivizim gluteus medius', 'Hape gjurin lart pa rrotulluar legenin. Lëviz ngadalë dhe mbaje kontrollin.', true),
    ('Heel raises', 'Ankle / calf strength', 'Forcim i lehtë i këmbës / ekuilibër', 'Ngrihu në maje të gishtave me kontroll dhe kthehu ngadalë. Mbaju në mur nëse duhet stabilitet.', true)
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
    ('Chin tuck', 'Cervical / posture', 'Dhimbje qafe / tension cervikal', 'Tërhiq mjekrën lehtë prapa sikur po krijon mjekër të dyfishtë. Mos e përkul qafën poshtë. Ndalo nëse shfaqet marramendje ose mpirje.', true),
    ('Scapular setting', 'Shoulder / posture', 'Kontroll skapular / dhimbje qafe-shpatulle', 'Afro shpatullat lehtë mbrapa-poshtë, pa i ngritur drejt veshëve. Mbaje 2–3 sekonda dhe lësho ngadalë.', true),
    ('Thoracic rotation', 'Thoracic mobility', 'Mobilitet kraharori / qafë / shpatull', 'Rrotullo kraharorin ngadalë me frymëmarrje të qetë. Qafa qëndron neutrale dhe lëvizja nuk duhet të shkaktojë marramendje.', false),
    ('Quad sets', 'Knee / activation', 'Rehabilitim gjuri / aktivizim quadriceps', 'Shtrëngo muskujt para të kofshës dhe mbaje 3–5 sekonda. Mos e shty gjurin në dhimbje të fortë.', false),
    ('Heel slides', 'Knee / mobility', 'Rehabilitim gjuri / ROM', 'Rrëshqite thembrën drejt vitheve ngadalë, vetëm deri ku lejon dhimbja. Kthehu me kontroll.', false),
    ('Straight leg raise', 'Knee / strength', 'Rehabilitim gjuri / forcim bazik', 'Mbaje gjurin drejt, ngrije këmbën ngadalë dhe mos e humb kontrollin gjatë kthimit poshtë.', true),
    ('Sit to stand', 'Knee / function', 'Kontroll funksional i gjurit', 'Çohu nga karrigia me kontroll. Gjuri nuk duhet të bjerë brenda dhe pesha duhet të shpërndahet në të dy këmbët.', true),
    ('Pendulum shoulder exercise', 'Shoulder / mobility', 'Dhimbje shpatulle / mobilitet i butë', 'Lejo krahun të lëvizë lehtë si pendulum. Mos e ngrit me forcë dhe mos provoko dhimbje të fortë.', false),
    ('Wall slides', 'Shoulder / mobility', 'Mobilitet shpatulle / kontroll skapular', 'Rrëshqit krahët ngadalë në mur. Mbaje qafën të relaksuar dhe ndalo para dhimbjes së fortë.', true),
    ('Bird dog', 'Core / stabilization', 'Stabilizim core / dhimbje mesi', 'Mbaje trungun stabil. Lëvize krahun dhe këmbën ngadalë pa rotacion të legenit.', true),
    ('Dead bug', 'Core / stabilization', 'Stabilizim core / kontroll i trungut', 'Mbaje mesin neutral. Lëviz ngadalë krahun dhe këmbën pa e humbur kontrollin e trungut.', true),
    ('Clamshell', 'Hip / glute activation', 'Stabilizim legeni / aktivizim gluteus medius', 'Hape gjurin lart pa rrotulluar legenin. Lëviz ngadalë dhe mbaje kontrollin.', true),
    ('Heel raises', 'Ankle / calf strength', 'Forcim i lehtë i këmbës / ekuilibër', 'Ngrihu në maje të gishtave me kontroll dhe kthehu ngadalë. Mbaju në mur nëse duhet stabilitet.', true)
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
