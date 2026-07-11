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

## Stack

- **Frontend web**: Next.js + TypeScript
- **Hosting**: Vercel
- **Auth për physio/owner**: Clerk
- **Database**: Supabase
- **Email notifications**: Resend
- **AI movement analysis**: MediaPipe Pose Landmarker, vetëm kur aktivizohet në pilot
- **Mobile app**: Expo React Native, jo pjesë e launch-it publik të parë

## Billing pilot

Çdo fizioterapeut i aprovuar mund ta përdorë dashboard-in klinik dhe të menaxhojë deri në **5 pacientë falas**.

Për krijimin e pacientit të gjashtë dhe pacientëve të tjerë kërkohet abonim aktiv:

`9.90 EUR / muaj`

Pagesa automatike ende nuk është aktive. Deri në integrimin e payment provider-it, Owner/Admin mund ta aktivizojë manualisht abonimin në `/admin-billing`.

Pacientët ekzistues, planet, seancat dhe raportet nuk bllokohen vetëm sepse abonimi nuk është aktiv; kufizimi aplikohet te krijimi i pacientëve të rinj pas pesë vendeve falas.

## Launch checks

Para lansimit publik:

- Clerk keys duhet të jenë në Vercel.
- `ADMIN_EMAIL` duhet të jetë i saktë në production.
- `SUPABASE_SERVICE_ROLE_KEY` duhet të jetë vetëm server-side.
- `NEXT_PUBLIC_APP_URL` duhet të jetë domain-i final.
- `npm run preflight:routes`, `npm run lint` dhe `npm run build` duhet të kalojnë.
- Vercel preview/deploy duhet të mos jetë i bllokuar nga deployment limit.

## Deployment note

Admin route guards now live in `proxy.ts` only. `middleware.ts` is intentionally not used. This note also confirms the latest `main` branch should trigger a clean Vercel production rebuild.

## Figma design

Design source of truth:
https://www.figma.com/design/3o2V4zuS3NhceeH3FLyqRL

Handoff document:
`docs/figma-github-handoff.md`
