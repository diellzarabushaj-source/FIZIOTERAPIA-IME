create table if not exists public.clinic_branding (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null unique,
  clinic_name text,
  clinician_name text,
  professional_title text,
  logo_url text,
  phone text,
  email text,
  address text,
  website text,
  report_footer text,
  show_exercise_images boolean not null default true,
  show_qr_code boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clinic_branding_physio_id_idx on public.clinic_branding(physio_id);

alter table public.clinic_branding enable row level security;

comment on table public.clinic_branding is 'Per-physiotherapist clinic identity and printable report preferences.';
comment on column public.clinic_branding.logo_url is 'Public HTTPS image URL. Upload is handled by the application media flow.';

create or replace function public.touch_clinic_branding_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clinic_branding_touch_updated_at on public.clinic_branding;
create trigger clinic_branding_touch_updated_at
before update on public.clinic_branding
for each row execute function public.touch_clinic_branding_updated_at();
