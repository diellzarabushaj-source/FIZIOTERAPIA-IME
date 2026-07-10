alter table public.profiles
  add column if not exists phone text,
  add column if not exists whatsapp text;

comment on column public.profiles.phone is
  'Public clinic phone shown only to assigned patients.';

comment on column public.profiles.whatsapp is
  'WhatsApp number shown only to assigned patients.';
