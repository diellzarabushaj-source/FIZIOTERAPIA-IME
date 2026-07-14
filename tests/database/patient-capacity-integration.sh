#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"
PSQL=(psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1)

fail() {
  echo "::error::$1" >&2
  exit 1
}

query_scalar() {
  "${PSQL[@]}" -Atqc "$1" | tr -d '[:space:]'
}

run_patient_create() {
  local physio_id="$1"
  local first_name="$2"
  local last_name="$3"
  local birth_date="$4"
  local patient_code="$5"
  local username="$6"

  "${PSQL[@]}" -Atqc "
    set role service_role;
    select public.create_or_get_patient_atomic(
      '${physio_id}'::uuid,
      '${first_name}',
      '${last_name}',
      '${birth_date}'::date,
      null,
      null,
      '${patient_code}',
      '${username}',
      true
    );
  "
}

"${PSQL[@]}" -f "$ROOT_DIR/tests/database/fixtures/patient-capacity-base.sql"
"${PSQL[@]}" -f "$ROOT_DIR/supabase/migrations/20260713_atomic_patient_capacity.sql"

FUNCTION_SIGNATURE="public.create_or_get_patient_atomic(uuid,text,text,date,text,text,text,text,boolean)"

[[ "$(query_scalar "select has_function_privilege('anon', '${FUNCTION_SIGNATURE}', 'EXECUTE');")" == "f" ]] \
  || fail "anon must not execute patient creation RPC"
[[ "$(query_scalar "select has_function_privilege('authenticated', '${FUNCTION_SIGNATURE}', 'EXECUTE');")" == "f" ]] \
  || fail "authenticated clients must not execute patient creation RPC"
[[ "$(query_scalar "select has_function_privilege('service_role', '${FUNCTION_SIGNATURE}', 'EXECUTE');")" == "t" ]] \
  || fail "service_role must execute patient creation RPC"

set +e
"${PSQL[@]}" -Atqc "
  set role authenticated;
  select public.create_or_get_patient_atomic(
    '99999999-9999-4999-8999-999999999999'::uuid,
    'Cross', 'Tenant', '1990-01-01'::date,
    null, null, 'DENIED-CODE', 'denied-user', true
  );
" > /tmp/cross-tenant-denied.log 2>&1
denied_status=$?
set -e
[[ $denied_status -ne 0 ]] || fail "authenticated role unexpectedly executed the service-only patient RPC"
grep -qi "permission denied" /tmp/cross-tenant-denied.log \
  || fail "authenticated denial did not fail with a permission error"

FREE_PHYSIO="11111111-1111-4111-8111-111111111111"
"${PSQL[@]}" -qc "
  insert into public.patients (
    physio_id, first_name, last_name, date_of_birth, patient_code, patient_username
  )
  select
    '${FREE_PHYSIO}'::uuid,
    'Seed' || value,
    'Free',
    date '1990-01-01' + value,
    'FREE-SEED-' || value,
    'free-seed-' || value
  from generate_series(1, 4) as value;
"

set +e
run_patient_create "$FREE_PHYSIO" "RaceA" "Free" "1991-01-01" "FREE-RACE-A" "free-race-a" \
  > /tmp/free-race-a.log 2>&1 &
pid_a=$!
run_patient_create "$FREE_PHYSIO" "RaceB" "Free" "1991-01-02" "FREE-RACE-B" "free-race-b" \
  > /tmp/free-race-b.log 2>&1 &
pid_b=$!
wait "$pid_a"; status_a=$?
wait "$pid_b"; status_b=$?
set -e

successes=0
[[ $status_a -eq 0 ]] && successes=$((successes + 1))
[[ $status_b -eq 0 ]] && successes=$((successes + 1))
[[ $successes -eq 1 ]] || {
  cat /tmp/free-race-a.log >&2 || true
  cat /tmp/free-race-b.log >&2 || true
  fail "exactly one concurrent request must receive the fifth free slot"
}

cat /tmp/free-race-a.log /tmp/free-race-b.log | grep -q "subscription_required" \
  || fail "the rejected concurrent request must require a subscription"
[[ "$(query_scalar "select count(*) from public.patients where physio_id = '${FREE_PHYSIO}'::uuid;")" == "5" ]] \
  || fail "free-tier concurrency exceeded the five-patient limit"

PAID_PHYSIO="22222222-2222-4222-8222-222222222222"
"${PSQL[@]}" -qc "
  insert into public.patients (
    physio_id, first_name, last_name, date_of_birth, patient_code, patient_username
  )
  select
    '${PAID_PHYSIO}'::uuid,
    'Paid' || value,
    'Seed',
    date '1985-01-01' + value,
    'PAID-SEED-' || value,
    'paid-seed-' || value
  from generate_series(1, 5) as value;

  insert into public.subscriptions (physio_id, status, current_period_end)
  values ('${PAID_PHYSIO}'::uuid, 'active', now() + interval '30 days');
"

run_patient_create "$PAID_PHYSIO" "RaceA" "Paid" "1992-01-01" "PAID-RACE-A" "paid-race-a" \
  > /tmp/paid-race-a.log 2>&1 &
paid_pid_a=$!
run_patient_create "$PAID_PHYSIO" "RaceB" "Paid" "1992-01-02" "PAID-RACE-B" "paid-race-b" \
  > /tmp/paid-race-b.log 2>&1 &
paid_pid_b=$!
wait "$paid_pid_a"
wait "$paid_pid_b"

[[ "$(query_scalar "select count(*) from public.patients where physio_id = '${PAID_PHYSIO}'::uuid;")" == "7" ]] \
  || fail "active subscription did not permit concurrent patient creation"

DUPLICATE_PHYSIO="33333333-3333-4333-8333-333333333333"
run_patient_create "$DUPLICATE_PHYSIO" "Same" "Patient" "1993-03-03" "DUPLICATE-A" "duplicate-a" \
  > /tmp/duplicate-a.log 2>&1 &
duplicate_pid_a=$!
run_patient_create "$DUPLICATE_PHYSIO" "Same" "Patient" "1993-03-03" "DUPLICATE-B" "duplicate-b" \
  > /tmp/duplicate-b.log 2>&1 &
duplicate_pid_b=$!
wait "$duplicate_pid_a"
wait "$duplicate_pid_b"

[[ "$(query_scalar "select count(*) from public.patients where physio_id = '${DUPLICATE_PHYSIO}'::uuid;")" == "1" ]] \
  || fail "concurrent duplicate requests created more than one patient"
cat /tmp/duplicate-a.log /tmp/duplicate-b.log | grep -q '"created": true' \
  || fail "duplicate race did not record the initial creation"
cat /tmp/duplicate-a.log /tmp/duplicate-b.log | grep -q '"created": false' \
  || fail "duplicate race did not reuse the existing patient"

echo "PostgreSQL patient-capacity integration checks passed."
