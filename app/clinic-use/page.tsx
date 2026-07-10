import styles from "./clinic-use.module.css";

export const metadata = {
  title: "Si funksionon në klinikë | Fizioterapia Ime",
  description: "Shiko si krijohet plani, si i dërgohet pacientit dhe si përcillet progresi në Fizioterapia Ime.",
  alternates: { canonical: "/clinic-use" },
};

const steps = [
  { icon: "👤", title: "Shto pacientin", text: "Shkruaj emrin dhe problemin kryesor. Mbarove." },
  { icon: "📚", title: "Zgjidh ushtrimet", text: "Përdor bankën e ushtrimeve ose shiko sugjerimet e AI." },
  { icon: "📲", title: "Dërgo planin", text: "Pacienti merr kodin, QR ose linkun e vet." },
  { icon: "🏃", title: "Pacienti ushtron", text: "Shikon videon, bën ushtrimin dhe shënon dhimbjen." },
  { icon: "📈", title: "Shiko progresin", text: "Ti sheh çfarë ka bërë dhe kur duhet ta ndryshosh planin." },
];

const faqs = [
  ["A duhet pacienti të krijojë llogari?", "Jo. Pacienti mund të hyjë me kodin personal ose QR që ia jep fizioterapeuti."],
  ["A mund t’i zgjedh vetë ushtrimet?", "Po. Mund të zgjedhësh nga databaza, të përdorësh sugjerimet e AI ose të shtosh ushtrimin tënd."],
  ["A e vendos AI planin?", "Jo. AI vetëm sugjeron. Fizioterapeuti e kontrollon, e ndryshon dhe e aprovon planin."],
  ["A mund ta përdor nga telefoni?", "Po. Fizioterapeuti dhe pacienti mund ta përdorin nga telefoni, tableti ose kompjuteri."],
  ["Çfarë ndodh nëse pacienti ka dhimbje të fortë?", "Nëse dhimbja është 7/10 ose më shumë, pacienti udhëzohet të ndalet dhe fizioterapeuti njoftohet."],
  ["A ka kontratë afatgjatë?", "Jo. Çmimi fillestar është 9.90 € në muaj për përdoruesit e parë."],
];

export default function ClinicUsePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Si përdoret në klinikë</span>
          <h1>Nga pacienti i parë deri te ushtrimet në shtëpi.</h1>
          <p>
            Krijo planin, dërgoja pacientit dhe shiko progresin e tij. Gjithçka në një vend, pa letra dhe pa video të humbura në WhatsApp.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="/physiotherapist-portal">Fillo tani</a>
            <a className={styles.secondary} href="#hapat">Shiko 5 hapat</a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Pamje e planit të pacientit">
          <div className={`${styles.floatCard} ${styles.floatOne}`}>Plani u dërgua ✓<small>Kodi dhe QR janë gati</small></div>
          <div className={styles.phone}>
            <div className={styles.phoneTop} />
            <small>Sot</small>
            <h3>Ke 3 ushtrime</h3>
            <div className={styles.progress}><span /></div>
            <div className={styles.exerciseRow}><div><b>Glute bridge</b><small>3 sete × 12</small></div><span>Fillo</span></div>
            <div className={styles.exerciseRow}><div><b>Cat cow</b><small>2 sete × 10</small></div><span>U krye</span></div>
            <div className={styles.exerciseRow}><div><b>Dhimbja</b><small>Pas ushtrimit</small></div><span>3/10</span></div>
          </div>
          <div className={`${styles.floatCard} ${styles.floatTwo}`}>Progresi u përditësua<small>Fizioterapeuti e sheh menjëherë</small></div>
        </div>
      </section>

      <section className={styles.section} id="hapat">
        <div className={styles.sectionHead}>
          <span>Vetëm 5 hapa</span>
          <h2>E thjeshtë për klinikën. E qartë për pacientin.</h2>
          <p>Nuk ke nevojë të jesh i mirë me teknologji. Çdo hap është i shkurtër dhe i kuptueshëm.</p>
        </div>
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <article className={styles.step} key={step.title}>
              <span className={styles.stepNum}>{index + 1}</span>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.split}>
          <article className={styles.panel}>
            <h3>Çfarë bën fizioterapeuti?</h3>
            <div className={styles.list}>
              <div><i>👤</i><span><b>Shton pacientin</b><small>Emri, diagnoza dhe shënimet kryesore.</small></span></div>
              <div><i>📚</i><span><b>Zgjedh ushtrimet</b><small>Sete, përsëritje, ditë dhe udhëzime.</small></span></div>
              <div><i>✅</i><span><b>Kontrollon dhe aprovon</b><small>Asnjë plan nuk dërgohet pa miratimin e tij.</small></span></div>
              <div><i>📈</i><span><b>Sheh progresin</b><small>Ushtrimet e kryera, dhimbjen dhe komentet.</small></span></div>
            </div>
          </article>

          <article className={styles.panel}>
            <h3>Çfarë sheh pacienti?</h3>
            <div className={styles.list}>
              <div><i>🎥</i><span><b>Videon e ushtrimit</b><small>Udhëzim i qartë, pa kërkuar mesazhe të vjetra.</small></span></div>
              <div><i>🔢</i><span><b>Sa duhet të bëjë</b><small>Sete, përsëritje dhe kohën e pushimit.</small></span></div>
              <div><i>❤️</i><span><b>Dhimbjen 0–10</b><small>Pacienti tregon si u ndje pas ushtrimit.</small></span></div>
              <div><i>📅</i><span><b>Progresin e vet</b><small>Ditët e kryera dhe planin e përditësuar.</small></span></div>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.ai}>
          <div>
            <span className={styles.eyebrow}>AI me kontroll njerëzor</span>
            <h2>AI ndihmon. Fizioterapeuti vendos.</h2>
            <p>AI mund të sugjerojë ushtrime, por nuk krijon dhe nuk dërgon planin vetë. Vendimi final mbetet gjithmonë te fizioterapeuti.</p>
          </div>
          <div className={styles.aiFlow}>
            <div><span>🤖</span><strong>AI sugjeron</strong></div>
            <div><span>👨‍⚕️</span><strong>Fizioterapeuti kontrollon</strong></div>
            <div><span>🧑</span><strong>Pacienti ndjek planin</strong></div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>Pse jo vetëm WhatsApp?</span>
          <h2>Gjithçka që duhet, në një vend.</h2>
        </div>
        <div className={styles.compare}>
          <div className={styles.compareCol}>
            <h3>Me WhatsApp</h3>
            <ul>
              <li>✕ Videot humbin mes mesazheve.</li>
              <li>✕ Nuk dihet a janë bërë ushtrimet.</li>
              <li>✕ Pacienti harron dozimin.</li>
              <li>✕ Nuk ka progres të qartë.</li>
              <li>✕ Raporti duhet bërë veçmas.</li>
            </ul>
          </div>
          <div className={styles.compareCol}>
            <h3>Me Fizioterapia Ime</h3>
            <ul>
              <li>✓ Çdo ushtrim ka videon dhe udhëzimin.</li>
              <li>✓ Sheh kur pacienti e përfundon.</li>
              <li>✓ Setet dhe përsëritjet janë të qarta.</li>
              <li>✓ Dhimbja dhe progresi ruhen.</li>
              <li>✓ Plani dhe raporti janë në një vend.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>Çmimi për përdoruesit e parë</span>
          <h2>Fillo pa rrezik dhe pa kontratë afatgjatë.</h2>
        </div>
        <div className={styles.priceWrap}>
          <span>Founding price</span>
          <strong>9.90 €</strong>
          <p>në muaj · për përdoruesit e parë</p>
          <p>Pacientë, plane, kod/QR, progres dhe raporte në një vend.</p>
          <a className={styles.primary} href="/physiotherapist-portal">Krijo llogarinë</a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>Pyetje të shpeshta</span>
          <h2>Përgjigje të shkurtra dhe të qarta.</h2>
        </div>
        <div className={styles.faq}>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Gati për pacientin tënd të parë?</h2>
        <p>Krijo planin, dërgo kodin dhe shiko progresin në një vend.</p>
        <a className={styles.primary} href="/physiotherapist-portal">Fillo tani</a>
      </section>
    </main>
  );
}
