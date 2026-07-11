import type { Metadata } from "next";
import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
    languages: {
      sq: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    url: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

const workflow = [
  ["01", "Krijo planin", "Zgjidh pacientin, ushtrimet, setet, përsëritjet dhe udhëzimet."],
  ["02", "Dërgo kodin ose QR", "Pacienti hyn në telefon pa krijuar llogari dhe sheh vetëm planin e vet."],
  ["03", "Përcill progresin", "Shiko ushtrimet e kryera, dhimbjen, komentet dhe sinjalet e sigurisë."],
];

export default function HomePage() {
  return (
    <main className="page landing-page">
      <nav className="top-nav landing-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="#how">Si funksionon</a>
          <a href="#patient">Për pacientin</a>
          <a href="#physio">Për fizioterapeutin</a>
          <a href="#pricing">Çmimi</a>
          <Link href="/blog">Blog</Link>
          <AuthControls />
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="badge">Platformë për fizioterapeutë dhe pacientë</span>
          <h1>Pacientët i harrojnë ushtrimet?<span>Jepua planin direkt në telefon.</span></h1>
          <p>
            Pacienti e sheh qartë çka duhet të bëjë sot. Ti përcjell ushtrimet e kryera,
            dhimbjen, progresin dhe sigurinë — pa letra dhe pa konfuzion.
          </p>
          <div className="portal-actions">
            <Link className="button" href="/physiotherapist-portal">Fillo si fizioterapeut</Link>
            <a className="button secondary" href="#how">Shiko si funksionon</a>
          </div>
          <Link className="landing-sub-action" href="/patient-portal">Je pacient? Hyr me kod →</Link>
          <div className="landing-proof">
            <div><strong>1 kod</strong><span>për çdo pacient</span></div>
            <div><strong>3 hapa</strong><span>krijo, dërgo, përcill</span></div>
            <div><strong>9.90€</strong><span>çmim për përdoruesit e parë</span></div>
          </div>
        </div>

        <div className="landing-showcase" aria-label="Pamje e Fizioterapia Ime">
          <div className="showcase-glow" />
          <div className="floating-proof one">Ushtrimi u krye ✓<small>Progresi u përditësua</small></div>
          <div className="floating-proof two">Dhimbja 3/10<small>Brenda kufirit të sigurisë</small></div>
          <div className="showcase-phone">
            <div className="phone-notch" />
            <div className="phone-top"><span>Fizioterapia Ime</span><small>Dita 3 nga 14</small></div>
            <div className="phone-progress"><i style={{ width: "42%" }} /></div>
            <div className="phone-task"><b>Glute bridge</b><span>3 × 12 përsëritje</span><em>Shiko ushtrimin</em></div>
            <div className="phone-task"><b>Cat cow</b><span>2 × 10 përsëritje</span><em>Shiko ushtrimin</em></div>
            <div className="phone-task done"><b>Ecje e kontrolluar</b><span>10 minuta</span><em>Kryer ✓</em></div>
          </div>
        </div>
      </section>

      <section id="how" className="landing-section">
        <div className="section-heading"><span>Si funksionon</span><h2>Një workflow i qartë nga plani te progresi.</h2></div>
        <div className="workflow-grid">
          {workflow.map(([number, title, text]) => (
            <article key={number} className="workflow-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section id="patient" className="landing-split">
        <div><span className="badge">Për pacientin</span><h2>Plani gjithmonë në telefon.</h2><p>Pacienti hyn me kod, sheh ushtrimet, raporton dhimbjen dhe ruan progresin pa krijuar llogari.</p></div>
        <Link className="button secondary" href="/per-pacientin">Shiko përvojën e pacientit</Link>
      </section>

      <section id="physio" className="landing-split reverse">
        <div><span className="badge">Për fizioterapeutin</span><h2>Më pak administrim. Më shumë kontroll klinik.</h2><p>Krijo plane, përcill adherence, identifiko alarmet dhe gjenero raporte profesionale.</p></div>
        <Link className="button secondary" href="/per-fizioterapeutin">Shiko portalin profesional</Link>
      </section>

      <section id="pricing" className="landing-section landing-pricing">
        <div className="section-heading"><span>Çmimi</span><h2>Fillo thjeshtë dhe rritu me klinikën.</h2></div>
        <Link className="button" href="/cmimi">Shiko planet</Link>
      </section>
    </main>
  );
}
