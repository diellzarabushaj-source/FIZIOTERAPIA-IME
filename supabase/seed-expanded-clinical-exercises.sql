-- Expanded default clinical exercise library for Fizioterapia ime.
-- Run this in Supabase SQL editor after the base schema exists.
-- It inserts missing default exercises used by lib/clinical-programs.ts.

WITH exercise_seed(name, category, diagnosis, instructions_sq, ai_enabled, scoring_rules) AS (
  VALUES
    (
      'Chin tuck',
      'Cervical / posture',
      'Dhimbje qafe / tension cervikal',
      'Tërhiq mjekrën lehtë prapa sikur po krijon mjekër të dyfishtë. Mos e përkul qafën poshtë. Lëvizja duhet të jetë e vogël dhe e kontrolluar.',
      true,
      '{"focus":"neck_control","visibility_points":[0,11,12],"warning":"marramendje ose mpirje = stop"}'::jsonb
    ),
    (
      'Scapular setting',
      'Shoulder / posture',
      'Kontroll skapular / posturë',
      'Afro shpatullat lehtë mbrapa-poshtë pa i ngritur drejt veshëve. Mbaje qafën të relaksuar.',
      true,
      '{"focus":"scapular_control","visibility_points":[11,12,13,14],"warning":"dhimbje e fortë në shpatull = stop"}'::jsonb
    ),
    (
      'Thoracic rotation',
      'Thoracic mobility',
      'Ngurtësi torakale / mobilitet i përgjithshëm',
      'Rrotullo kraharorin ngadalë. Mbaje frymëmarrjen të qetë dhe mos e shty lëvizjen në dhimbje.',
      false,
      '{"focus":"mobility","warning":"marramendje ose dhimbje e fortë = stop"}'::jsonb
    ),
    (
      'Quad sets',
      'Knee / lower limb',
      'Rehabilitim gjuri / aktivizim quadriceps',
      'Shtrëngo muskujt para të kofshës dhe mbaje 3–5 sekonda. Mos e shty gjurin në dhimbje.',
      false,
      '{"focus":"quad_activation","warning":"ënjtje ose dhimbje e fortë = stop"}'::jsonb
    ),
    (
      'Heel slides',
      'Knee / mobility',
      'Mobilitet gjuri',
      'Rrëshqite thembrën drejt vitheve ngadalë dhe vetëm deri ku lejon dhimbja. Kthehu me kontroll.',
      false,
      '{"focus":"knee_range","warning":"bllokim i gjurit = stop"}'::jsonb
    ),
    (
      'Straight leg raise',
      'Knee / strengthening',
      'Forcim bazik i gjurit',
      'Mbaje gjurin drejt, aktivizo quadriceps-in dhe ngrije këmbën ngadalë. Kontrollo kthimin poshtë.',
      true,
      '{"focus":"leg_alignment","visibility_points":[23,24,25,26,27,28],"warning":"dhimbje e fortë ose paqëndrueshmëri = stop"}'::jsonb
    ),
    (
      'Sit to stand',
      'Functional strength',
      'Kontroll funksional i gjurit',
      'Çohu nga karrigia me kontroll. Gjuri duhet të qëndrojë në linjë me këmbën dhe të mos bjerë brenda.',
      true,
      '{"focus":"functional_alignment","visibility_points":[23,24,25,26,27,28],"warning":"dhimbje 7/10 ose humbje balance = stop"}'::jsonb
    ),
    (
      'Pendulum shoulder exercise',
      'Shoulder / mobility',
      'Mobilitet i butë i shpatullës',
      'Përkulu lehtë përpara dhe lejo krahun të lëvizë si pendulum. Mos e ngrit krahun me forcë.',
      false,
      '{"focus":"shoulder_relaxation","warning":"dhimbje e fortë ose dobësi e papritur = stop"}'::jsonb
    ),
    (
      'Wall slides',
      'Shoulder / mobility',
      'Mobilitet shpatulle / kontroll skapular',
      'Rrëshqit krahët ngadalë në mur. Ndalo para dhimbjes së fortë dhe mbaje qafën të relaksuar.',
      true,
      '{"focus":"shoulder_range","visibility_points":[11,12,13,14,15,16],"warning":"dhimbje nate ose humbje force = stop"}'::jsonb
    ),
    (
      'Dead bug',
      'Core / stabilization',
      'Stabilizim core',
      'Shtrihu në shpinë, mbaje mesin neutral dhe lëviz ngadalë krahun e këmbën pa humbur kontrollin.',
      true,
      '{"focus":"core_control","visibility_points":[11,12,23,24,25,26],"warning":"dhimbje që përhapet poshtë këmbës = stop"}'::jsonb
    ),
    (
      'Bird dog',
      'Core / stabilization',
      'Stabilizim mesit dhe legenit',
      'Nga pozicioni në katër pika, shtrij krahun dhe këmbën kundërt ngadalë. Mos lejo rotacion të legenit.',
      true,
      '{"focus":"trunk_stability","visibility_points":[11,12,23,24,25,26],"warning":"dhimbje 7/10 ose humbje kontrolli = stop"}'::jsonb
    )
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
