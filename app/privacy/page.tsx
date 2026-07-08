import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      badge="Privacy Policy"
      title="Politika e privatësisë"
      intro="Kjo faqe shpjegon si Fizioterapia ime mbledh, përdor dhe mbron të dhënat e pacientëve dhe fizioterapeutëve."
      sections={[
        {
          title: "1. Të dhënat që mblidhen",
          body: "Platforma mund të ruajë emrin, mbiemrin, moshën, numrin e telefonit, diagnozën/problemin e raportuar, planin e ushtrimeve, pain score, exercise logs, AI Movement Check score, mesazhe dhe të dhëna teknike të përdorimit. Pacienti hyn me username dhe kod të gjeneruar nga fizioterapeuti.",
        },
        {
          title: "2. Qëllimi i përdorimit",
          body: "Të dhënat përdoren për të krijuar plane rehabilitimi, për të ndjekur progresin, për të lehtësuar komunikimin me fizioterapeutin, për të dërguar njoftime klinike dhe për të gjeneruar raporte progresi. AI Movement Check përdoret vetëm për feedback të lëvizjes dhe nuk bën diagnozë.",
        },
        {
          title: "3. Kush ka qasje",
          body: "Fizioterapeuti sheh vetëm pacientët e vet. Admini/owner mund të ketë qasje për administrim të platformës, support teknik, siguri dhe mirëmbajtje. Pacientët shohin vetëm planin e tyre dhe të dhënat e lidhura me të.",
        },
        {
          title: "4. Ruajtja dhe siguria",
          body: "Të dhënat ruhen në Supabase me Row Level Security dhe qasje të kufizuar. Keys dhe secrets ruhen vetëm në Vercel Environment Variables. Nuk duhet të ndahen kodet e pacientëve me persona të tretë.",
        },
        {
          title: "5. Email dhe njoftime",
          body: "Platforma mund të dërgojë email te fizioterapeuti për raste si dhimbje 7/10 ose më shumë, AI score të ulët, ose ngjarje të rëndësishme klinike. Emailat dërgohen përmes Resend dhe regjistrohen si notification logs.",
        },
        {
          title: "6. Fshirja e të dhënave",
          body: "Pacienti ose fizioterapeuti mund të kërkojë qasje, korrigjim ose fshirje të të dhënave përmes faqes Data Deletion Request. Kërkesat trajtohen nga administratori i platformës sipas rregullave ligjore dhe kontraktuale të zbatueshme.",
        },
      ]}
    />
  );
}
