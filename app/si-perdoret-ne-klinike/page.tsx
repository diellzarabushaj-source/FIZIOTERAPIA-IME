import styles from "./clinic-use.module.css";

export const metadata = {
  title: "Si përdoret në klinikë | Fizioterapia Ime",
  description: "Shiko si shtohet pacienti, si zgjidhen ushtrimet, si dërgohet plani dhe si përcillet progresi në Fizioterapia Ime.",
  alternates: { canonical: "/si-perdoret-ne-klinike" },
};

const steps = [
  {
    number: "01",
    icon: "👤",
    title: "Shto pacientin",
    text: "Shkruaj emrin, problemin dhe disa të dhëna bazë. Nuk ka formularë të gjatë.",
    detail: "Pacienti ruhet në listën tënde dhe është gati për planin e ushtrimeve.",
  },
  {
    number: "02",
    icon: "📚",
    title: "Zgjidh ushtrimet",
    text: "Kërko në bankën e ushtrimeve ose përdor sugjerimet e AI.",
    detail: "Ti i pranon, i ndryshon ose i largon ushtrimet. Vendimin e merr gjithmonë fizioterapeuti.",
  },
  {
    number: "03",
    icon: "📲",
    title: "Dërgo planin",
    text: "Pacienti merr kod, QR ose link dhe hyn nga telefoni.",
    detail: "Nuk ka nevojë të mësojë një program të vështirë apo të kërkojë video në WhatsApp.",
  },
  {
    number: "04",
    icon: "▶️",
    title: "Pacienti bën ushtrimet",
    text: "Sheh videon, setet, përsëritjet dhe udhëzimet e thjeshta.",
    detail: "Pas çdo ushtrimi shënon nëse e kreu, sa e vështirë ishte dhe sa dhimbje pati.",
  },
  {
    number: "05",
    icon: "📈",
    title: "Ti sheh progresin",
    text: "Shiko ushtrimet e kryera, dhimbjen dhe komentet e pacientit.",
    detail: "Kur duhet, e ndryshon planin dhe pacienti e sheh versionin e ri menjëherë.",
  },
];

const benefits = [
  ["⏱️", "Kursen kohë", "Më pak letra, më pak video të dërguara një nga një."],
  ["📲", "Pacienti e kupton", "Çdo ushtrim është në një ekran, me video dhe udhëzime."],
  ["📈", "Sheh progresin", "Nuk pret vizitën tjetër për të kuptuar si po shkon terapia."],
  ["🔔", "Merr njoftime", "Dhimbja e lartë ose përkeqësimi të shfaqen menjëherë."],
  ["📚", "Ke bankën e ushtrimeve", "Zgjedh shpejt ushtrimet që përdor më shpesh."],
  ["🤖", "AI vetëm ndihmon", "AI sugjeron. Ti kontrollon dhe aprovon."],
];

const faqs = [
  ["A duhet pacienti të krijojë llogari?", "Jo. Pacienti mund të hyjë me kodin ose QR që ia jep fizioterapeuti."],
  ["A mund ta ndryshoj planin?", "Po. Mund të ndryshosh ushtrimet, setet, përsëritjet dhe udhëzimet kur të duhet."],
  ["A mund të shtoj ushtrimet e mia?", "Po. Mund të shtosh ushtrim tënd me emër, udhëzime dhe video."],
  ["A punon në telefon?", "Po. Fizioterapeuti dhe pacienti mund ta përdorin nga telefoni, tableti ose kompjuteri."],
  ["A e krijon AI planin vetë?", "Jo. AI jep vetëm sugjerime. Plani dërgohet vetëm pasi fizioterapeuti e kontrollon dhe e aprovon."],
  ["Çfarë ndodh kur pacienti ka dhimbje të lartë?", "Pacienti udhëzohet të ndalet dhe fizioterapeuti merr njoftim për ta rishikuar planin."],
];

export default function ClinicUsePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>Si përdoret në klinikë</span>
          <h1>Nga pacienti i parë deri te ushtrimet në shtëpi.</h1>
          <p>
            Shto pacientin, zgjidh ushtrimet dhe dërgo planin. Pacienti i sheh në telefon, ndërsa ti përcjell progresin.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="/physiotherapist-portal">Fillo si fizioterapeut</a>
            <a className={styles.secondary} href="#hapat">Shiko 5 hapat</a>
          </div>
          <div className={styles.trustLine}>
            <span>✓ Pa letra</span>
            <span>✓ Pa video të shpërndara</span>
            <span>✓ Vendimi mbetet te fizioterapeuti</span>
          </div>
        </div>

        <div className={styles.demo} aria-label="Pamje e rrjedhës së punës në klinikë">
          <div className={styles.demoGlow} />
          <div className={`${styles.demoCard} ${styles.cardOne}`}>
            <span>Pacienti</span>
            <strong>Arta Gashi</strong>
            <small>Dhimbje mesi</small>
          </div>
          <div className={`${styles.demoCard} ${styles.cardTwo}`}>
            <span>Plani</span>
            <strong>5 ushtrime</strong>
            <small>3 herë në javë</small>
          </div>
          <div className={`${styles.demoCard} ${styles.cardThree}`}>
            <span>Sot</span>
            <strong>4/5 të kryera</strong>
            <div className={styles.progress}><i /></div>
          </div>
          <div className={styles.demoArrow}>→</div>
        </div>
      </section>

      <section className={styles.stepsSection} id="hapat">
        <div className={styles.sectionHead}>
          <span>Vetëm 5 hapa</span>
          <h2>E lehtë për klinikën. E qartë për pacientin.</h2>
          <p>Nuk duhet të jesh i mirë me teknologji. Çdo hap të tregon qartë çfarë të bësh.</p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article className={styles.stepCard} key={step.number}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber}>{step.number}</span>
                <span className={styles.stepIcon}>{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <small>{step.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.timeline}>
          {["Pacienti", "Plani", "Video", "Feedback", "Progresi"].map((item, index) => (
            <div key={item} className={styles.timelineItem}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.aiSection}>
        <div className={styles.aiIcon}>🤖</div>
        <div>
          <span>AI në Fizioterapia Ime</span>
          <h2>AI të ndihmon. Ti vendos.</h2>
          <p>
            AI mund të sugjerojë ushtrime nga banka. Ti i kontrollon, i ndryshon dhe i aprovon para se pacienti t’i shohë.
          </p>
        </div>
        <div className={styles.aiRule}>
          <b>Rregulli kryesor</b>
          <span>Asnjë plan nuk dërgohet pa aprovimin e fizioterapeutit.</span>
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.sectionHead}>
          <span>Puna e përditshme</span>
          <h2>Më pak punë të përsëritur. Më shumë kohë për pacientin.</h2>
        </div>
        <div className={styles.benefitsGrid}>
          {benefits.map(([icon, title, text]) => (
            <article key={title} className={styles.benefitCard}>
              <span>{icon}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.safetySection}>
        <div>
          <span>Siguria</span>
          <h2>Kur pacienti raporton dhimbje të lartë, ushtrimi ndalet.</h2>
          <p>Pacienti udhëzohet të kontaktojë fizioterapeutin. Platforma nuk e ndryshon terapinë vetë.</p>
        </div>
        <div className={styles.painBadge}>7/10</div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionHead}>
          <span>Pyetje të shpeshta</span>
          <h2>Përgjigje të shkurtra dhe të qarta.</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <span>Gati për ta provuar?</span>
        <h2>Krijo planin e parë dhe shiko sa e thjeshtë është.</h2>
        <div className={styles.actions}>
          <a className={styles.primary} href="/physiotherapist-portal">Fillo tani</a>
          <a className={styles.secondary} href="/contact">Na kontakto</a>
        </div>
      </section>
    </main>
  );
}
