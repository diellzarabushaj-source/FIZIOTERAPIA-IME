import type { Metadata } from "next";
import styles from "./pricing.module.css";
import { UiIcon } from "@/components/UiIcon";

export const metadata: Metadata = {
  title: "Çmimi | Fizioterapia Ime",
  description: "Një çmim i thjeshtë për fizioterapeutët: 9.90 € në muaj për krijimin e planeve, ushtrimet, progresin dhe komunikimin me pacientët.",
  alternates: { canonical: "/cmimi" },
};

const included = [
  "Shto dhe menaxho pacientët",
  "Krijo plane ushtrimesh",
  "Përdor bankën e ushtrimeve",
  "Shto ushtrimet dhe videot e tua",
  "Dërgo planin me kod ose QR",
  "Shiko ushtrimet e kryera",
  "Përcill dhimbjen dhe progresin",
  "Merr njoftim kur pacienti raporton dhimbje të lartë",
  "Përdor sugjerimet e AI si ndihmë",
  "Gjenero raporte për pacientin",
];

const valueCards = [
  {
    icon: "clock",
    title: "Më pak kohë me mesazhe",
    text: "Nuk ke nevojë t’i dërgosh videot një nga një në WhatsApp.",
  },
  {
    icon: "progress",
    title: "Më shumë kontroll",
    text: "Sheh nëse pacienti i ka bërë ushtrimet dhe si është ndier.",
  },
  {
    icon: "smartphone",
    title: "Më e lehtë për pacientin",
    text: "Pacienti hap planin nga telefoni dhe sheh vetëm atë që i ke caktuar.",
  },
] as const;

const faqs = [
  {
    question: "Sa kushton?",
    answer: "Çmimi fillestar është 9.90 € në muaj për një fizioterapeut.",
  },
  {
    question: "A paguan edhe pacienti?",
    answer: "Jo. Pacienti hyn në planin e vet me kodin që ia jep fizioterapeuti.",
  },
  {
    question: "A mund t’i shtoj videot e mia?",
    answer: "Po. Mund të përdorësh ushtrimet nga banka ose të shtosh ushtrime dhe video të tua.",
  },
  {
    question: "A vendos AI në vendin tim?",
    answer: "Jo. AI jep vetëm sugjerime. Planin e kontrollon dhe e aprovon gjithmonë fizioterapeuti.",
  },
  {
    question: "A funksionon nga telefoni?",
    answer: "Po. Fizioterapeuti dhe pacienti mund ta përdorin platformën nga telefoni, tableti ose kompjuteri.",
  },
  {
    question: "Çfarë ndodh pas regjistrimit?",
    answer: "Krijon profilin, shton pacientin e parë dhe fillon ta ndërtosh planin e tij.",
  },
];

export default function PricingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Çmim i thjeshtë</span>
          <h1>Gjithçka që të duhet. <span>9.90 € në muaj.</span></h1>
          <p>
            Një abonim për fizioterapeutin. Pacientët hyjnë me kod dhe nuk paguajnë veçmas.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/physiotherapist-portal">Fillo me 9.90 €</a>
            <a className={styles.secondaryButton} href="/clinic-use">Shiko si përdoret</a>
          </div>
          <div className={styles.quickFacts} aria-label="Pikat kryesore të çmimit">
            <span className="public-fact">Abonim mujor</span>
            <span className="public-fact">Pacientët pa pagesë veçmas</span>
            <span className="public-fact">Gjithçka në një vend</span>
          </div>
        </div>

        <div className={styles.priceCardWrap}>
          <article className={styles.priceCard}>
            <span className={styles.foundingBadge}>Founding price</span>
            <p className={styles.planName}>Për fizioterapeutin</p>
            <div className={styles.priceRow}>
              <strong>9.90 €</strong>
              <span>/ muaj</span>
            </div>
            <p className={styles.priceDescription}>
              Për përdoruesit e parë të Fizioterapia Ime.
            </p>
            <a className={styles.cardButton} href="/physiotherapist-portal">Krijo llogarinë</a>
            <div className={styles.cardDivider} />
            <ul>
              {included.slice(0, 6).map((item) => <li key={item}><UiIcon name="check" size={16} /> {item}</li>)}
            </ul>
          </article>
          <div className={styles.floatingNote}>Pacienti hyn me kod</div>
          <div className={styles.floatingNoteAlt}>AI sugjeron. Ti vendos.</div>
        </div>
      </section>

      <section className={styles.valueSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span>Vlera për klinikën</span>
            <h2>Nuk po paguan vetëm për një listë ushtrimesh.</h2>
            <p>Po merr një mënyrë më të rregullt për të punuar me pacientët çdo ditë.</p>
          </div>
          <div className={styles.valueGrid}>
            {valueCards.map((item) => (
              <article className={styles.valueCard} key={item.title}>
                <div><UiIcon name={item.icon} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.includedSection}>
        <div className={styles.container}>
          <div className={styles.includedLayout}>
            <div className={styles.sectionHeader}>
              <span>Çfarë përfshihet</span>
              <h2>Një plan. Pa paketa të komplikuara.</h2>
              <p>Funksionet kryesore janë bashkë, që të mos humbësh kohë duke zgjedhur paketa.</p>
            </div>
            <div className={styles.includedList}>
              {included.map((item) => (
                <div key={item}>
                  <UiIcon name="check" size={18} />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.safetySection}>
        <div className={styles.container}>
          <div className={styles.safetyCard}>
            <div className={styles.safetyIcon}><UiIcon name="sparkles" size={26} /></div>
            <div>
              <span>AI me kontroll njerëzor</span>
              <h2>AI të ndihmon. Vendimin e merr ti.</h2>
              <p>
                Sugjerimet e AI nuk i dërgohen pacientit vetë. Ti i kontrollon, i ndryshon dhe i aprovon para se pacienti ta shohë planin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span>Pyetjet më të shpeshta</span>
            <h2>Gjërat që duhet t’i dish para se të fillosh.</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details className={styles.faqItem} key={faq.question}>
                <summary>{faq.question}<span>+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <span>Gati për të filluar?</span>
          <h2>Shto pacientin e parë sot.</h2>
          <p>Krijo llogarinë dhe ndërto planin e parë me hapa të thjeshtë.</p>
        </div>
        <a href="/physiotherapist-portal">Fillo me 9.90 €</a>
      </section>
    </main>
  );
}
