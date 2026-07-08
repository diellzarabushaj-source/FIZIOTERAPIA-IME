import { BrandMark } from "@/components/BrandMark";

const onboardingSteps = [
  {
    title: "1. Aktivizo fizioterapeutin",
    text: "Admini kontrollon pagesën 29.90 EUR/muaj dhe aktivizon qasjen te Admin Billing.",
  },
  {
    title: "2. Krijo pacientin",
    text: "Fizioterapeuti shton pacientin dhe sistemi gjeneron username + kod personal.",
  },
  {
    title: "3. Cakto planin",
    text: "Zgjidhen ushtrimet, setet, përsëritjet, frekuenca dhe kohëzgjatja e planit.",
  },
  {
    title: "4. Pacienti ndjek app-in",
    text: "Pacienti hyn me kod, shikon planin, kryen ushtrimet dhe raporton dhimbjen 0–10.",
  },
  {
    title: "5. Monitoro dhe ndërhy",
    text: "Fizioterapeuti shikon adherence, pain logs, AI score dhe dërgon udhëzime kur duhet.",
  },
  {
    title: "6. Gjenero raport",
    text: "Raporti PDF përdoret për rikontroll, dokumentim klinik ose komunikim me pacientin.",
  },
];

const safetyRules = [
  "AI Movement Check nuk diagnostikon dhe nuk zëvendëson fizioterapeutin.",
  "Në dhimbje 7/10 ose më shumë, pacienti ndalon ushtrimin dhe kontakton fizioterapeutin.",
  "Në simptoma neurologjike, dobësi progresive, mpirje ose përkeqësim, pacienti udhëzohet për kontroll mjekësor.",
  "Në MVP nuk ruhet video nga kamera; ruhet vetëm score, feedback dhe alert type.",
];

export default function ClinicUsePage() {
  return (
    <main className="page launch-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/">Home</a>
          <a href="/support">Support</a>
          <a href="/launch-checklist">Launch checklist</a>
          <a href="/physiotherapist-portal">Physio Portal</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Clinic use guide</span>
          <h1>Workflow i klinikës për përdorim real.</h1>
          <p>
            Udhëzues praktik për fizioterapeutë dhe adminë: prej aktivizimit të pagesës deri te plani, monitorimi dhe raporti final.
          </p>
        </div>
        <div className="launch-status-card">
          <span className="mini-badge">MVP rule</span>
          <strong>29.90 EUR / muaj</strong>
          <p>Qasja e fizioterapeutit aktivizohet manualisht nga admini pas pagesës.</p>
        </div>
      </section>

      <section className="launch-grid">
        {onboardingSteps.map((step) => (
          <article className="launch-card" key={step.title}>
            <span className="launch-number">{step.title.split(".")[0]}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>

      <section className="launch-panel">
        <div>
          <span className="mini-badge">Clinical safety</span>
          <h2>Rregullat që nuk duhet të ndryshohen.</h2>
          <p>
            Platforma është ndihmë digjitale për planin e fizioterapisë, jo sistem diagnostikues. Vendimi klinik mbetet te fizioterapeuti dhe mjeku kur duhet.
          </p>
        </div>
        <ul className="support-list">
          {safetyRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="launch-panel soft">
        <div>
          <span className="mini-badge">Daily routine</span>
          <h2>Ritmi i rekomanduar ditor</h2>
        </div>
        <div className="launch-mini-grid">
          <article>
            <strong>Pacienti</strong>
            <p>Hyn në app, sheh ushtrimet e ditës, shënon dhimbjen dhe përdor AI check kur lejohet.</p>
          </article>
          <article>
            <strong>Fizioterapeuti</strong>
            <p>Kontrollon pacientët me alerts, adherence të ulët ose dhimbje të lartë.</p>
          </article>
          <article>
            <strong>Admini</strong>
            <p>Kontrollon abonimet, aktivizon pagesat mujore dhe monitoron përdorimin e platformës.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
