\set ON_ERROR_STOP on

DO $$
DECLARE
  table_name text;
  required_tables text[] := ARRAY[
    'patients',
    'plans',
    'plan_exercises',
    'ai_checks',
    'patient_auth_sessions',
    'appointments',
    'notifications'
  ];
  rls_enabled boolean;
  policy_count integer;
BEGIN
  FOREACH table_name IN ARRAY required_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'Required table public.% does not exist', table_name;
    END IF;

    SELECT c.relrowsecurity
      INTO rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = table_name;

    IF NOT COALESCE(rls_enabled, false) THEN
      RAISE EXCEPTION 'RLS is disabled on public.%', table_name;
    END IF;

    SELECT count(*)
      INTO policy_count
      FROM pg_policies
     WHERE schemaname = 'public' AND tablename = table_name;

    IF policy_count = 0 THEN
      RAISE EXCEPTION 'No RLS policies exist on public.%', table_name;
    END IF;
  END LOOP;
END $$;

SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
