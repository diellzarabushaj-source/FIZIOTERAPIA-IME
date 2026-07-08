import { LegalPage } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      badge="Terms of Use"
      title="Kushtet e përdorimit"
      intro="Këto kushte përcaktojnë mënyrën e përdorimit të platformës Fizioterapia ime nga pacientët, fizioterapeutët dhe administratorët."
      sections={[
        {
          title: "1. Përshkrimi i shërbimit",
          body: "Fizioterapia ime është platformë digjitale për krijim të planeve të fizioterapisë, ndjekje të ushtrimeve, raportim të dhimbjes, komunikim dhe raporte progresi. Platforma mbështet fizioterapeutin, por nuk e zëvendëson vlerësimin profesional.",
        },
        {
          title: "2. Përdorimi nga pacienti",
          body: "Pacienti përdor platformën vetëm me username dhe kod të dhënë nga fizioterapeuti. Pacienti duhet të ndjekë udhëzimet, të raportojë dhimbjen sinqerisht dhe të ndalojë ushtrimin nëse dhimbja rritet ose shfaqen simptoma shqetësuese.",
        },
        {
          title: "3. Përdorimi nga fizioterapeuti",
          body: "Fizioterapeuti është përgjegjës për vlerësimin klinik, zgjedhjen e ushtrimeve, përshtatjen e planit dhe interpretimin e të dhënave. Platforma ofron mjete digjitale dhe nuk merr vendime klinike në vend të fizioterapeutit.",
        },
        {
          title: "4. Llogaritë dhe qasja",
          body: "Fizioterapeutët hyjnë me Clerk authentication. Pacientët hyjnë me username dhe kod. Qasja duhet të mbahet private. Çdo përdorim i paautorizuar duhet të raportohet menjëherë te administratori.",
        },
        {
          title: "5. Kufizimi i përgjegjësisë",
          body: "Platforma nuk është shërbim urgjent, nuk zëvendëson konsultën mjekësore dhe nuk garanton rezultat klinik. Për dhimbje të fortë, përkeqësim, mpirje, dobësi ose simptoma të reja, pacienti duhet të kontaktojë profesionistin shëndetësor.",
        },
        {
          title: "6. Ndryshimet",
          body: "Këto kushte mund të përditësohen gjatë zhvillimit të produktit. Versioni final duhet të rishikohet nga jurist dhe të përshtatet me tregun ku platforma publikohet.",
        },
      ]}
    />
  );
}
