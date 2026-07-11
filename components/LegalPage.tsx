import Link from "next/link";
import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  body: string;
};

type LegalPageProps = {
  badge: string;
  title: string;
  intro: string;
  lastUpdated?: string;
  sections: LegalSection[];
  afterContent?: ReactNode;
};

function sectionId(title: string, index: number) {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || `seksioni-${index + 1}`;
}

export function LegalPage({ badge, title, intro, lastUpdated = "Korrik 2026", sections = [], afterContent }: LegalPageProps) {
  const documentText = `${badge} ${title}`.toLowerCase();
  const isTerms = documentText.includes("kusht") || documentText.includes("term");
  const isMedical = documentText.includes("medical") || documentText.includes("mjek") || documentText.includes("disclaimer");
  const isDeletion = documentText.includes("fshir") || documentText.includes("deletion");
  const isCamera = documentText.includes("camera") || documentText.includes("kamer");

  const summary = isTerms
    ? {
        label: "Me pak fjalë",
        title: "Përdore platformën në mënyrë të sigurt dhe të përgjegjshme.",
        text: "Këto kushte shpjegojnë rolin e pacientit, fizioterapeutit dhe platformës.",
        icon: "✓",
        noteTitle: "Vendimi klinik mbetet te profesionisti.",
        noteText: "Platforma ndihmon me organizimin dhe ndjekjen e planit, por nuk zëvendëson vlerësimin profesional.",
        contactTitle: "Ke pyetje për kushtet?",
        subject: "Kushtet - Fizioterapia Ime",
        actionLabel: "Lexo dhe konfirmo",
      }
    : isMedical
      ? {
          label: "E rëndësishme",
          title: "Platforma nuk ofron diagnozë ose shërbim emergjent.",
          text: "Udhëzimet digjitale përdoren vetëm si pjesë e planit të caktuar nga profesionisti.",
          icon: "⚕️",
          noteTitle: "Në simptoma të forta, ndalo.",
          noteText: "Kontakto fizioterapeutin ose shërbimet emergjente kur situata kërkon ndihmë të menjëhershme.",
          contactTitle: "Ke pyetje mjekësore për përdorimin?",
          subject: "Medical disclaimer - Fizioterapia Ime",
          actionLabel: "Lexo dhe konfirmo",
        }
      : isDeletion
        ? {
            label: "Kontrolli yt",
            title: "Mund të kërkosh qasje, korrigjim ose fshirje.",
            text: "Kjo faqe shpjegon si bëhet kërkesa dhe çfarë mund të duhet të ruhet sipas ligjit.",
            icon: "🗑️",
            noteTitle: "Kërkesa verifikohet për sigurinë tënde.",
            noteText: "Mund të kërkohet konfirmim i identitetit para se të ndryshohen ose fshihen të dhënat.",
            contactTitle: "Ke pyetje për kërkesën?",
            subject: "Fshirja e të dhënave - Fizioterapia Ime",
            actionLabel: "Dërgo kërkesën",
          }
        : isCamera
          ? {
              label: "Ti vendos",
              title: "Kamera aktivizohet vetëm me lejen tënde.",
              text: "Mund ta refuzosh kamerën dhe ta vazhdosh planin pa AI Movement Check.",
              icon: "📷",
              noteTitle: "Videoja live nuk është diagnozë.",
              noteText: "Sistemi analizon lëvizjen për feedback teknik; fizioterapeuti mbetet përgjegjës për vendimet klinike.",
              contactTitle: "Ke pyetje për kamerën?",
              subject: "Pëlqimi për kamerën - Fizioterapia Ime",
              actionLabel: "Konfirmo pëlqimin",
            }
          : {
              label: "Me pak fjalë",
              title: "Të dhënat e tua trajtohen me kujdes.",
              text: "Ky dokument shpjegon çfarë mbledhim, pse e përdorim dhe cilat të drejta ke.",
              icon: "🔐",
              noteTitle: "Kontrolli mbetet te ti.",
              noteText: "Mund të kërkosh qasje, korrigjim ose fshirje të të dhënave sipas rregullave që zbatohen.",
              contactTitle: "Ke pyetje për privatësinë?",
              subject: "Privatësia - Fizioterapia Ime",
              actionLabel: "Lexo dhe konfirmo",
            };

  return (
    <main className="legal-page">
      <section className="legal-hero pp-reveal">
        <div>
          <span className="legal-eyebrow">{badge}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <aside className="legal-summary" aria-label="Përmbledhje e dokumentit">
          <span>{summary.label}</span>
          <strong>{summary.title}</strong>
          <p>{summary.text}</p>
        </aside>
      </section>

      <div className="legal-disclaimer" role="note">
        Ky dokument është draft informues për MVP dhe duhet të verifikohet nga jurist ose konsulent përkatës para publikimit final.
      </div>

      <section className="legal-shell">
        <nav className="legal-nav" aria-label="Përmbajtja e dokumentit">
          <strong>Në këtë faqe</strong>
          {sections.map((section, index) => (
            <a href={`#${sectionId(section.title, index)}`} key={`${section.title}-${index}`}>
              {section.title}
            </a>
          ))}
          {afterContent && <a href="#veprimi-ligjor">{summary.actionLabel}</a>}
        </nav>

        <article className="legal-content">
          <div className="legal-meta">
            <div>
              <h2>{title}</h2>
              <p>Përditësuar së fundmi: {lastUpdated}</p>
            </div>
            <Link href="/">Kthehu në ballinë</Link>
          </div>

          <div className="legal-note">
            <span aria-hidden="true">{summary.icon}</span>
            <div>
              <strong>{summary.noteTitle}</strong><br />
              {summary.noteText}
            </div>
          </div>

          {sections.map((section, index) => (
            <section className="legal-section" id={sectionId(section.title, index)} key={`${section.title}-${index}`}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}

          {afterContent && <div id="veprimi-ligjor">{afterContent}</div>}

          <section className="legal-contact">
            <h3>{summary.contactTitle}</h3>
            <p>Na shkruaj pa përfshirë të dhëna të ndjeshme mjekësore në email.</p>
            <a href={`mailto:altin.physio@gmail.com?subject=${encodeURIComponent(summary.subject)}`}>altin.physio@gmail.com →</a>
          </section>
        </article>
      </section>
    </main>
  );
}
