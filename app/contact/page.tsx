import type { Metadata } from "next";
import { ContactFormClient } from "@/components/ContactFormClient";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Kontakt | Fizioterapia Ime",
  description: "Kontakto ekipin e Fizioterapia Ime për pyetje rreth platformës, llogarisë, pagesës ose bashkëpunimit.",
  alternates: { canonical: "/contact" },
};

const contactOptions = [
  {
    icon: "✉️",
    title: "Email",
    text: "Për pyetje rreth platformës, pagesës ose llogarisë.",
    href: "mailto:altin.physio@gmail.com?subject=Kontakt%20-%20Fizioterapia%20Ime",
    label: "altin.physio@gmail.com",
  },
  {
    icon: "💬",
    title: "Support Center",
    text: "Përgjigje të shpejta për problemet më të zakonshme.",
    href: "/support",
    label: "Hap qendrën e ndihmës",
  },
  {
    icon: "🧑‍⚕️",
    title: "Për fizioterapeutë",
    text: "Shiko si funksionon platforma për klinikën tënde.",
    href: "/per-fizioterapeutin",
    label: "Shiko platformën",
  },
];

const faqs = [
  ["Sa shpejt përgjigjeni?", "Synojmë t’u përgjigjemi mesazheve sa më shpejt gjatë ditëve të punës."],
  ["A mund të kërkoj një demonstrim?", "Po. Shëno te mesazhi se dëshiron demonstrim dhe na trego shkurt çfarë lloj klinike ke."],
  ["Ku duhet të raportoj një problem teknik?", "Zgjidh temën “Problem teknik” dhe përshkruaj çfarë ndodhi, në cilën faqe dhe nga cili telefon apo kompjuter."],
  ["A japim këshilla mjekësore me email?", "Jo. Kontakti përdoret për platformën dhe support-in. Për çështje shëndetësore kontakto fizioterapeutin ose mjekun tënd."],
];

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Kontakt</span>
          <h1>Na shkruaj. <span>Jemi këtu për të ndihmuar.</span></h1>
          <p>
            Ke pyetje për platformën, pagesën, llogarinë apo bashkëpunimin? Na dërgo një mesazh të shkurtër.
          </p>
          <div className={styles.heroLinks}>
            <a className={styles.primary} href="#formulari">Dërgo mesazh</a>
            <a className={styles.secondary} href="/support">Shiko ndihmën</a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Kontakti me ekipin e Fizioterapia Ime">
          <div className={styles.statusDot} />
          <span>Ekipi i support-it</span>
          <strong>Si mund të të ndihmojmë?</strong>
          <p>Përshkruaje shkurt problemin dhe zgjidh temën e duhur.</p>
          <div className={styles.messagePreview}>
            <span>Ti</span>
            <p>Kam një pyetje për llogarinë time...</p>
          </div>
          <div className={`${styles.messagePreview} ${styles.reply}`}>
            <span>Fizioterapia Ime</span>
            <p>Faleminderit. Po e shohim dhe do të të përgjigjemi.</p>
          </div>
        </div>
      </section>

      <section className={styles.optionsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span>Zgjidh mënyrën</span>
            <h2>Gjej ndihmën më shpejt.</h2>
            <p>Për pyetje të zakonshme, Support Center është rruga më e shpejtë.</p>
          </div>
          <div className={styles.optionGrid}>
            {contactOptions.map((option) => (
              <article className={styles.optionCard} key={option.title}>
                <div className={styles.optionIcon}>{option.icon}</div>
                <h3>{option.title}</h3>
                <p>{option.text}</p>
                <a href={option.href}>{option.label} →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="formulari">
        <div className={styles.formShell}>
          <div className={styles.formIntro}>
            <span>Mesazh i ri</span>
            <h2>Na trego si mund të të ndihmojmë.</h2>
            <p>Plotëso fushat më poshtë. Mos shkruaj të dhëna të ndjeshme shëndetësore.</p>
            <ul>
              <li>Shëno nëse je pacient apo fizioterapeut.</li>
              <li>Përshkruaj problemin me pak fjali.</li>
              <li>Për problem teknik, përmend faqen dhe pajisjen.</li>
            </ul>
          </div>
          <ContactFormClient />
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span>Pyetje të shpejta</span>
            <h2>Para se të na shkruash.</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span>+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <span>Fizioterapia Ime</span>
          <h2>Pyetja jote mund të jetë vetëm një mesazh larg.</h2>
          <p>Na shkruaj dhe zgjidh temën që na ndihmon ta kuptojmë më shpejt kërkesën.</p>
        </div>
        <a href="#formulari">Shkruaj tani →</a>
      </section>
    </main>
  );
}
