import type { Metadata } from "next";
import { ContactFormClient } from "@/components/ContactFormClient";
import { FAQList, PageSection, SafetyNotice } from "@/components/PublicPageKit";
import "./kontakt.css";

export const metadata: Metadata = {
  title: "Kontakt | Fizioterapia Ime",
  description: "Kontakto ekipin e Fizioterapia Ime për pyetje rreth platformës, llogarisë, pagesës ose bashkëpunimit.",
  alternates: { canonical: "/kontakt" },
};

const faqs = [
  {
    question: "Kur mund të pres përgjigje?",
    answer: "Përgjigjemi sa më shpejt që të jetë e mundur. Për problemet teknike, përshkruaj edhe pajisjen dhe faqen ku ndodhi problemi.",
  },
  {
    question: "A mund të kërkoj demonstrim të platformës?",
    answer: "Po. Zgjidh temën ‘Bashkëpunim’ ose ‘Pyetje për platformën’ dhe shkruaj se dëshiron një prezantim të shkurtër.",
  },
  {
    question: "Ku kërkoj ndihmë për kodin e pacientit?",
    answer: "Pacienti duhet ta kontaktojë së pari fizioterapeutin që ia ka krijuar planin. Për probleme teknike, mund të na shkruash edhe këtu.",
  },
];

export default function ContactPage() {
  return (
    <main className="ct-page">
      <section className="ct-hero pp-reveal">
        <div className="ct-hero-copy">
          <span className="pp-eyebrow">Kontakt</span>
          <h1>Na shkruaj.<span>Jemi këtu për të ndihmuar.</span></h1>
          <p>
            Për pyetje rreth platformës, llogarisë, pagesës ose bashkëpunimit, dërgo një mesazh të shkurtër.
          </p>
          <div className="ct-direct-links">
            <a href="mailto:altin.physio@gmail.com">✉️ altin.physio@gmail.com</a>
            <a href="/support">🔎 Shko te Qendra e ndihmës</a>
          </div>
        </div>

        <div className="ct-hero-card" aria-label="Informata kontakti">
          <span className="ct-card-badge">Fizioterapia Ime</span>
          <h2>Si mund të të ndihmojmë?</h2>
          <ul>
            <li><span>✓</span> Regjistrimi dhe llogaria</li>
            <li><span>✓</span> Pagesa 9.90 € / muaj</li>
            <li><span>✓</span> Kodet dhe planet e pacientëve</li>
            <li><span>✓</span> Probleme teknike</li>
            <li><span>✓</span> Bashkëpunime me klinika</li>
          </ul>
        </div>
      </section>

      <section className="ct-form-section">
        <div className="ct-form-intro">
          <span>Mesazh i drejtpërdrejtë</span>
          <h2>Na trego çfarë të duhet.</h2>
          <p>Plotëso fushat më poshtë. Mesazhi hapet në aplikacionin tënd të emailit, gati për dërgim.</p>
        </div>
        <ContactFormClient />
      </section>

      <PageSection
        eyebrow="Zgjidh rrugën më të shpejtë"
        title="Ndoshta përgjigjja është vetëm një klik larg."
        text="Përdor linkun që përputhet me nevojën tënde."
        tone="soft"
      >
        <div className="ct-route-grid">
          <a className="ct-route-card pp-reveal" href="/support">
            <span>🛟</span><h3>Kam nevojë për ndihmë</h3><p>Kërko përgjigje për kodet, planet, ushtrimet dhe pagesën.</p><strong>Hap Support Center →</strong>
          </a>
          <a className="ct-route-card pp-reveal" href="/patient-portal">
            <span>👤</span><h3>Jam pacient</h3><p>Hyr me kodin e marrë nga fizioterapeuti.</p><strong>Hyr si pacient →</strong>
          </a>
          <a className="ct-route-card pp-reveal" href="/physiotherapist-portal">
            <span>🧑‍⚕️</span><h3>Jam fizioterapeut</h3><p>Hap portalin për pacientët, planet dhe progresin.</p><strong>Hap portalin →</strong>
          </a>
        </div>
      </PageSection>

      <PageSection eyebrow="Pyetje të shkurtra" title="Para se të na shkruash" text="Disa përgjigje që mund të të kursejnë kohë.">
        <FAQList items={faqs} />
      </PageSection>

      <section className="ct-safety-wrap">
        <SafetyNotice
          title="Kontakti nuk është shërbim urgjent"
          text="Për dhimbje të fortë, dobësi, mpirje, marramendje ose përkeqësim të shpejtë, kontakto profesionistin shëndetësor ose shërbimet emergjente."
        />
      </section>
    </main>
  );
}
