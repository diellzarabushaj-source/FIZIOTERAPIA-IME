import { LegalPage } from "@/components/LegalPage";

export default function MedicalDisclaimerPage() {
  return (
    <LegalPage
      badge="Medical Disclaimer"
      title="Deklaratë mjekësore"
      intro="Kjo deklaratë sqaron kufijtë klinikë të Fizioterapia ime dhe rolit të AI Movement Check."
      sections={[
        {
          title: "1. Platformë mbështetëse, jo diagnozë",
          body: "Fizioterapia ime është mjet mbështetës për fizioterapeutë dhe pacientë. Platforma nuk vendos diagnozë, nuk përshkruan terapi dhe nuk zëvendëson konsultën me fizioterapeut, mjek ose profesionist tjetër shëndetësor.",
        },
        {
          title: "2. Roli i fizioterapeutit",
          body: "Fizioterapeuti mbetet përgjegjës për vlerësimin profesional, caktimin e planit, modifikimin e ushtrimeve dhe vendimet klinike. Të dhënat nga platforma duhet të përdoren si ndihmë për monitorim, jo si vendim automatik.",
        },
        {
          title: "3. AI Movement Check",
          body: "AI Movement Check analizon lëvizjen përmes kamerës dhe jep score/feedback për cilësinë e lëvizjes. AI nuk sheh dhimbjen reale, nuk diagnostikon, nuk kupton plotësisht historinë klinike dhe nuk duhet të përdoret si zëvendësim i vlerësimit profesional.",
        },
        {
          title: "4. Kur duhet ndalur ushtrimi",
          body: "Nëse dhimbja është 7/10 ose më shumë, nëse dhimbja përkeqësohet, ose nëse shfaqen mpirje, dobësi, marramendje, dhimbje gjoksi, humbje kontrolli të urinës/jashtëqitjes ose simptoma të tjera shqetësuese, pacienti duhet të ndalojë ushtrimin dhe të kontaktojë profesionistin shëndetësor.",
        },
        {
          title: "5. Jo për emergjenca",
          body: "Platforma nuk është shërbim emergjent. Për urgjenca, pacienti duhet të kontaktojë shërbimet emergjente lokale ose institucionin shëndetësor përkatës.",
        },
      ]}
    />
  );
}
