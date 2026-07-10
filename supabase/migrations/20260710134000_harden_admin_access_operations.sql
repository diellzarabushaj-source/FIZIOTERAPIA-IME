create or replace function public.admin_activate_physio_access(p_physio_id uuid,p_months integer,p_price numeric,p_invoice_reference text,p_reviewer_id uuid default null)
returns setof public.subscriptions
language plpgsql
security definer
set search_path=public
as $$
declare
  v_profile public.profiles%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_now timestamptz:=now();
begin
  if p_months is null or p_months < 1 or p_months > 24 then raise exception using errcode='22023',message='invalid months'; end if;
  if p_price is null or p_price < 0 then raise exception using errcode='22023',message='invalid price'; end if;
  select * into v_profile from public.profiles where id=p_physio_id for update;
  if not found or v_profile.role <> 'physio' then raise exception using errcode='P0002',message='physio not found'; end if;
  if coalesce(v_profile.status,'pending') in ('blocked','deleted','suspended') then raise exception using errcode='42501',message='profile status prevents activation'; end if;
  select greatest(v_now,coalesce(max(current_period_end),v_now)) into v_start from public.subscriptions where physio_id=p_physio_id and status='active';
  v_end:=v_start + make_interval(months=>p_months);
  update public.subscriptions set status='expired' where physio_id=p_physio_id and status='active' and current_period_end is not null and current_period_end<=v_now;
  update public.profiles set status='active' where id=p_physio_id and coalesce(status,'pending') in ('pending','inactive','active');
  return query insert into public.subscriptions(physio_id,plan_name,price,currency,status,current_period_start,current_period_end,paid_at,payment_method,invoice_reference,notes)
  values(p_physio_id,'Fizioterapeut Monthly',p_price,'EUR','active',v_start,v_end,v_now,'manual_bank',nullif(trim(p_invoice_reference),''),'Manual access activated by admin '||coalesce(p_reviewer_id::text,'system')) returning *;
end;$$;

create or replace function public.admin_suspend_subscription(p_subscription_id uuid,p_reason text,p_reviewer_id uuid default null)
returns setof public.subscriptions
language plpgsql security definer set search_path=public as $$
begin
  return query update public.subscriptions set status='suspended',notes=left(coalesce(nullif(trim(p_reason),''),'Suspended by admin.')||' Reviewer: '||coalesce(p_reviewer_id::text,'system'),1000)
  where id=p_subscription_id and status in ('active','trialing') returning *;
  if not found then raise exception using errcode='P0002',message='active subscription not found'; end if;
end;$$;

create or replace function public.admin_reject_payment_request(p_request_id uuid,p_reason text,p_reviewer_id uuid default null)
returns setof public.payment_requests
language plpgsql security definer set search_path=public as $$
begin
  if length(trim(coalesce(p_reason,''))) < 3 then raise exception using errcode='22023',message='reason required'; end if;
  return query update public.payment_requests set status='rejected',reviewed_at=now(),reviewed_by=p_reviewer_id,rejection_reason=left(trim(p_reason),500),updated_at=now()
  where id=p_request_id and status in ('proof_uploaded','pending') returning *;
  if not found then raise exception using errcode='P0002',message='reviewable payment request not found'; end if;
end;$$;

revoke all on function public.admin_activate_physio_access(uuid,integer,numeric,text,uuid) from public,anon,authenticated;
revoke all on function public.admin_suspend_subscription(uuid,text,uuid) from public,anon,authenticated;
revoke all on function public.admin_reject_payment_request(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.admin_activate_physio_access(uuid,integer,numeric,text,uuid) to service_role;
grant execute on function public.admin_suspend_subscription(uuid,text,uuid) to service_role;
grant execute on function public.admin_reject_payment_request(uuid,text,uuid) to service_role;
