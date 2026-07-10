import styles from "../dashboard.module.css";

export default function ProgramsPage() {
  return (
    <>
      <header className={styles.topbar}><div><h1>Programet</h1><p>Planet e rehabilitimit menaxhohen këtu, jo në një faqe të mbushur.</p></div></header>
      <div className={styles.card}><span>Moduli i programeve</span><strong>Strukturë e ndarë</strong><p>Këtu do të vendosen draftet, aprovimet dhe programet aktive.</p></div>
    </>
  );
}
