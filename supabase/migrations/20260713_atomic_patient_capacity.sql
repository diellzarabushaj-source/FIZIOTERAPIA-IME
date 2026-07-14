begin;

create or replace function public.create_or_get_patient_atomic(
  p_physio_id uuid,
  p_first_name text,
  p_last_name text,
  p_date_of_birth date,
  p_phone text,
  p_diagnosis text,
  p_patient_code text,
  p_patient_username text,
  p_enforce_capacity boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.patients%rowtype;
  v_patient public.patients%rowtype;
  v_patient_count bigint;
  v_has_active_subscription boolean;
begin
  if p_physio_id is null then
    raise exception using errcode = '22004', message = 'physio_id_required';
  end if;
  if length(btrim(coalesce(p_first_name, ''))) < 2 then
    raise exception using errcode = '22023', message = 'first_name_invalid';
  end if;
  if length(btrim(coalesce(p_last_name, ''))) < 2 then
    raise exception using errcode = '22023', message = 'last_name_invalid';
  end if;
  if p_date_of_birth is null or p_date_of_birth > current_date then
    raise exception using errcode = '22023', message = 'date_of_birth_invalid';
  end if;

  -- Serialize patient creation for one physiotherapist. This closes the race
  -- where concurrent requests could both observe the fifth free slot.
  perform pg_advisory_xact_lock(hashtextextended(p_physio_id::text, 0));

  select p.*
    into v_existing
    from public.patients p
   where p.physio_id = p_physio_id
     and lower(btrim(p.first_name)) = lower(btrim(p_first_name))
     and lower(btrim(coalesce(p.last_name, ''))) = lower(btrim(p_last_name))
     and p.date_of_birth = p_date_of_birth
   order by p.created_at asc
   limit 1;

  if found then
    return jsonb_build_object(
      'patient', to_jsonb(v_existing),
      'created', false
    );
  end if;

  if p_enforce_capacity then
    select count(*)
      into v_patient_count
      from public.patients p
     where p.physio_id = p_physio_id;

    if v_patient_count >= 5 then
      select exists (
        select 1
          from public.subscriptions s
         where s.physio_id = p_physio_id
           and s.status = 'active'
           and s.current_period_end > now()
      ) into v_has_active_subscription;

      if not v_has_active_subscription then
        raise exception using
          errcode = 'P0001',
          message = 'subscription_required',
          hint = 'An active subscription is required after five patient records.';
      end if;
    end if;
  end if;

  insert into public.patients (
    physio_id,
    first_name,
    last_name,
    date_of_birth,
    phone,
    diagnosis,
    patient_code,
    patient_username,
    status,
    updated_at
  ) values (
    p_physio_id,
    btrim(p_first_name),
    btrim(p_last_name),
    p_date_of_birth,
    nullif(btrim(p_phone), ''),
    nullif(btrim(p_diagnosis), ''),
    p_patient_code,
    nullif(btrim(p_patient_username), ''),
    'active',
    now()
  )
  returning * into v_patient;

  return jsonb_build_object(
    'patient', to_jsonb(v_patient),
    'created', true
  );
end;
$$;

revoke all on function public.create_or_get_patient_atomic(uuid, text, text, date, text, text, text, text, boolean) from public;
revoke all on function public.create_or_get_patient_atomic(uuid, text, text, date, text, text, text, text, boolean) from anon;
revoke all on function public.create_or_get_patient_atomic(uuid, text, text, date, text, text, text, text, boolean) from authenticated;
grant execute on function public.create_or_get_patient_atomic(uuid, text, text, date, text, text, text, text, boolean) to service_role;

comment on function public.create_or_get_patient_atomic(uuid, text, text, date, text, text, text, text, boolean)
is 'Atomically returns an existing patient or creates one while enforcing the five-patient free tier inside the database transaction.';

commit;
