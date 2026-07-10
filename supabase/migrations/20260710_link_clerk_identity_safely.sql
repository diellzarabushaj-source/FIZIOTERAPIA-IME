create or replace function public.link_profile_clerk_identity(
  p_profile_id uuid,
  p_email text,
  p_clerk_user_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_linked boolean;
begin
  update public.profiles
  set clerk_user_id = p_clerk_user_id
  where id = p_profile_id
    and lower(email) = lower(trim(p_email))
    and (clerk_user_id is null or clerk_user_id = p_clerk_user_id)
  returning true into v_linked;

  return coalesce(v_linked, false);
exception when unique_violation then
  return false;
end;
$$;

revoke all on function public.link_profile_clerk_identity(uuid, text, text) from public, anon, authenticated;
grant execute on function public.link_profile_clerk_identity(uuid, text, text) to service_role;
