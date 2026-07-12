import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  PlayCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserRoundPlus,
  UsersRound,
  Video,
} from "@/components/LucideIcons";
import { BrandMark } from "@/components/BrandMark";
import styles from "./home.module.css";

const workflow = [
  {
    icon: UserRoundPlus,
    step: "01",
    title: "Shto pacientin dhe planin",
    text: "Zgjidh ushtrimet, setet, përsëritjet, ditët dhe udhëzimet që i duhen pacientit.",
  },
  {
    icon: QrCode,
    step: "02",
    title: "Dërgo kodin ose QR-në",
    text: "Pacienti e hap planin në telefon, pa krijuar llogari dhe pa mbajtur mend fjalëkalim.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Përcill progresin",
    text: "Shih ushtrimet e kryera, dhimbjen e raportuar dhe komentet para kontrollit të radhës.",
  },
];

const physioFeatures = [
  {
    icon: UsersRound,
    title: "Pacientët në një vend",
    text: "Kartela, plani, kodi dhe historia e secilit pacient janë të organizuara në një panel.",
  },
  {
    icon: ClipboardList,
    title: "Plane të qarta",
    text: "Përcakto ushtrimin, dozën, ditët, videon dhe udhëzimin pa dërguar materiale veç e veç.",
  },
  {
    icon: BarChart3,
    title: "Progres i dukshëm",
    text: "Shih sa rregullisht kryhen ushtrimet, dhimbjen dhe komentet që lë pacienti.",
  },
  {
    icon: FileText,
    title: "Raporte në pak hapa",
    text: "Përgatit një përmbledhje të planit dhe progresit për printim ose PDF.",
  },
];

const faqs = [
  {
    question: "A duhet pacienti të krijojë llogari?",
    answer: "Jo. Pacienti hyn me kodin personal ose skanon QR-në. Nuk krijon llogari dhe nuk përdor fjalëkalim.",
  },
  {
    question: "Kush e krijon dhe e ndryshon planin?",
    answer: "Vetëm fizioterapeuti. Pacienti mund ta ndjekë planin dhe të raportojë progresin, por nuk mund ta ndryshojë terapinë.",
  },
  {
    question: "A mund t’i shtoj ushtrimet dhe videot e mia?",
    answer: "Po. Mund të përdorësh bankën e ushtrimeve ose të shtosh ushtrimet, udhëzimet dhe videot e tua.",
  },
  {
    question: "A e zëvendëson AI fizioterapeutin?",
    answer: "Jo. AI jep vetëm sugjerime ose informacion për cilësinë e lëvizjes. Nuk diagnostikon dhe nuk cakton trajtim.",
  },
];

export default function HomePage() {
  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <span aria-hidden="true" />
            Platformë për fizioterapeutë
          </span>
          <h1>
            Krijo planin. <span>Dërgoja pacientit.</span> Përcill progresin.
          </h1>
          <p className={styles.heroLead}>
            Plani i ushtrimeve, kodi ose QR-ja, ushtrimet e kryera, dhimbja dhe komentet —
            të gjitha në një panel. Pacienti hyn pa krijuar llogari.
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/physiotherapist-portal">
              Fillo për 9.90 € / muaj
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a className={styles.secondaryAction} href="#si-funksionon">
              Shiko si funksionon
            </a>
          </div>

          <Link className={styles.patientLink} href="/patient-portal">
            Je pacient? Hyr me kod
            <ArrowRight size={15} aria-hidden="true" />
          </Link>

          <div className={styles.heroFacts} aria-label="Pikat kryesore">
            <span><Check size={16} aria-hidden="true" /> Pa llogari për pacientin</span>
            <span><Check size={16} aria-hidden="true" /> Punon në telefon dhe kompjuter</span>
            <span><Check size={16} aria-hidden="true" /> Ti aprovon çdo plan</span>
          </div>
        </div>

        <figure className={styles.heroVisual} aria-label="Pamje e panelit të fizioterapeutit dhe planit të pacientit">
          <div className={styles.dashboardShot} aria-hidden="true">
            <div className={styles.windowBar}>
              <span /><span /><span />
              <small>app.fizioterapia-ime.com</small>
            </div>
            <div className={styles.dashboardLayout}>
              <aside className={styles.previewSidebar}>
                <Image src="/fizioterapia-ime-icon.svg" alt="" width={30} height={30} />
                <i className={styles.activeNav}><BarChart3 size={15} /></i>
                <i><UsersRound size={15} /></i>
                <i><ClipboardList size={15} /></i>
                <i><FileText size={15} /></i>
              </aside>
              <div className={styles.dashboardContent}>
                <div className={styles.previewTopline}>
                  <div>
                    <small>E hënë, 11 korrik</small>
                    <strong>Mirë se erdhe, Arta</strong>
                  </div>
                  <span>+ Shto pacient</span>
                </div>

                <div className={styles.previewStats}>
                  <article><UsersRound size={15} /><small>Pacientë aktivë</small><strong>18</strong></article>
                  <article><CheckCircle2 size={15} /><small>Kryer sot</small><strong>84%</strong></article>
                  <article className={styles.attentionStat}><AlertTriangle size={15} /><small>Kërkojnë vëmendje</small><strong>2</strong></article>
                </div>

                <div className={styles.previewPanel}>
                  <div className={styles.previewPanelHead}>
                    <strong>Pacientët e sotëm</strong>
                    <span>Shiko të gjithë</span>
                  </div>
                  <div className={styles.patientRow}>
                    <b>AG</b><span>Arta Gashi<small>Dhimbje mesi</small></span><em className={styles.goodStatus}>3/4 kryer</em>
                  </div>
                  <div className={styles.patientRow}>
                    <b>LB</b><span>Leon Berisha<small>Pas operacionit të gjurit</small></span><em className={styles.alertStatus}>Dhimbje 8/10</em>
                  </div>
                  <div className={styles.patientRow}>
                    <b>EK</b><span>Era Kelmendi<small>Rehabilitim i shpatullës</small></span><em>Plan i ri</em>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.phoneShot} aria-hidden="true">
            <div className={styles.phoneTop}><span>9:41</span><i /></div>
            <div className={styles.phoneBrand}>
              <Image src="/fizioterapia-ime-icon.svg" alt="" width={28} height={28} />
              <span>Sot</span>
            </div>
            <small>Mirë se erdhe, Arta</small>
            <h2>3 ushtrime sot</h2>
            <div className={styles.phoneProgress}><span /></div>
            <div className={styles.exerciseCard}>
              <div className={styles.exerciseMedia}><PlayCircle size={22} /></div>
              <div><strong>Glute bridge</strong><small>3 sete × 12 përsëritje</small></div>
            </div>
            <div className={styles.exerciseCard}>
              <div className={styles.exerciseDone}><Check size={19} /></div>
              <div><strong>Cat cow</strong><small>2 sete × 10 · E kryer</small></div>
            </div>
            <span className={styles.phoneAction}>Fillo ushtrimin</span>
          </div>

          <div className={styles.progressToast} aria-hidden="true">
            <CheckCircle2 size={20} />
            <span><strong>Progresi u përditësua</strong><small>Fizioterapeuti e sheh menjëherë</small></span>
          </div>
        </figure>
      </section>

      <section className={styles.clarityStrip} aria-label="Si ndahet përgjegjësia">
        <article><ClipboardCheck size={22} /><span><strong>Fizioterapeuti</strong> krijon dhe aprovon planin</span></article>
        <article><Smartphone size={22} /><span><strong>Pacienti</strong> e ndjek planin në telefon</span></article>
        <article><ShieldCheck size={22} /><span><strong>Platforma</strong> e bën progresin të dukshëm</span></article>
      </section>

      <section className={styles.section} id="si-funksionon">
        <div className={styles.sectionHeading}>
          <span>Si funksionon</span>
          <h2>Nga vizita te progresi, në tre hapa.</h2>
          <p>Procesi është i thjeshtë për fizioterapeutin dhe i qartë për pacientin.</p>
        </div>
        <div className={styles.workflowGrid}>
          {workflow.map((item) => {
            const Icon = item.icon;
            return (
              <article className={styles.workflowCard} key={item.step}>
                <div className={styles.workflowIcon}><Icon size={22} /></div>
                <span className={styles.stepNumber}>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles.physioSection}`}>
        <div className={styles.sectionHeading}>
          <span>Për fizioterapeutin</span>
          <h2>Më pak administratë. Më shumë kontroll klinik.</h2>
          <p>Gjërat që përdor çdo ditë janë bashkë, pa fletë të humbura dhe pa video të shpërndara në biseda.</p>
        </div>

        <div className={styles.featureGrid}>
          {physioFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <article className={styles.featureCard} key={item.title}>
                <div><Icon size={21} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles.patientSection}`}>
        <div className={styles.patientPreview} aria-hidden="true">
          <div className={styles.patientPreviewTop}>
            <span>Plani i sotëm</span>
            <strong>2 nga 3 kryer</strong>
          </div>
          <div className={styles.patientPreviewProgress}><span /></div>
          <article>
            <Video size={20} />
            <div><strong>Glute bridge</strong><small>3 sete × 12 · Shiko videon</small></div>
            <span>Fillo</span>
          </article>
          <article>
            <CheckCircle2 size={20} />
            <div><strong>Cat cow</strong><small>2 sete × 10 përsëritje</small></div>
            <span className={styles.doneLabel}>E kryer</span>
          </article>
          <div className={styles.painCheck}>
            <span>Dhimbja pas ushtrimit</span>
            <div>{[0, 1, 2, 3, 4].map((score) => <i className={score === 3 ? styles.selectedPain : undefined} key={score}>{score}</i>)}</div>
          </div>
        </div>

        <div className={styles.patientCopy}>
          <span className={styles.sectionLabel}>Për pacientin</span>
          <h2>Pacienti sheh vetëm atë që i duhet sot.</h2>
          <p>Asnjë menu e ndërlikuar. Ai hap planin, sheh videon dhe dozën, kryen ushtrimin dhe shënon dhimbjen.</p>
          <ul>
            <li><Check size={17} /> Hyn me kod personal ose QR</li>
            <li><Check size={17} /> Nuk krijon llogari</li>
            <li><Check size={17} /> Sheh videon, setet dhe përsëritjet</li>
            <li><Check size={17} /> Raporton kryerjen dhe dhimbjen</li>
          </ul>
          <Link href="/per-pacientin">Shiko përvojën e pacientit <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.safetySection}`}>
        <div className={styles.safetyIcon}><ShieldCheck size={28} /></div>
        <div className={styles.safetyCopy}>
          <span>Siguria klinike</span>
          <h2>AI ndihmon. Fizioterapeuti vendos.</h2>
          <p>AI nuk diagnostikon, nuk përshkruan trajtim dhe nuk e ndryshon planin vetë. Kontrolli me kamerë është opsional dhe videoja nuk ruhet.</p>
        </div>
        <div className={styles.painRule}>
          <strong>7/10</strong>
          <span>Ndalo ushtrimin dhe kontakto fizioterapeutin</span>
        </div>
      </section>

      <section className={`${styles.section} ${styles.pricingSection}`} id="cmimi">
        <div className={styles.pricingCopy}>
          <span className={styles.sectionLabel}>Çmim i thjeshtë</span>
          <h2>Një plan. Të gjitha mjetet kryesore.</h2>
          <p>Abonim mujor për fizioterapeutin. Pacienti hyn në planin e vet pa pagesë veçmas.</p>
          <div className={styles.pricingNote}><ShieldCheck size={18} /> Pagesa bëhet manualisht me transfer bankar në MVP.</div>
        </div>

        <article className={styles.priceCard}>
          <span>Për fizioterapeutin</span>
          <div><strong>9.90 €</strong><small>/ muaj</small></div>
          <ul>
            <li><Check size={16} /> Menaxhim pacientësh</li>
            <li><Check size={16} /> Plane dhe bankë ushtrimesh</li>
            <li><Check size={16} /> Kod dhe QR për pacientin</li>
            <li><Check size={16} /> Progres, dhimbje dhe raporte</li>
          </ul>
          <Link href="/physiotherapist-portal">Fillo tani <ArrowRight size={17} /></Link>
        </article>
      </section>

      <section className={`${styles.section} ${styles.faqSection}`}>
        <div className={styles.sectionHeading}>
          <span>Pyetje të shpeshta</span>
          <h2>Përgjigje të shkurtra para se të fillosh.</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<span>+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <BrandMark compact />
        <span>Lëviz më mirë, jeto më mirë</span>
        <h2>Jep pacientit një plan të qartë. Përcille progresin në një vend.</h2>
        <p>Krijo qasjen e fizioterapeutit dhe shto pacientin e parë.</p>
        <div>
          <Link className={styles.primaryAction} href="/physiotherapist-portal">Fillo si fizioterapeut <ArrowRight size={18} /></Link>
          <a className={styles.darkSecondaryAction} href="#si-funksionon">Shiko tre hapat</a>
        </div>
      </section>
    </main>
  );
}
