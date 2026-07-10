create unique index if not exists payment_requests_one_open_per_physio_idx
on public.payment_requests (physio_id)
where status in ('pending', 'proof_uploaded');

create or replace function public.approve_manual_payment_request(
  p_request_id uuid,
  p_reviewer_id uuid default null
)
returns table(subscription_id uuid, access_until timestamptz)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_request public.payment_requests%rowtype;
  v_now timestamptz := now();
  v_start timestamptz;
  v_end timestamptz;
  v_subscription_id uuid;
begin
  select *
  into v_request
  from public.payment_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Payment request not found';
  end if;

  if v_request.status <> 'proof_uploaded' then
    raise exception 'Payment request is not awaiting approval';
  end if;

  select greatest(v_now, coalesce(max(current_period_end), v_now))
  into v_start
  from public.subscriptions
  where physio_id = v_request.physio_id
    and status = 'active'
    and current_period_end is not null;

  v_end := v_start + make_interval(months => greatest(1, least(12, v_request.duration_months)));

  insert into public.subscriptions (
    physio_id,
    plan_name,
    price,
    currency,
    status,
    current_period_start,
    current_period_end,
    paid_at,
    payment_method,
    invoice_reference,
    notes
  ) values (
    v_request.physio_id,
    'Fizioterapeut Monthly',
    v_request.amount,
    v_request.currency,
    'active',
    v_start,
    v_end,
    v_now,
    'manual_bank',
    v_request.reference_code,
    'Approved from payment request ' || v_request.id::text
  )
  returning id into v_subscription_id;

  update public.payment_requests
  set status = 'approved',
      reviewed_at = v_now,
      reviewed_by = p_reviewer_id,
      rejection_reason = null,
      updated_at = v_now
  where id = v_request.id;

  return query select v_subscription_id, v_end;
end;
$$;

revoke all on function public.approve_manual_payment_request(uuid, uuid) from public, anon, authenticated;
grant execute on function public.approve_manual_payment_request(uuid, uuid) to service_role;
