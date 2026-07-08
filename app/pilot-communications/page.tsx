import { BrandMark } from "@/components/BrandMark";

const templates = [
  {
    group: "Ftesa për fizioterapeutin",
    title: "WhatsApp — ftesa e parë",
    body: `Përshëndetje,

Po e hapim pilotin e parë të Fizioterapia ime.

Qëllimi është me testu: krijimin e pacientit, planin e ushtrimeve, hyrjen e pacientit me username + kod, pain score, AI Movement Check dhe raportin PDF.

Ky është pilot i kontrolluar 3–7 ditë me 1–3 pacientë, jo lansim publik.

AI nuk diagnostikon dhe nuk zëvendëson fizioterapeutin. Vendimi klinik mbetet gjithmonë te fizioterapeuti.

Linkat:
/pilot-launch
/patient-handout
/pilot-feedback`,
  },
  {
    group: "Ftesa për fizioterapeutin",
    title: "Email — ftesa profesionale",
    body: `Subject: Pilot i kontrolluar — Fizioterapia ime

Përshëndetje,

Po ju ftojmë në pilotin e parë të Fizioterapia ime, platformë digjitale për fizioterapi me plan ushtrimesh, monitorim progresi, pain score, AI Movement Check dhe raport PDF.

Ky pilot zgjat 3–7 ditë dhe bëhet vetëm me 1–3 pacientë testues. Nuk është lansim publik.

Qëllimi është të kuptojmë sa i qartë është workflow për fizioterapeutin dhe pacientin para zgjerimit.

Me respekt,
Fizioterapia ime`,
  },
  {
    group: "Pacienti",
    title: "WhatsApp — instruksion për pacientin",
    body: `Përshëndetje,

Fizioterapeuti juaj e ka krijuar planin tuaj në Fizioterapia ime.

Hyni këtu:
/patient-portal

Username: __________
Kodi: __________

Ju lutem kryeni ushtrimet ngadalë dhe shënoni dhimbjen 0–10.

Nëse dhimbja është 7/10 ose më shumë, ndaloni ushtrimin dhe kontaktoni fizioterapeutin.

AI Movement Check është vetëm feedback për lëvizje, jo diagnozë.`,
  },
  {
    group: "Pacienti",
    title: "Reminder — dita 2/3",
    body: `Përshëndetje,

Vetëm kujtesë e shkurtër: ju lutem hapni Fizioterapia ime, kryeni ushtrimet e ditës dhe shënoni pain score.

Nëse keni dhimbje 7/10 ose më shumë, ndaloni ushtrimet dhe kontaktoni fizioterapeutin.`,
  },
  {
    group: "Feedback",
    title: "Mesazhi për feedback pas pilotit",
    body: `Përshëndetje,

Faleminderit për testimin e pilotit të Fizioterapia ime.

Ju lutem plotësoni feedback formën:
/pilot-feedback

Na intereson sidomos:
- a ishte i lehtë krijimi i pacientit,
- a ishte i qartë plani i ushtrimeve,
- a e kuptoi pacienti hyrjen me username + kod,
- a ishte i dobishëm raporti,
- çka duhet rregulluar para zgjerimit.`,
  },
  {
    group: "Problem / escalation",
    title: "Mesazh kur del P0/P1",
    body: `Përshëndetje,

E ndalim përkohësisht pilotin derisa ta rregullojmë problemin.

Arsyeja: është shënuar si P0/P1 sepse prek funksion kritik, siguri, login, të dhëna pacienti, feedback ose raport.

Do të vazhdojmë vetëm pasi problemi të rregullohet dhe smoke test/build të kalojnë përsëri.`,
  },
];

const communicationRules = [
  "Mos premto diagnozë nga AI.",
  "Mos thuaj që AI zëvendëson fizioterapeutin.",
  "Mos kërko diagnoza ose të dhëna sensitive në feedback formë.",
  "Përsërit stop rule: dhimbje 7/10 ose më shumë = ndalo dhe kontakto fizioterapeutin.",
  "Mbaje scope të qartë: 1 fizioterapeut, 1–3 pacientë, 3–7 ditë.",
];

export default function PilotCommunicationsPage() {
  return (
    <main className="page launch-page pilot-communications-page">
      <nav className="top-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/pilot-runbook">Runbook</a>
          <a href="/pilot-readiness">Readiness</a>
          <a href="/pilot-launch">Launch</a>
          <a href="/pilot-feedback">Feedback</a>
        </div>
      </nav>

      <section className="launch-hero">
        <div>
          <span className="badge">Phase 26 · Pilot communication templates</span>
          <h1>Mesazhet gati për pilotin e parë.</h1>
          <p>
            Këto janë WhatsApp/email scripts për fizioterapeutin, pacientin, reminder, feedback dhe escalation kur del P0/P1.
          </p>
          <div className="hero-actions">
            <a className="button" href="/pilot-runbook">Hap runbook</a>
            <a className="button secondary" href="/patient-handout">Patient handout</a>
          </div>
        </div>
        <div className="launch-status-card ready">
          <span className="mini-badge">Tone</span>
          <strong>Profesional · i thjeshtë · safe</strong>
          <p>Komunikim i qartë pa premtime klinike nga AI.</p>
        </div>
      </section>

      <section className="launch-grid readiness-grid">
        {templates.map((template) => (
          <article className="launch-card communication-card" key={template.title}>
            <span className="mini-badge">{template.group}</span>
            <h2>{template.title}</h2>
            <pre>{template.body}</pre>
          </article>
        ))}
      </section>

      <section className="launch-panel warning">
        <div>
          <span className="mini-badge">Communication safety rules</span>
          <h2>Rregulla që nuk duhet me u shkel.</h2>
          <ul className="support-list">
            {communicationRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </div>
        <a className="button" href="/medical-disclaimer">Medical disclaimer</a>
      </section>
    </main>
  );
}
