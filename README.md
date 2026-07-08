# FizioPlan / Fizioterapia Ime

FizioPlan eshte nje platforme SaaS per fizioterapi me tri role kryesore:

- **Pacient**: hyn vetem me kod unik dhe sheh planin e ushtrimeve.
- **Fizioterapeut**: krijon paciente, cakton plane, monitoron progresin, dhimbjen dhe AI score.
- **Owner/Admin**: panel i fshehur vetem per pronarin e platformes.

## Stack i planifikuar

- **Frontend web**: Next.js + TypeScript
- **Hosting**: Vercel
- **Auth per physio/owner**: Clerk
- **Database & Storage**: Supabase
- **AI movement analysis**: MediaPipe Pose Landmarker
- **Mobile app me vone**: Expo React Native

## Rregulli klinik kryesor

AI nuk cakton ushtrime, nuk vendos diagnoze, nuk ndryshon plan dhe nuk e zevendeson fizioterapeutin. AI vetem analizon levizjen, jep score/feedback bazik dhe dergon alerts te fizioterapeuti.

## Status

Ky repo eshte starter per MVP: dokumentim, strukture teknike, schema e databases dhe frontend fillestar.