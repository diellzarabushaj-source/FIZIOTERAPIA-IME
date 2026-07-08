# Database Schema – Supabase

Ky dokument pershkruan tabelat kryesore per FizioPlan.

## profiles
User-at e Clerk/Supabase per staff.

- id
- clerk_user_id
- email
- role: owner | admin | physio
- full_name
- clinic_name
- status
- created_at

## patients
Pacientet qe krijohen nga fizioterapeuti.

- id
- physio_id
- first_name
- last_name
- phone
- age
- diagnosis
- patient_code
- status
- created_at

## exercise_library
Biblioteka e ushtrimeve.

- id
- name
- category
- diagnosis
- video_url
- instructions_sq
- ai_enabled
- scoring_rules
- created_at

## plans
Planet e ushtrimeve.

- id
- patient_id
- physio_id
- title
- start_date
- end_date
- status
- created_at

## plan_exercises
Ushtrimet e caktuara brenda nje plani.

- id
- plan_id
- exercise_id
- sets
- reps
- frequency
- day_number
- instructions

## exercise_logs
Cfare ka kryer pacienti.

- id
- patient_id
- plan_exercise_id
- completed
- pain_score
- comment
- completed_at

## ai_checks
Rezultatet e AI movement analysis.

- id
- patient_id
- plan_exercise_id
- score
- feedback
- alert_type
- created_at

## physio_messages
Mesazhe korrigjimi nga fizioterapeuti.

- id
- patient_id
- physio_id
- message
- created_at

## subscriptions
Plan pagesash per fizioterapeutet.

- id
- physio_id
- plan_name
- price
- status
- trial_ends_at
- created_at

## RLS rules summary

- patient_code login sheh vetem pacientin perkates.
- physio sheh vetem pacientet ku patients.physio_id = profile.id.
- owner sheh te gjitha te dhenat.
- askush nuk lexon owner dashboard pa role owner.