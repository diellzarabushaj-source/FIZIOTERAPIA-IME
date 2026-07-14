#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"
PSQL=(psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1)

fail() {
  echo "::error::$1" >&2
  exit 1
}

query_scalar() {
  "${PSQL[@]}" -Atc "$1" | tr -d '[:space:]'
}

run_as_service() {
  "${PSQL[@]}" -Atc "set role service_role; $1"
}

"${PSQL[@]}" -f "$ROOT_DIR/tests/database/fixtures/admin-billing-base.sql"
"${PSQL[@]}" -f "$ROOT_DIR/supabase/migrations/20260710134000_harden_admin_access_operations.sql"
"${PSQL[@]}" -f "$ROOT_DIR/supabase/migrations/20260710_harden_manual_payment_approval.sql"

OWNER_ID="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
PHYSIO_ID="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
BLOCKED_ID="cccccccc-cccc-4ccc-8ccc-cccccccccccc"
ADMIN_ID="dddddddd-dddd-4ddd-8ddd-dddddddddddd"
SUSPEND_PHYSIO_ID="eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"
APPROVE_PHYSIO_ID="ffffffff-ffff-4fff-8fff-ffffffffffff"

"${PSQL[@]}" -c "
  insert into public.profiles (id,email,role,status,full_name) values
    ('${OWNER_ID}'::uuid,'owner-test@example.test','owner','active','Owner Test'),
    ('${PHYSIO_ID}'::uuid,'physio-test@example.test','physio','pending','Physio Test'),
    ('${BLOCKED_ID}'::uuid,'blocked-test@example.test','physio','blocked','Blocked Physio'),
    ('${ADMIN_ID}'::uuid,'admin-test@example.test','admin','active','Admin Test'),
    ('${SUSPEND_PHYSIO_ID}'::uuid,'suspend-test@example.test','physio','active','Suspend Physio'),
    ('${APPROVE_PHYSIO_ID}'::uuid,'approve-test@example.test','physio','active','Approve Physio');
"

functions=(
  "public.admin_activate_physio_access(uuid,integer,numeric,text,uuid)"
  "public.admin_suspend_subscription(uuid,text,uuid)"
  "public.admin_reject_payment_request(uuid,text,uuid)"
  "public.approve_manual_payment_request(uuid,uuid)"
)

for signature in "${functions[@]}"; do
  [[ "$(query_scalar "select has_function_privilege('anon', '${signature}', 'EXECUTE');")" == "f" ]] \
    || fail "anon unexpectedly has EXECUTE on ${signature}"
  [[ "$(query_scalar "select has_function_privilege('authenticated', '${signature}', 'EXECUTE');")" == "f" ]] \
    || fail "authenticated unexpectedly has EXECUTE on ${signature}"
  [[ "$(query_scalar "select has_function_privilege('service_role', '${signature}', 'EXECUTE');")" == "t" ]] \
    || fail "service_role is missing EXECUTE on ${signature}"
done

set +e
"${PSQL[@]}" -Atc "
  set role authenticated;
  select id from public.admin_activate_physio_access(
    '${PHYSIO_ID}'::uuid, 1, 9.90, 'DENIED', '${OWNER_ID}'::uuid
  );
" > /tmp/admin-authenticated-denied.log 2>&1
authenticated_status=$?
set -e
[[ $authenticated_status -ne 0 ]] || fail "authenticated role unexpectedly executed an admin billing RPC"
grep -qi "permission denied" /tmp/admin-authenticated-denied.log \
  || fail "authenticated admin RPC denial did not produce a permission error"

activation_id="$(run_as_service "
  select id from public.admin_activate_physio_access(
    '${PHYSIO_ID}'::uuid, 1, 9.90, 'ACTIVATE-001', '${OWNER_ID}'::uuid
  );
" | tr -d '[:space:]')"
[[ -n "$activation_id" ]] || fail "activation did not return a subscription"
[[ "$(query_scalar "select status from public.profiles where id='${PHYSIO_ID}'::uuid;")" == "active" ]] \
  || fail "activation did not move the pending physiotherapist to active"
[[ "$(query_scalar "select status from public.subscriptions where id='${activation_id}'::uuid;")" == "active" ]] \
  || fail "activation did not create an active subscription"
[[ "$(query_scalar "select invoice_reference from public.subscriptions where id='${activation_id}'::uuid;")" == "ACTIVATE-001" ]] \
  || fail "activation did not preserve the invoice reference"

set +e
run_as_service "
  select id from public.admin_activate_physio_access(
    '${BLOCKED_ID}'::uuid, 1, 9.90, 'BLOCKED', '${OWNER_ID}'::uuid
  );
" > /tmp/blocked-activation.log 2>&1
blocked_status=$?
run_as_service "
  select id from public.admin_activate_physio_access(
    '${ADMIN_ID}'::uuid, 1, 9.90, 'ADMIN-AS-PHYSIO', '${OWNER_ID}'::uuid
  );
" > /tmp/non-physio-activation.log 2>&1
non_physio_status=$?
set -e
[[ $blocked_status -ne 0 ]] || fail "blocked physiotherapist was activated"
grep -q "profile status prevents activation" /tmp/blocked-activation.log \
  || fail "blocked activation returned the wrong error"
[[ $non_physio_status -ne 0 ]] || fail "administrative profile was activated as a physiotherapist"
grep -q "physio not found" /tmp/non-physio-activation.log \
  || fail "non-physio activation returned the wrong error"

suspend_subscription_id="$(run_as_service "
  select id from public.admin_activate_physio_access(
    '${SUSPEND_PHYSIO_ID}'::uuid, 1, 9.90, 'SUSPEND-001', '${OWNER_ID}'::uuid
  );
" | tr -d '[:space:]')"
run_as_service "
  select id from public.admin_suspend_subscription(
    '${suspend_subscription_id}'::uuid, 'Compliance review', '${OWNER_ID}'::uuid
  );
" > /tmp/suspend-first.log
[[ "$(query_scalar "select status from public.subscriptions where id='${suspend_subscription_id}'::uuid;")" == "suspended" ]] \
  || fail "subscription suspension did not persist"
[[ "$(query_scalar "select notes like '%Compliance review%' from public.subscriptions where id='${suspend_subscription_id}'::uuid;")" == "t" ]] \
  || fail "subscription suspension did not preserve the reason"

set +e
run_as_service "
  select id from public.admin_suspend_subscription(
    '${suspend_subscription_id}'::uuid, 'Second attempt', '${OWNER_ID}'::uuid
  );
" > /tmp/suspend-second.log 2>&1
second_suspend_status=$?
set -e
[[ $second_suspend_status -ne 0 ]] || fail "the same subscription was suspended twice"
grep -q "active subscription not found" /tmp/suspend-second.log \
  || fail "repeat suspension returned the wrong error"

REJECT_REQUEST_ID="12121212-1212-4212-8212-121212121212"
"${PSQL[@]}" -c "
  insert into public.payment_requests (
    id,physio_id,reference_code,amount,currency,duration_months,status
  ) values (
    '${REJECT_REQUEST_ID}'::uuid,'${PHYSIO_ID}'::uuid,'REJECT-001',9.90,'EUR',1,'proof_uploaded'
  );
"
run_as_service "
  select id from public.admin_reject_payment_request(
    '${REJECT_REQUEST_ID}'::uuid, 'Dokumenti nuk përputhet', '${OWNER_ID}'::uuid
  );
" > /tmp/reject-first.log
[[ "$(query_scalar "select status from public.payment_requests where id='${REJECT_REQUEST_ID}'::uuid;")" == "rejected" ]] \
  || fail "payment rejection did not persist"
[[ "$(query_scalar "select reviewed_by from public.payment_requests where id='${REJECT_REQUEST_ID}'::uuid;")" == "${OWNER_ID}" ]] \
  || fail "payment rejection did not record the reviewer"
[[ "$(query_scalar "select rejection_reason from public.payment_requests where id='${REJECT_REQUEST_ID}'::uuid;")" == "Dokumentinukpërputhet" ]] \
  || fail "payment rejection did not preserve the reason"

set +e
run_as_service "
  select id from public.admin_reject_payment_request(
    '${REJECT_REQUEST_ID}'::uuid, 'Second rejection', '${OWNER_ID}'::uuid
  );
" > /tmp/reject-second.log 2>&1
second_reject_status=$?
set -e
[[ $second_reject_status -ne 0 ]] || fail "the same payment request was rejected twice"
grep -q "reviewable payment request not found" /tmp/reject-second.log \
  || fail "repeat payment rejection returned the wrong error"

APPROVE_REQUEST_ID="34343434-3434-4434-8434-343434343434"
EXISTING_SUBSCRIPTION_ID="56565656-5656-4565-8565-565656565656"
"${PSQL[@]}" -c "
  insert into public.subscriptions (
    id,physio_id,plan_name,price,currency,status,current_period_start,current_period_end
  ) values (
    '${EXISTING_SUBSCRIPTION_ID}'::uuid,
    '${APPROVE_PHYSIO_ID}'::uuid,
    'Existing',9.90,'EUR','active',now(),now()+interval '10 days'
  );

  insert into public.payment_requests (
    id,physio_id,reference_code,amount,currency,duration_months,status,submitted_at
  ) values (
    '${APPROVE_REQUEST_ID}'::uuid,
    '${APPROVE_PHYSIO_ID}'::uuid,
    'APPROVE-001',19.80,'EUR',2,'proof_uploaded',now()
  );
"

set +e
run_as_service "
  select subscription_id from public.approve_manual_payment_request(
    '${APPROVE_REQUEST_ID}'::uuid, '${OWNER_ID}'::uuid
  );
" > /tmp/approve-race-a.log 2>&1 &
approve_pid_a=$!
run_as_service "
  select subscription_id from public.approve_manual_payment_request(
    '${APPROVE_REQUEST_ID}'::uuid, '${OWNER_ID}'::uuid
  );
" > /tmp/approve-race-b.log 2>&1 &
approve_pid_b=$!
wait "$approve_pid_a"; approve_status_a=$?
wait "$approve_pid_b"; approve_status_b=$?
set -e

approve_successes=0
[[ $approve_status_a -eq 0 ]] && approve_successes=$((approve_successes + 1))
[[ $approve_status_b -eq 0 ]] && approve_successes=$((approve_successes + 1))
[[ $approve_successes -eq 1 ]] || {
  cat /tmp/approve-race-a.log >&2 || true
  cat /tmp/approve-race-b.log >&2 || true
  fail "exactly one concurrent payment approval must succeed"
}
cat /tmp/approve-race-a.log /tmp/approve-race-b.log | grep -q "not awaiting approval" \
  || fail "the duplicate payment approval did not fail closed"
[[ "$(query_scalar "select status from public.payment_requests where id='${APPROVE_REQUEST_ID}'::uuid;")" == "approved" ]] \
  || fail "approved payment request did not persist"
[[ "$(query_scalar "select count(*) from public.subscriptions where invoice_reference='APPROVE-001';")" == "1" ]] \
  || fail "concurrent approval created duplicate subscriptions"
[[ "$(query_scalar "select current_period_start >= (select current_period_end from public.subscriptions where id='${EXISTING_SUBSCRIPTION_ID}'::uuid) from public.subscriptions where invoice_reference='APPROVE-001';")" == "t" ]] \
  || fail "manual approval did not extend access after the existing subscription"

echo "PostgreSQL admin billing integration checks passed."
