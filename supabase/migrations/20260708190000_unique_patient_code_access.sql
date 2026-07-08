-- Phase 10E safety migration: patient access is code-only.
-- One patient_code must belong to exactly one patient.

DO $$
BEGIN
  IF EXISTS (
    SELECT patient_code
    FROM public.patients
    WHERE patient_code IS NOT NULL AND patient_code <> ''
    GROUP BY patient_code
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate patient_code values exist. Fix duplicates before adding unique index.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_code_unique_idx
ON public.patients (patient_code)
WHERE patient_code IS NOT NULL AND patient_code <> '';

CREATE INDEX IF NOT EXISTS patients_patient_code_status_idx
ON public.patients (patient_code, status);

COMMENT ON INDEX patients_patient_code_unique_idx IS 'Ensures one patient access code belongs to one patient only.';
