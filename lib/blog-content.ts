export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingTime: string;
  author: string;
  hero: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  cta?: {
    label: string;
    href: string;
  };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "si-funksionon-plani-digjital-i-fizioterapise",
    title: "Si funksionon plani digjital i fizioterapisë?",
    description: "Një shpjegim i thjeshtë për pacientët: kodi, ushtrimet, raportimi i dhimbjes dhe kontrolli me fizioterapeutin.",
    category: "Pacientë",
    date: "2026-07-09",
    readingTime: "4 min",
    author: "Fizioterapia ime",
    hero: "Pacienti hyn me kod, sheh planin e vet dhe raporton progresin pa krijuar llogari të re.",
    sections: [
      {
        heading: "1. Pacienti hyn vetëm me kod",
        body: "Fizioterapeuti krijon pacientin dhe planin në web dashboard. Pacienti merr kodin unik, e shkruan në app ose në patient portal dhe hyn direkt në planin personal.",
      },
      {
        heading: "2. Plani krijohet nga fizioterapeuti",
        body: "Pacienti nuk krijon ushtrime vetë dhe nuk ndryshon programin. Kjo e mban procesin klinik të kontrolluar dhe e bën app-in më të thjeshtë për pacientët e moshuar.",
      },
      {
        heading: "3. Dhimbja raportohet pas ushtrimit",
        body: "Pas ushtrimit, pacienti zgjedh dhimbjen nga 0 deri në 10. Nëse dhimbja është 7/10 ose më shumë, app-i e udhëzon pacientin të ndalojë dhe të kontaktojë fizioterapeutin.",
      },
    ],
    cta: { label: "Hyr te Patient Portal", href: "/patient-portal" },
  },
  {
    slug: "ai-movement-check-feedback-jo-diagnoze",
    title: "AI Movement Check: feedback, jo diagnozë",
    description: "Si përdoret AI për kontroll të lëvizjes pa zëvendësuar fizioterapeutin dhe pa ruajtur video në MVP.",
    category: "AI & Siguri",
    date: "2026-07-09",
    readingTime: "5 min",
    author: "Fizioterapia ime",
    hero: "AI Movement Check ndihmon pacientin me feedback për cilësinë e lëvizjes, por vendimi klinik mbetet te fizioterapeuti.",
    sections: [
      {
        heading: "AI nuk diagnostikon",
        body: "Rezultati i AI nuk është diagnozë, nuk përshkruan terapi dhe nuk zëvendëson kontrollin profesional. Ai shërben si sinjal ndihmës për lëvizjen.",
      },
      {
        heading: "Videoja nuk ruhet në MVP",
        body: "Në versionin MVP, app-i nuk ruan video të pacientit. Fokusi është feedback i menjëhershëm dhe raportim i thjeshtë i progresit.",
      },
      {
        heading: "Fizioterapeuti mbetet vendimmarrës",
        body: "Nëse pacienti ka dhimbje të fortë, pasiguri ose progres të dobët, sistemi e drejton të kontaktojë fizioterapeutin për rikontroll.",
      },
    ],
    cta: { label: "Lexo Camera Consent", href: "/camera-consent" },
  },
  {
    slug: "pilotimi-i-pare-i-fizioterapia-ime",
    title: "Si niset pilotimi i parë i Fizioterapia ime",
    description: "Rendi praktik për pilot: një fizioterapeut, pak pacientë, testim 3–7 ditë dhe feedback i kontrolluar.",
    category: "Pilot",
    date: "2026-07-09",
    readingTime: "3 min",
    author: "Fizioterapia ime",
    hero: "Pilotimi i parë duhet të jetë i vogël, i kontrolluar dhe i matur, jo launch publik i menjëhershëm.",
    sections: [
      {
        heading: "Fillo me 1 fizioterapeut",
        body: "Për pilotin e parë mjafton një fizioterapeut dhe 1–3 pacientë. Qëllimi është validim real, jo shkallëzim i shpejtë.",
      },
      {
        heading: "Përdor runbook-un 7-ditor",
        body: "Runbook-u ndihmon ekipin të dijë çka kontrollohet çdo ditë: login, plan, ushtrime, pain score, AI check, feedback dhe raportet.",
      },
      {
        heading: "Mos shto features gjatë pilotit",
        body: "Gjatë pilotit ndryshimet duhet të jenë vetëm bug fixes, safety fixes ose feedback-driven fixes. Features të reja presin pas vendimit Go/Hold/No-go.",
      },
    ],
    cta: { label: "Hape Pilot Runbook", href: "/pilot-runbook" },
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}
