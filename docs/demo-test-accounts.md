# Demo accounts për testim

Ky demo përdor të dhëna artificiale dhe nuk duhet të përmbajë të dhëna reale shëndetësore.

## 1. Ngarko demo data në Supabase

Hape Supabase SQL Editor dhe ekzekuto:

`supabase/demo-physio-patient.sql`

Skripti mund të ekzekutohet disa herë pa krijuar pacientë të dyfishtë.

## 2. Demo fizioterapisti

- Email: `xhavitrabushaj63@gmail.com`
- Emri: `Xhavit Rabushaj`
- Klinika: `Fizioterapia Ime · Demo Clinic`
- Subscription: `active`
- Çmimi demonstrues: `9.90 EUR / muaj`
- Vlefshmëria: 12 muaj nga momenti kur ekzekutohet seed-i

Për ta testuar portalin e fizioterapistit, përdor ose krijo një përdorues Clerk me këtë email dhe bëj sign in. Në hyrjen e parë, sistemi e lidh automatikisht `clerk_user_id` me profilin ekzistues sipas emailit.

Rruga:

`/physiotherapist-portal`

## 3. Demo pacienti

- Emri: `Arta Demo`
- Username: `arta.demo`
- Kodi: `DEMO-2026`
- Diagnoza demonstrative: dhimbje jo-specifike lumbale
- Plan aktiv: `Program demo · Stabilizim lumbar 14 ditë`

Përdor username-in dhe kodin në rrjedhën ekzistuese të hyrjes së pacientit.

## 4. Çfarë duhet të shihet

Në portalin e fizioterapistit duhet të shfaqen:

- subscription aktiv;
- një pacient aktiv;
- një program aktiv;
- të dhënat bazë të pacientit dhe kodi unik.

## 5. Siguria

- Mos përdor password real ose të dhëna reale pacientësh në dokumentacion.
- Demo subscription nuk përfaqëson pagesë reale.
- Para production launch, demo data duhet të fshihet ose të mbahet vetëm në Supabase preview/staging.
