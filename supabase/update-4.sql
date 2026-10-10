-- Images du site modifiables depuis le dashboard (صور الموقع).
-- À exécuter une fois dans Supabase → SQL Editor.
alter table public.site_settings
  add column if not exists hero_image_url text,
  add column if not exists about_image_url text,
  add column if not exists invest_image_url text,
  add column if not exists logo_url text;
