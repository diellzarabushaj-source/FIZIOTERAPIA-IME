-- Demo patient seed for App Store / Play Store review and QA.
-- Run this in Supabase SQL editor only when you want a reviewer/demo patient in production.
-- It is idempotent for patient_username = 'demo-patient-4821'.

DO $$
DECLARE
  v_physio_id uuid;
  v_patient_id uuid;
  v_plan_id uuid;
  v_exercise_id uuid;
  v_plan_exercise_id uuid;
BEGIN
  SELECT id INTO v_physio_id
  FROM public.profiles
  WHERE email = 'diellzarabushaj@gmail.com'
  LIMIT 1;

  IF v_physio_id IS NULL THEN
    RAISE EXCEPTION 'Owner profile diellzarabushaj@gmail.com not found. Sign in once as owner before running this seed.';
  END IF;

  INSERT INTO public.patients (
    physio_id,
    first_name,
    last_name,
    phone,
    age,
    diagnosis,
    patient_username,
    patient_code,
    status,
    notes
  )
  VALUES (
    v_physio_id,
    'Demo',
    'Patient',
    '+383 44 000 000',
    34,
    'Lumbosciatica demo rehabilitation',
    'demo-patient-4821',
    'ARB-4821',
    'active',
    'Demo patient for App Store / Play Store review. No real patient data.'
  )
  ON CONFLICT (patient_username) DO UPDATE SET
    physio_id = EXCLUDED.physio_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    age = EXCLUDED.age,
    diagnosis = EXCLUDED.diagnosis,
    patient_code = EXCLUDED.patient_code,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes
  RETURNING id INTO v_patient_id;

  IF v_patient_id IS NULL THEN
    SELECT id INTO v_patient_id
    FROM public.patients
    WHERE patient_username = 'demo-patient-4821'
    LIMIT 1;
  END IF;

  INSERT INTO public.plans (
    patient_id,
    physio_id,
    title,
    start_date,
    end_date,
    status
  )
  VALUES (
    v_patient_id,
    v_physio_id,
    'Demo program rehabilitimi 14 ditë',
    current_date,
    current_date + 13,
    'active'
  )
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_plan_id
  FROM public.plans
  WHERE patient_id = v_patient_id
  ORDER BY created_at DESC
  LIMIT 1;

  FOR v_exercise_id IN
    SELECT id
    FROM public.exercise_library
    WHERE is_default = true
      AND status = 'published'
      AND name IN ('Glute bridge', 'Cat cow', 'Pelvic tilt', 'Piriformis stretch')
    ORDER BY CASE name
      WHEN 'Glute bridge' THEN 1
      WHEN 'Cat cow' THEN 2
      WHEN 'Pelvic tilt' THEN 3
      WHEN 'Piriformis stretch' THEN 4
      ELSE 5
    END
  LOOP
    INSERT INTO public.plan_exercises (
      plan_id,
      exercise_id,
      sets,
      reps,
      frequency,
      day_number,
      instructions
    )
    VALUES (
      v_plan_id,
      v_exercise_id,
      2,
      10,
      'Çdo ditë',
      1,
      'Demo: kryeje ushtrimin ngadalë, me kontroll dhe ndalo nëse dhimbja rritet.'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  SELECT pe.id INTO v_plan_exercise_id
  FROM public.plan_exercises pe
  JOIN public.exercise_library el ON el.id = pe.exercise_id
  WHERE pe.plan_id = v_plan_id
    AND el.ai_enabled = true
  ORDER BY pe.created_at ASC
  LIMIT 1;

  IF v_plan_exercise_id IS NOT NULL THEN
    INSERT INTO public.exercise_logs (
      patient_id,
      plan_exercise_id,
      completed,
      pain_score,
      comment,
      completed_at
    )
    VALUES
      (v_patient_id, v_plan_exercise_id, true, 3, 'Demo log: ushtrimi u krye pa dhimbje të fortë.', now() - interval '2 days'),
      (v_patient_id, v_plan_exercise_id, true, 4, 'Demo log: pak tension, por brenda kufijve.', now() - interval '1 day')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.ai_checks (
      patient_id,
      plan_exercise_id,
      score,
      feedback,
      alert_type,
      created_at
    )
    VALUES
      (v_patient_id, v_plan_exercise_id, 82, 'Demo AI check: lëvizje e kontrolluar, vazhdo me ritëm të ngadalshëm.', 'good', now() - interval '1 day')
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Demo patient ready. Username: demo-patient-4821 | Code: ARB-4821';
END $$;
