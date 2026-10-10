-- Carthage est à Batna : remplace "بجاية" par "باتنة" dans les données déjà enregistrées.
-- À exécuter une fois dans Supabase → SQL Editor (après update-2.sql).
update public.site_settings set address = replace(address, 'بجاية', 'باتنة') where id = 1;
update public.properties set location = replace(location, 'بجاية', 'باتنة');
update public.properties set title = replace(title, 'بجاية', 'باتنة') where title like '%بجاية%';
