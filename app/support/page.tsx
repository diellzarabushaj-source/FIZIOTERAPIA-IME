import type { Metadata } from "next";
import { CTASection, FAQList, PageSection, SafetyNotice } from "@/components/PublicPageKit";
import { SupportCenterClient } from "@/components/SupportCenterClient";

export const metadata: Metadata = {
  title: "Ndihmë dhe Support | Fizioterapia Ime",
  description: "Gjej shpejt përgjigje për pacientët, planet, ushtrimet, kodet, pagesën dhe përdorimin e Fizioterapia Ime.",
  alternates: { canonical: "/support" },
};

const commonFaqs = [
  {
    question: "A mund ta përdor nga telefoni?",
    answer: "Po. Faqet për pacientin dhe fizioterapeutin punojnë edhe në telefon, tablet dhe kompjuter.",
  },
  {
    question: "A krijon pacienti plan vetë?",
    answer: "Jo. Planin e krijon, e ndryshon dhe e aprovon vetëm fizioterapeuti.",
  },
  {
    question: "A e zëvendëson AI fizioterapeutin?",
    answer: "Jo. AI vetëm jep sugjerime. Vendimin e merr gjithmonë fizioterapeuti.",
  },
  {
    question: "Çfarë bëj nëse kam dhimbje të fortë?",
    answer: "Ndalo ushtrimin. Nëse dhimbja është 7/10 ose më shumë, kontakto fizioterapeutin. Për simptoma urgjente kërko ndihmë mjekësore.",
  },
  {
    question: "Sa kushton platforma?",
    answer: "Çmimi fillestar është 9.90 € në muaj për fizioterapeutin. Pacienti nuk paguan veçmas.",
  },
];

export default function SupportPage() {
  return (
    <main className="sc-page">
      <section className="sc-hero pp-reveal">
        <span className="pp-eyebrow">Qendra e ndihmës</span>
        <h1>Si mund të të <span>ndihmojmë?</span></h1>
        <p>
          Shkruaj pyetjen ose zgjidh një kategori. Përgjigjet janë të shkurtra dhe të kuptueshme.
        </p>
        <div className="sc-quick-links">
          <a href="#kerko">Kërko përgjigje</a>
          <a href="/patient-portal">Hyr si pacient</a>
          <a href="/physiotherapist-portal">Hyr si fizioterapeut</a>
        </div>
      </section>

      <section className="sc-main" id="kerko">
        <SupportCenterClient />
        <div className="sc-safety-wrap">
          <SafetyNotice
            title="Siguria vjen e para"
            text="Në dhimbje 7/10 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin. Platforma nuk jep diagnozë dhe nuk e ndryshon planin vetë."
          />
        </div>
      </section>

      <PageSection
        eyebrow="Kontakt i drejtpërdrejtë"
        title="Nuk e gjete përgjigjen?"
        text="Na trego shkurt çfarë nuk po funksionon. Shëno edhe nëse je pacient apo fizioterapeut."
        tone="soft"
      >
        <div className="sc-contact-grid">
          <article className="sc-contact-card pp-reveal">
            <span aria-hidden="true">✉️</span>
            <h3>Email</h3>
            <p>Për pyetje rreth llogarisë, kodit, planit ose pagesës.</p>
            <a href="mailto:altin.physio@gmail.com?subject=Ndihmë%20-%20Fizioterapia%20Ime">altin.physio@gmail.com →</a>
          </article>
          <article className="sc-contact-card pp-reveal">
            <span aria-hidden="true">👤</span>
            <h3>Je pacient?</h3>
            <p>Hyr me kodin që ta ka dhënë fizioterapeuti dhe shiko planin tënd.</p>
            <a href="/patient-portal">Hyr me kod →</a>
          </article>
          <article className="sc-contact-card pp-reveal">
            <span aria-hidden="true">🧑‍⚕️</span>
            <h3>Je fizioterapeut?</h3>
            <p>Hap portalin për të shtuar pacientë, plane dhe ushtrime.</p>
            <a href="/physiotherapist-portal">Hap portalin →</a>
          </article>
        </div>
      </PageSection>

      <PageSection
        eyebrow="Pyetje të zakonshme"
        title="Përgjigje të shpejta"
        text="Këto janë pyetjet që bëhen më shpesh."
      >
        <FAQList items={commonFaqs} />
      </PageSection>

      <CTASection
        title="Ende ke nevojë për ndihmë?"
        text="Na shkruaj me një përshkrim të shkurtër dhe do ta shohim problemin."
        href="mailto:altin.physio@gmail.com?subject=Support%20-%20Fizioterapia%20Ime"
        label="Na shkruaj"
      />
    </main>
  );
}
