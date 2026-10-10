# قرطاج — Site immobilier + dashboard admin

Vite + React + TypeScript · Supabase (Auth, Postgres, Storage, Edge Function) · Resend (e-mail).

## Installation
1. `npm install`
2. Copier `.env.example` vers `.env` et renseigner `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. Supabase → SQL Editor : exécuter `supabase/schema.sql` (tables, RLS, bucket `property-images`).
4. Supabase → Auth → Users : créer le compte admin, puis exécuter la dernière requête commentée de `schema.sql`
   (`insert into public.admins ...`) avec son e-mail.
5. Edge Function (e-mail + enregistrement + anti-spam) :
   ```
   supabase functions deploy contact --no-verify-jwt
   supabase secrets set RESEND_API_KEY=re_xxx CONTACT_FROM_EMAIL="قرطاج <no-reply@votre-domaine.dz>"
   ```
   Le destinataire est l'e-mail défini dans Dashboard → Paramètres (défaut `contact@adjila.dz`).
   Avec Resend, l'expéditeur doit être un domaine vérifié (l'expéditeur de test `onboarding@resend.dev` n'envoie qu'à votre propre adresse).
6. Police : déposer les fichiers `ThmanyahSans-*.woff2` dans `public/fonts/` (voir le README de ce dossier).
7. `npm run dev` puis ouvrir `/` (site) et `/admin` (dashboard). `npm run build` pour la production
   (héberger `dist/` avec une règle de réécriture SPA vers `index.html`).

## Pages
- `/` accueil · `/properties` tous les biens · `/properties/<id>` fiche d'un bien · `/admin` dashboard.
- Le bouton « عرض التفاصيل » d'une carte ouvre la fiche ; « شاهد جميع العقارات » ouvre `/properties`.
- Le formulaire de la fiche enregistre le bien concerné : il apparaît dans « طلبات التواصل » avec son nom (et dans l'e-mail).
- Badge « للبيع / للإيجار » : champ « النوع » dans l'éditeur de bien.
- Images de l'accueil et logo : dashboard → « صور الموقع » (envoi, remplacement, retour à l'image par défaut). Les fichiers `public/images/*` ne servent que de valeurs par défaut.

## Base déjà créée avec l'ancienne version ?
Exécuter `supabase/update-2.sql`, `update-3.sql` (Batna) puis `update-4.sql` (images du site modifiables) dans le SQL Editor, puis redéployer la fonction :
`supabase functions deploy contact --no-verify-jwt`.

## Sécurité
- Aucun secret côté navigateur : la clé Resend et la clé service-role ne vivent que dans l'Edge Function.
- RLS : le public ne lit que `properties.published = true` et `site_settings`. `submissions` n'a aucune politique publique
  (insertion uniquement via l'Edge Function). Tout le reste exige `is_admin()`.
- Anti-spam : champ honeypot, refus des doublons (10 min), 3 demandes/heure/numéro max.
