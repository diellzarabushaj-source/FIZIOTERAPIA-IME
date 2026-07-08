# FizioPlan / Fizioterapia ime

FizioPlan / Fizioterapia ime është platformë SaaS për fizioterapi me tri role kryesore:

- **Pacient**: hyn me username + kod unik dhe sheh planin e ushtrimeve.
- **Fizioterapeut**: krijon pacientë, cakton plane, monitoron progresin, dhimbjen dhe AI score.
- **Owner/Admin**: panel i fshehur për pronarin e platformës, billing dhe content management.

## Live app

Production:
https://fizioterapia-ime.vercel.app

## Figma design

Design source of truth:
https://www.figma.com/design/3o2V4zuS3NhceeH3FLyqRL

Handoff document:
`docs/figma-github-handoff.md`

## Stack

- **Frontend web**: Next.js + TypeScript
- **Hosting**: Vercel
- **Auth për physio/owner**: Clerk
- **Database**: Supabase
- **Email notifications**: Resend
- **AI movement analysis**: MediaPipe Pose Landmarker
- **Mobile app**: Expo React Native

## Billing

Fizioterapeutët duhet të kenë subscription aktiv për qasje:

`29.90 EUR / muaj`

MVP billing është manual/local-bank. Owner/Admin e aktivizon qasjen në `/admin-billing`.

## Rregulli klinik kryesor

AI nuk cakton ushtrime, nuk vendos diagnozë, nuk ndryshon plan dhe nuk e zëvendëson fizioterapeutin. AI vetëm analizon lëvizjen, jep score/feedback bazik dhe dërgon alerts te fizioterapeuti.

## Status

MVP foundation është ndërtuar:

- Clerk auth
- Supabase schema + RLS
- Physio dashboard
- Patient portal
- AI Movement Check
- Resend notifications
- PDF reports
- Manual billing 29.90 EUR/month
- Legal pages
- Expo mobile app prep
- Figma UI design system
