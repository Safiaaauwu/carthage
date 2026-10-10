-- Mise à jour pour une base DÉJÀ créée avec la 1re version de schema.sql.
-- À exécuter une fois dans Supabase → SQL Editor.
alter table public.properties
  add column if not exists listing_type text not null default 'sale' check (listing_type in ('sale','rent')),
  add column if not exists description text,
  add column if not exists features text[] not null default '{}',
  add column if not exists location_info text,
  add column if not exists gallery text[] not null default '{}';

alter table public.submissions
  add column if not exists property_id uuid references public.properties(id) on delete set null,
  add column if not exists property_title text,
  add column if not exists intent text check (intent in ('visit','advisor'));

alter table public.site_settings alter column company_name set default 'قرطاج';
update public.site_settings set company_name = 'قرطاج' where id = 1 and company_name = 'أجيلة';
