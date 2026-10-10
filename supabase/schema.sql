-- ============ Adjila — schéma Supabase ============
create extension if not exists "pgcrypto";

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'عقارات مميزة',
  location text not null,
  image_url text,
  price bigint not null default 0,
  area integer not null default 0,
  rooms integer not null default 0,
  bathrooms integer not null default 0,
  instagram_url text,
  listing_type text not null default 'sale' check (listing_type in ('sale','rent')),
  description text,
  features text[] not null default '{}',
  location_info text,
  gallery text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  request_type text not null,
  message text not null,
  property_id uuid references public.properties(id) on delete set null,
  property_title text,
  intent text check (intent in ('visit','advisor')),
  status text not null default 'جديد' check (status in ('جديد','تم التواصل','مغلق')),
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists submissions_created_idx on public.submissions (created_at desc);
create index if not exists submissions_phone_idx on public.submissions (phone, created_at desc);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'قرطاج',
  phone text not null default '+213 34 00 00 00',
  email text not null default 'contact@adjila.dz',
  whatsapp text not null default '+213 34 00 00 00',
  instagram_handle text not null default '@adjila',
  instagram_url text not null default 'https://www.instagram.com/adjila/',
  address text not null default 'باتنة، الجزائر',
  cta_consult_link text not null default '#contact',
  cta_properties_link text not null default '#properties',
  hero_image_url text,
  about_image_url text,
  invest_image_url text,
  logo_url text
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- ============ RLS ============
alter table public.admins enable row level security;
alter table public.properties enable row level security;
alter table public.submissions enable row level security;
alter table public.site_settings enable row level security;

-- properties : le public lit le publié, l'admin fait tout
create policy "public read published" on public.properties for select using (published = true);
create policy "admin all properties" on public.properties for all using (public.is_admin()) with check (public.is_admin());

-- settings : lecture publique, écriture admin
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin update settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

-- submissions : aucune politique publique. Les insertions passent par l'Edge Function (service role).
create policy "admin all submissions" on public.submissions for all using (public.is_admin()) with check (public.is_admin());

-- admins : chacun peut voir sa propre ligne (nécessaire au login)
create policy "self read admin" on public.admins for select using (user_id = auth.uid());

-- ============ Storage ============
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true) on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id = 'property-images');
create policy "admin write images" on storage.objects for insert with check (bucket_id = 'property-images' and public.is_admin());
create policy "admin update images" on storage.objects for update using (bucket_id = 'property-images' and public.is_admin());
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'property-images' and public.is_admin());

-- ============ Après création de votre compte admin (Auth > Users) ============
-- insert into public.admins (user_id) select id from auth.users where email = 'VOTRE_EMAIL';
