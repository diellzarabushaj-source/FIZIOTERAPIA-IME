# Fizioterapia Ime

Fizioterapia Ime është website dhe platformë pilot për fizioterapi digjitale. Launch-i aktual është **website-first**: faqet publike, support, legal pages dhe materiali edukativ janë prioritet para hapjes së plotë të portalit/app-it.

## Live website

Production:
https://fizioterapia-ime.vercel.app

## Scope për launch-in aktual

- **Publike**: Home, FAQ, Blog, Support, Clinic Use Guide, Patient Handout dhe legal pages.
- **Pilot i kontrolluar**: Patient/physio/admin flows përdoren vetëm me qasje të kontrolluar dhe konfigurim production.
- **Jo premtim publik**: AI Movement Check, dashboard-i klinik dhe app-i mobile nuk duhet të shiten si funksione publike derisa të testohen dhe aktivizohen plotësisht.

## Rregulli klinik kryesor

Fizioterapia Ime nuk cakton diagnozë, nuk cakton terapi dhe nuk e zëvendëson fizioterapeutin. Çdo plan nis nga profesionisti përgjegjës. Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.

## Bashkëpunimi mes fizioterapeutëve

Fizioterapeutët aktivë mund të:

- shohin direktorinë profesionale dhe kontaktet e kolegëve aktivë;
- dërgojnë kërkesë për transferimin e një pacienti;
- pranojnë ose refuzojnë kërkesat që u drejtohen;
- ruajnë historikun e auditimit të transferimeve.

Transferimi kërkon konfirmim të pëlqimit të pacientit. Pacienti mbetet te fizioterapeuti aktual derisa marrësi ta pranojë. Pas pranimit transferohen atomikisht kartela, planet, seancat dhe alarmet klinike. Migrimi përkatës është `supabase/migrations/20260711_zzz_patient_handoffs.sql`.

## Stack

- **Frontend web**: Next.js + TypeScript
- **Runtime**: Node.js 24 + npm 10.9.2
- **Hosting**: Vercel
- **Auth për physio/owner**: Clerk
- **Database**: Supabase
- **CMS**: Sanity Studio
- **Email notifications**: Resend
- **AI movement analysis**: MediaPipe Pose Landmarker, vetëm kur aktivizohet në pilot
- **Mobile app**: Expo React Native, jo pjesë e launch-it publik të parë

## Billing pilot

Çdo fizioterapeut i aprovuar mund ta përdorë dashboard-in klinik dhe të menaxhojë deri në **5 pacientë falas**.

Për krijimin e pacientit të gjashtë dhe pacientëve të tjerë kërkohet abonim aktiv:

`9.90 EUR / muaj`

Pagesa automatike ende nuk është aktive. Deri në integrimin e payment provider-it, Owner/Admin mund ta aktivizojë manualisht abonimin në `/admin-billing`.

Pacientët ekzistues, planet, seancat dhe raportet nuk bllokohen vetëm sepse abonimi nuk është aktiv; kufizimi aplikohet te krijimi i pacientëve të rinj pas pesë vendeve falas.

## Instalimi lokal

```bash
nvm use
npm install --no-audit --no-fund
cp .env.example .env.local
npm run check:all
npm run dev
```

Mos përdor production credentials në zhvillim lokal. `.env.example` dokumenton emrat e variablave, por nuk duhet të përmbajë secrets reale.

## Launch checks

Para lansimit publik:

- Clerk production keys duhet të jenë në Vercel.
- `ADMIN_EMAIL` duhet të jetë i saktë në production.
- `SUPABASE_SERVICE_ROLE_KEY` duhet të jetë vetëm server-side.
- `PATIENT_SESSION_SECRET` duhet të jetë secret unik me së paku 32 bytes entropi.
- `PATIENT_SESSION_REGISTRY_ENABLED=1` vendoset vetëm pasi migrimi përkatës të jetë aplikuar.
- `NEXT_PUBLIC_APP_URL` duhet të jetë domain-i final HTTPS.
- të gjitha migrimet në `supabase/migrations/` duhet të jenë aplikuar sipas rendit.
- `GET /api/health` duhet të kthejë HTTP `200`.
- `GET /api/readiness` duhet të kthejë HTTP `200` dhe schema version `20260711.5`.
- `npm run check:all` duhet të kalojë pa çaktivizuar lint, type-check, teste ose build.
- Vercel preview/deploy duhet të mos jetë i bllokuar nga deployment limit.
- Resend duhet të ketë domain të verifikuar para email-eve reale.

Për rikuperim dhe rollout të kontrolluar përdor:

`docs/production-recovery-runbook.md`

## Struktura kryesore

- `app/` — Next.js App Router, portalet dhe API routes.
- `lib/backend/` — autorizimi, validimi dhe shërbimet server-side.
- `supabase/migrations/` — schema evolutive e databazës.
- `apps/studio/` — Sanity Studio dhe schema burimore.
- `apps/mobile-app/` — klienti Expo në fazë pilot.
- `tests/backend/` — testet unit/integration të logjikës kritike.
- `scripts/` — quality gates, smoke tests dhe kontrollet e sigurisë/readiness.
- `docs/` — runbooks, SOP dhe handoff teknik.

## Deployment note

Admin route guards jetojnë në `proxy.ts`; `middleware.ts` nuk përdoret. Rrugët e pacientit janë publike vetëm në shtresën Clerk, ndërsa të dhënat klinike mbrohen server-side nga sesioni i nënshkruar, pronësia e planit dhe statusi aktiv.

## Figma design

Design source of truth:
https://www.figma.com/design/3o2V4zuS3NhceeH3FLyqRL

Handoff document:
`docs/figma-github-handoff.md`
