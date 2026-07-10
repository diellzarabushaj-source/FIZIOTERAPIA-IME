import type { Metadata } from "next";
import { FaqExplorer } from "@/components/FaqExplorer";
import { SafetyNotice } from "@/components/PublicPageKit";
import { getFaqItems } from "@/lib/sanity/queries";
import styles from "./faq.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pyetje të shpeshta | Fizioterapia Ime",
  description: "Përgjigje të qarta për pacientët, fizioterapeutët, planet, kodet, pagesën, AI dhe sigurinë.",
  alternates: { canonical: "/faq" },
};

const fallbackFaqs = [
  { category: "Pacienti", question: "Si hyj në planin tim?", answer: "Përdor kodin ose QR-në që ta ka dërguar fizioterapeuti. Pacienti nuk ka nevojë të krijojë plan vetë." },
  { category: "Pacienti", question: "A mund ta përdor nga telefoni?", answer: "Po. Portali është ndërtuar për telefon, tablet dhe kompjuter." },
  { category: "Pacienti", question: "A mund t’i shoh ushtrimet e mëparshme?", answer: "Po. Mund ta shohësh historinë e planit dhe përparimin tënd." },
  { category: "Fizioterapeuti", question: "Kush e krijon dhe e ndryshon planin?", answer: "Vetëm fizioterapeuti e krijon, e ndryshon dhe e aprovon planin e pacientit." },
  { category: "Planet", question: "A mund të caktoj sete, përsëritje dhe frekuencë?", answer: "Po. Për çdo ushtrim mund të caktohen setet, përsëritjet, frekuenca dhe udhëzimet." },
  { category: "AI", question: "A e zëvendëson AI fizioterapeutin?", answer: "Jo. AI jep vetëm sugjerime ose feedback. Vendimi klinik mbetet te fizioterapeuti." },
  { category: "Siguria", question: "Çfarë bëj nëse dhimbja është 7/10 ose më shumë?", answer: "Ndalo ushtrimin dhe kontakto fizioterapeutin. Për simptoma urgjente kërko ndihmë mjekësore." },
  { category: "Pagesa", question: "Sa kushton platforma?", answer: "Çmimi fillestar është 9.90 € në muaj për fizioterapeutin. Pacienti nuk paguan veçmas." },
  { category: "Llogaria", question: "E harrova kodin. Çfarë bëj?", answer: "Kontakto fizioterapeutin që ta rigjenerojë ose ta dërgojë përsëri kodin." },
];

export default async function FaqPage() {
  const sanityFaqs = await getFaqItems();
  const source = sanityFaqs.length > 0 ? sanityFaqs : fallbackFaqs;
  const faqs = source.map((item) => ({
    question: item.question,
    answer: item.answer,
    category: item.category || "Të tjera",
  }));

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Pyetje të shpeshta</span>
        <h1>Përgjigje të qarta.<span> Pa fjalë të komplikuara.</span></h1>
        <p>Kërko pyetjen tënde ose zgjidh një kategori. Përgjigjet përditësohen pa e prishur përmbajtjen që menaxhohet nga Sanity.</p>
        <div className={styles.trust}>
          <span>✓ Për pacientë</span><span>✓ Për fizioterapeutë</span><span>✓ Siguri klinike</span>
        </div>
      </section>

      <section className={styles.body}>
        <div className={styles.introGrid}>
          <article className={styles.introCard}><span>📱</span><h2>Për pacientin</h2><p>Kodi, videot, përparimi dhe dhimbja.</p></article>
          <article className={styles.introCard}><span>🧑‍⚕️</span><h2>Për fizioterapeutin</h2><p>Pacientët, planet, ushtrimet dhe raportet.</p></article>
          <article className={styles.introCard}><span>🛡️</span><h2>Për sigurinë</h2><p>Kur duhet ndalur ushtrimi dhe kërkuar ndihmë.</p></article>
        </div>

        <FaqExplorer items={faqs} />

        <div className={styles.safety}>
          <SafetyNotice
            title="Platforma nuk jep diagnozë"
            text="Fizioterapia Ime e mbështet planin e fizioterapisë, por nuk e zëvendëson vlerësimin profesional ose kujdesin urgjent."
          />
        </div>
      </section>

      <section className={styles.cta}>
        <div><h2>Nuk e gjete përgjigjen?</h2><p>Hap Qendrën e Ndihmës ose na shkruaj direkt.</p></div>
        <a href="/support">Hap Qendrën e Ndihmës →</a>
      </section>
    </main>
  );
}
