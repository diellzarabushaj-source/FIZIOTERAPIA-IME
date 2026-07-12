import styles from "./physio.module.css";
import { UiIcon } from "@/components/UiIcon";

export const metadata = {
  title: "Për fizioterapeutin | Fizioterapia Ime",
  description: "Menaxho pacientët, planet e ushtrimeve dhe progresin në një vend të thjeshtë.",
  alternates: { canonical: "/per-fizioterapeutin" },
};

const problems = [
  ["smartphone", "Video të humbura në WhatsApp"],
  ["document", "Fletë që pacienti nuk i gjen"],
  ["phone", "Pyetje të njëjta gjatë gjithë ditës"],
  ["help", "Nuk e di nëse ushtrimet janë bërë"],
] as const;

const benefits = [
  ["clock", "Kursen kohë", "Krijon planin një herë dhe pacienti e ka gjithmonë në telefon."],
  ["progress", "Sheh progresin", "Shikon ushtrimet e kryera, dhimbjen dhe komentet e pacientit."],
  ["library", "Zgjedh ushtrimet", "Përdor bankën e ushtrimeve ose shto ushtrimet e tua."],
  ["sparkles", "Merr sugjerime", "AI të ndihmon me ide. Vendimin e merr gjithmonë ti."],
  ["document", "Krijon raporte", "Përgatit një përmbledhje të qartë për rikontroll ose dokumentim."],
  ["lock", "Mban kontrollin", "Pacienti sheh vetëm planin që ti ke miratuar."],
] as const;

const faq = [
  ["A mund të shtoj ushtrimet e mia?", "Po. Mund të shtosh emrin, udhëzimin, dozën dhe videon tënde."],
  ["A mund ta ndryshoj planin?", "Po. Mund të shtosh, largosh ose ndryshosh ushtrime kur të duhet."],
  ["A punon në telefon?", "Po. Fizioterapeuti dhe pacienti mund ta përdorin nga telefoni, tableti ose kompjuteri."],
  ["A e krijon AI planin vetë?", "Jo. AI vetëm sugjeron. Plani dërgohet vetëm pasi fizioterapeuti e kontrollon dhe e aprovon."],
  ["A ka kontratë afatgjatë?", "Jo. Çmimi për përdoruesit e parë është 9.90 € në muaj."],
];

export default function PhysioPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>Për fizioterapeutin</span>
          <h1>Më pak administratë. Më shumë kohë me pacientin.</h1>
          <p>
            Shto pacientin, krijo planin dhe shiko progresin në një vend. Pa video të humbura dhe pa letra të shpërndara.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="/physiotherapist-portal">Fillo me 9.90 €</a>
            <a className={styles.secondary} href="/clinic-use">Shiko si përdoret</a>
          </div>
          <div className={styles.quickFacts}>
            <span className="public-fact">Pa kontratë afatgjatë</span>
            <span className="public-fact">Punon në telefon</span>
            <span className="public-fact">Ti aprovon çdo plan</span>
          </div>
        </div>

        <div className={styles.dashboard} aria-label="Pamje e dashboard-it të fizioterapeutit">
          <div className={styles.windowTop}><i /><i /><i /></div>
          <div className={styles.dashboardHead}>
            <div><small>Sot</small><strong>Mirë se erdhe, Altin</strong></div>
            <span>+ Shto pacient</span>
          </div>
          <div className={styles.kpis}>
            <div><strong>18</strong><small>Pacientë aktivë</small></div>
            <div><strong>84%</strong><small>Ushtrime të kryera</small></div>
            <div><strong>2</strong><small>Kërkojnë vëmendje</small></div>
          </div>
          <div className={styles.patientRow}><span>Arta Gashi<small>Dhimbje mesi</small></span><b>3/4 sot</b></div>
          <div className={styles.patientRow}><span>Leon Berisha<small>Pas operacionit të gjurit</small></span><b className={styles.alert}>Dhimbje 8/10</b></div>
          <div className={styles.patientRow}><span>Era Kelmendi<small>Shpatull</small></span><b>Plan i ri</b></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}>
          <span>Të ndodh shpesh?</span>
          <h2>Probleme të vogla që marrin shumë kohë.</h2>
        </div>
        <div className={styles.problemGrid}>
          {problems.map(([icon, text]) => <article key={text}><UiIcon name={icon} /><h3>{text}</h3></article>)}
        </div>
      </section>

      <section className={`${styles.section} ${styles.soft}`}>
        <div className={styles.heading}>
          <span>Gjithçka në një vend</span>
          <h2>Ti krijon terapinë. Platforma ta lehtëson punën.</h2>
        </div>
        <div className={styles.flow}>
          {["Shto pacientin", "Zgjidh ushtrimet", "Dërgo planin", "Pacienti ushtron", "Shiko progresin"].map((item, index) => (
            <div key={item}><b>{index + 1}</b><span>{item}</span></div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}>
          <span>Çfarë fiton?</span>
          <h2>Mjetet kryesore për punën e përditshme.</h2>
        </div>
        <div className={styles.benefitGrid}>
          {benefits.map(([icon, title, text]) => (
            <article key={title}><UiIcon name={icon} /><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className={styles.aiSection}>
        <div>
          <span className={styles.badge}>AI me kontroll njerëzor</span>
          <h2>AI ndihmon. Fizioterapeuti vendos.</h2>
          <p>AI mund të sugjerojë ushtrime ose të tregojë çka mungon. Nuk e ndryshon planin dhe nuk ia dërgon pacientit pa aprovimin tënd.</p>
        </div>
        <div className={styles.aiFlow}>
          <div><b>1</b><span>AI sugjeron</span></div>
          <div><b>2</b><span>Ti kontrollon</span></div>
          <div><b>3</b><span>Ti aprovon</span></div>
          <div><b>4</b><span>Pacienti e merr</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}>
          <span>Për kë është?</span>
          <h2>Përshtatet me mënyrën si punon ti.</h2>
        </div>
        <div className={styles.useGrid}>
          <article><UiIcon name="building" /><h3>Klinikë</h3><p>Për ekip me disa fizioterapeutë.</p></article>
          <article><UiIcon name="physio" /><h3>Ordinancë private</h3><p>Për punë të organizuar me pacientët e tu.</p></article>
          <article><UiIcon name="activity" /><h3>Fizioterapi sportive</h3><p>Për programe dhe kthim në aktivitet.</p></article>
          <article><UiIcon name="home" /><h3>Vizita në shtëpi</h3><p>Për plan të qartë edhe pas vizitës.</p></article>
        </div>
      </section>

      <section className={styles.pricing}>
        <div><span>Çmim për përdoruesit e parë</span><h2>9.90 € <small>/ muaj</small></h2><p>Menaxhim pacientësh, plane ushtrimesh, progres dhe raporte.</p></div>
        <a href="/physiotherapist-portal">Krijo llogarinë</a>
      </section>

      <section className={styles.section}>
        <div className={styles.heading}><span>Pyetje të shpeshta</span><h2>Përgjigje të shkurtra.</h2></div>
        <div className={styles.faq}>
          {faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
        </div>
      </section>

      <section className={styles.finalCta}>
        <span>Gati për ta provuar?</span>
        <h2>Shto pacientin tënd të parë.</h2>
        <p>Fillo me çmimin 9.90 € në muaj dhe shiko si përshtatet me punën tënde.</p>
        <a href="/physiotherapist-portal">Fillo tani</a>
      </section>
    </main>
  );
}
