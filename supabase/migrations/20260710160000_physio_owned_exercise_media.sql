-- Physiotherapist-owned exercise library and patient access hardening.
-- Safe to run more than once.

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS patient_username text,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_username_unique_idx
ON public.patients (patient_username)
WHERE patient_username IS NOT NULL AND patient_username <> '';

ALTER TABLE public.exercise_library
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_physio_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.exercise_library
SET is_default = true,
    status = COALESCE(status, 'published')
WHERE owner_physio_id IS NULL
  AND is_default = false;

CREATE INDEX IF NOT EXISTS exercise_library_owner_status_idx
ON public.exercise_library (owner_physio_id, status);

CREATE INDEX IF NOT EXISTS exercise_library_default_status_idx
ON public.exercise_library (is_default, status);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_reference text,
  ADD COLUMN IF NOT EXISTS notes text;

COMMENT ON COLUMN public.exercise_library.owner_physio_id IS 'Null for default/admin exercises. Set to the physiotherapist profile id for private exercises.';
COMMENT ON COLUMN public.exercise_library.video_url IS 'Optional media URL. The app treats this as video, image, or external media link.';
