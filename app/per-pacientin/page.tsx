import type { Metadata } from "next";
import { CTASection, FAQList, FeatureCard, PageSection, SafetyNotice, StepCard } from "@/components/PublicPageKit";

export const metadata: Metadata = {
  title: "Për pacientin | Fizioterapia Ime",
  description: "Shiko ushtrimet, videot, kujtesat dhe përparimin tënd në një vend të vetëm.",
  alternates: { canonical: "/per-pacientin" },
};

const steps = [
  { number: "01", icon: "📩", title: "Merr kodin", text: "Fizioterapeuti ta dërgon kodin ose QR-në." },
  { number: "02", icon: "📱", title: "Hyr në plan", text: "Nuk ke nevojë të mësosh një program të vështirë." },
  { number: "03", icon: "🎥", title: "Shiko videon", text: "E sheh saktë si bëhet ushtrimi dhe sa herë duhet." },
  { number: "04", icon: "✅", title: "Shëno që e bëre", text: "Pastaj vazhdon me ushtrimin tjetër." },
];

const features = [
  { icon: "🎥", title: "Video të qarta", text: "Shiko ushtrimin sa herë që të duhet." },
  { icon: "📅", title: "Kalendari yt", text: "E sheh cilat ditë i ke bërë ushtrimet." },
  { icon: "📈", title: "Përparimi", text: "Shiko sa ushtrime ke kryer dhe si po ecën." },
  { icon: "💬", title: "Mesazhe", text: "Dërgo pyetje ose koment te fizioterapeuti." },
  { icon: "⏰", title: "Kujtesa", text: "Merr njoftim kur është koha për ushtrimet." },
  { icon: "❤️", title: "Dhimbja", text: "Shëno si je ndier pas ushtrimit." },
];

const faqs = [
  { question: "A duhet të krijoj llogari?", answer: "Jo domosdoshmërisht. Mund të hysh me kodin që ta jep fizioterapeuti." },
  { question: "A mund ta përdor nga telefoni?", answer: "Po. Faqja është ndërtuar që të përdoret lehtë nga telefoni." },
  { question: "Çfarë ndodh nëse kam dhimbje?", answer: "Shëno dhimbjen. Nëse është 7/10 ose më shumë, ndalo ushtrimin dhe kontakto fizioterapeutin." },
  { question: "A mund t’i shoh ushtrimet e vjetra?", answer: "Po. Mund ta shohësh historinë dhe përparimin tënd." },
  { question: "A e ndryshon aplikacioni planin vetë?", answer: "Jo. Planin e ndryshon vetëm fizioterapeuti yt." },
];

export default function PatientPublicPage() {
  return (
    <main className="pp-page">
      <section className="pp-hero">
        <div className="pp-hero-copy pp-reveal">
          <span className="pp-eyebrow">Për pacientin</span>
          <h1>Ushtrimet e tua.<span>Gjithmonë me vete.</span></h1>
          <p>Shiko videon, bëji ushtrimet dhe shëno si je ndier. Fizioterapeuti yt e sheh përparimin dhe të ndihmon kur duhet.</p>
          <div className="pp-actions">
            <a className="pp-primary" href="/patient-portal">Hyr me kodin tënd</a>
            <a className="pp-secondary" href="#si-funksionon">Shiko si funksionon</a>
          </div>
          <div className="pp-hero-note"><span>✓ Pa fjalë të vështira</span><span>✓ Punon në telefon</span><span>✓ Fizioterapeuti ka kontrollin</span></div>
        </div>

        <div className="pp-phone-stage pp-reveal" aria-label="Pamje e planit të pacientit">
          <div className="pp-float-card pp-float-one"><strong>Ushtrimi u krye ✓</strong><small>Përparimi u ruajt</small></div>
          <div className="pp-phone">
            <div className="pp-notch" />
            <div className="pp-phone-top"><span>Sot</span><span>3 ushtrime</span></div>
            <h3>Glute bridge</h3>
            <p>3 sete × 12 përsëritje</p>
            <div className="pp-video">▶️</div>
            <div className="pp-progress"><span /></div>
            <button className="pp-complete" type="button">✓ U krye</button>
          </div>
          <div className="pp-float-card pp-float-two"><strong>Dhimbja 3/10</strong><small>Brenda kufirit të sigurisë</small></div>
        </div>
      </section>

      <PageSection eyebrow="Shumë e thjeshtë" title="Vetëm katër hapa." text="Nuk ke nevojë të dish teknologji. Ndiq hapat një nga një." tone="soft">
        <div className="pp-steps" id="si-funksionon">{steps.map((step) => <StepCard key={step.number} {...step} />)}</div>
      </PageSection>

      <PageSection eyebrow="Gjithçka në një vend" title="Çfarë sheh në telefon?" text="Vetëm gjërat që të duhen për planin tënd.">
        <div className="pp-grid">{features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div>
      </PageSection>

      <PageSection eyebrow="Para çdo seance" title="Si ndihesh sot?" text="Zgjidh përgjigjen që të përshtatet. Nëse je shumë më keq, fizioterapeuti njoftohet." tone="soft">
        <div className="pp-mood-card pp-reveal">
          <div><h3>Kontroll i shpejtë</h3><p>Ky kontroll nuk e ndryshon planin vetë. Vetëm e njofton fizioterapeutin.</p></div>
          <div className="pp-moods">
            <div className="pp-mood">😊<small>Shumë mirë</small></div>
            <div className="pp-mood">🙂<small>Më mirë</small></div>
            <div className="pp-mood">😐<small>Njësoj</small></div>
            <div className="pp-mood">😣<small>Pak më keq</small></div>
            <div className="pp-mood">🔴<small>Shumë më keq</small></div>
          </div>
        </div>
      </PageSection>

      <PageSection eyebrow="Siguria" title="Nëse ke dhimbje të fortë, ndalo." text="Aplikacioni të ndihmon ta ndjekësh planin. Nuk e zëvendëson fizioterapeutin.">
        <SafetyNotice title="Rregulli 7/10" text="Nëse dhimbja është 7/10 ose më shumë, mos vazhdo ushtrimin. Kontakto fizioterapeutin ose mjekun kur duhet." />
      </PageSection>

      <PageSection eyebrow="Pyetje të shpeshta" title="Përgjigje të shkurtra dhe të qarta." tone="soft">
        <FAQList items={faqs} />
      </PageSection>

      <CTASection title="Gati për ushtrimet e sotme?" text="Hyr me kodin që ta ka dhënë fizioterapeuti." href="/patient-portal" label="Hyr në plan" />
    </main>
  );
}
