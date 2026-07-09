export type LegalSection = {
  title: string;
  body: string;
};

export type LegalContent = {
  slug: string;
  badge: string;
  title: string;
  intro: string;
  lastUpdated?: string;
  sections: LegalSection[];
};

export const fallbackLegalPages: Record<string, LegalContent> = {
  privacy: {
    slug: "privacy",
    badge: "Privacy Policy",
    title: "Politika e privatësisë",
    intro: "Kjo faqe shpjegon si Fizioterapia ime mbledh, përdor dhe mbron të dhënat e pacientëve dhe fizioterapeutëve.",
    lastUpdated: "Korrik 2026",
    sections: [
      {
        title: "1. Të dhënat që mblidhen",
        body: "Platforma mund të ruajë emrin, mbiemrin, moshën, numrin e telefonit, diagnozën/problemin e raportuar, planin e ushtrimeve, pain score, exercise logs, AI Movement Check score, mesazhe dhe të dhëna teknike të përdorimit. Pacienti hyn me kod të gjeneruar nga fizioterapeuti.",
      },
      {
        title: "2. Qëllimi i përdorimit",
        body: "Të dhënat përdoren për të krijuar plane rehabilitimi, për të ndjekur progresin, për të lehtësuar komunikimin me fizioterapeutin, për të dërguar njoftime klinike dhe për të gjeneruar raporte progresi. AI Movement Check përdoret vetëm për feedback të lëvizjes dhe nuk bën diagnozë.",
      },
      {
        title: "3. Kush ka qasje",
        body: "Fizioterapeuti sheh vetëm pacientët e vet. Admini/owner mund të ketë qasje për administrim të platformës, support teknik, siguri dhe mirëmbajtje. Pacientët shohin vetëm planin e tyre dhe të dhënat e lidhura me të.",
      },
      {
        title: "4. Ruajtja dhe siguria",
        body: "Të dhënat ruhen në Supabase me qasje të kufizuar. Keys dhe secrets ruhen vetëm në Vercel Environment Variables. Nuk duhet të ndahen kodet e pacientëve me persona të tretë.",
      },
      {
        title: "5. Email dhe njoftime",
        body: "Platforma mund të dërgojë email te fizioterapeuti për raste si dhimbje 7/10 ose më shumë, AI score të ulët, ose ngjarje të rëndësishme klinike. Emailat dërgohen përmes Resend.",
      },
      {
        title: "6. Fshirja e të dhënave",
        body: "Pacienti ose fizioterapeuti mund të kërkojë qasje, korrigjim ose fshirje të të dhënave përmes faqes Data Deletion Request. Kërkesat trajtohen nga administratori i platformës sipas rregullave ligjore dhe kontraktuale të zbatueshme.",
      },
    ],
  },
  terms: {
    slug: "terms",
    badge: "Terms of Use",
    title: "Kushtet e përdorimit",
    intro: "Këto kushte përcaktojnë mënyrën e përdorimit të platformës Fizioterapia ime nga pacientët, fizioterapeutët dhe administratorët.",
    lastUpdated: "Korrik 2026",
    sections: [
      {
        title: "1. Përshkrimi i shërbimit",
        body: "Fizioterapia ime është platformë digjitale për krijim të planeve të fizioterapisë, ndjekje të ushtrimeve, raportim të dhimbjes, komunikim dhe raporte progresi. Platforma mbështet fizioterapeutin, por nuk e zëvendëson vlerësimin profesional.",
      },
      {
        title: "2. Përdorimi nga pacienti",
        body: "Pacienti përdor platformën vetëm me kod të dhënë nga fizioterapeuti. Pacienti duhet të ndjekë udhëzimet, të raportojë dhimbjen sinqerisht dhe të ndalojë ushtrimin nëse dhimbja rritet ose shfaqen simptoma shqetësuese.",
      },
      {
        title: "3. Përdorimi nga fizioterapeuti",
        body: "Fizioterapeuti është përgjegjës për vlerësimin klinik, zgjedhjen e ushtrimeve, përshtatjen e planit dhe interpretimin e të dhënave. Platforma ofron mjete digjitale dhe nuk merr vendime klinike në vend të fizioterapeutit.",
      },
      {
        title: "4. Llogaritë dhe qasja",
        body: "Fizioterapeutët hyjnë me Clerk authentication. Pacientët hyjnë me kod. Qasja duhet të mbahet private. Çdo përdorim i paautorizuar duhet të raportohet menjëherë te administratori.",
      },
      {
        title: "5. Kufizimi i përgjegjësisë",
        body: "Platforma nuk është shërbim urgjent, nuk zëvendëson konsultën mjekësore dhe nuk garanton rezultat klinik. Për dhimbje të fortë, përkeqësim, mpirje, dobësi ose simptoma të reja, pacienti duhet të kontaktojë profesionistin shëndetësor.",
      },
      {
        title: "6. Ndryshimet",
        body: "Këto kushte mund të përditësohen gjatë zhvillimit të produktit. Versioni final duhet të rishikohet nga jurist dhe të përshtatet me tregun ku platforma publikohet.",
      },
    ],
  },
  "medical-disclaimer": {
    slug: "medical-disclaimer",
    badge: "Medical Disclaimer",
    title: "Deklaratë mjekësore",
    intro: "Kjo deklaratë sqaron kufijtë klinikë të Fizioterapia ime dhe rolit të AI Movement Check.",
    lastUpdated: "Korrik 2026",
    sections: [
      {
        title: "1. Platformë mbështetëse, jo diagnozë",
        body: "Fizioterapia ime është mjet mbështetës për fizioterapeutë dhe pacientë. Platforma nuk vendos diagnozë, nuk përshkruan terapi dhe nuk zëvendëson konsultën me fizioterapeut, mjek ose profesionist tjetër shëndetësor.",
      },
      {
        title: "2. Roli i fizioterapeutit",
        body: "Fizioterapeuti mbetet përgjegjës për vlerësimin profesional, caktimin e planit, modifikimin e ushtrimeve dhe vendimet klinike. Të dhënat nga platforma duhet të përdoren si ndihmë për monitorim, jo si vendim automatik.",
      },
      {
        title: "3. AI Movement Check",
        body: "AI Movement Check analizon lëvizjen përmes kamerës dhe jep score/feedback për cilësinë e lëvizjes. AI nuk sheh dhimbjen reale, nuk diagnostikon, nuk kupton plotësisht historinë klinike dhe nuk duhet të përdoret si zëvendësim i vlerësimit profesional.",
      },
      {
        title: "4. Kur duhet ndalur ushtrimi",
        body: "Nëse dhimbja është 7/10 ose më shumë, nëse dhimbja përkeqësohet, ose nëse shfaqen mpirje, dobësi, marramendje, dhimbje gjoksi, humbje kontrolli të urinës/jashtëqitjes ose simptoma të tjera shqetësuese, pacienti duhet të ndalojë ushtrimin dhe të kontaktojë profesionistin shëndetësor.",
      },
      {
        title: "5. Jo për emergjenca",
        body: "Platforma nuk është shërbim emergjent. Për urgjenca, pacienti duhet të kontaktojë shërbimet emergjente lokale ose institucionin shëndetësor përkatës.",
      },
    ],
  },
  "camera-consent": {
    slug: "camera-consent",
    badge: "Camera Consent",
    title: "Pëlqimi për përdorimin e kamerës",
    intro: "Kjo faqe shpjegon si përdoret kamera për AI Movement Check dhe çfarë duhet të dijë pacienti para se ta aktivizojë.",
    lastUpdated: "Korrik 2026",
    sections: [
      {
        title: "1. Pse kërkohet kamera",
        body: "Kamera përdoret për të detektuar landmark-et e trupit gjatë ushtrimit dhe për të dhënë feedback mbi cilësinë e lëvizjes. Kamera aktivizohet vetëm kur pacienti e lejon në browser/app dhe klikon funksionin AI Movement Check.",
      },
      {
        title: "2. Çfarë analizohet",
        body: "Sistemi analizon pozicionet relative të trupit, stabilitetin, simetrinë dhe kontrollin e lëvizjes. Qëllimi është feedback për ushtrimin, jo identifikim personal, diagnozë apo vlerësim mjekësor i plotë.",
      },
      {
        title: "3. Ruajtja e të dhënave",
        body: "Versioni MVP ruan rezultatin e AI check, feedback-un, alert type dhe kohën e kontrollit. Videoja live përdoret për analizë në pajisje/browser dhe nuk ruhet si video klinike, përveç nëse më vonë shtohet funksion specifik me pëlqim të veçantë.",
      },
      {
        title: "4. Ambienti i sigurt",
        body: "Pacienti duhet të përdorë kamerën në ambient privat, me ndriçim të mirë dhe hapësirë të sigurt për lëvizje. Pacienti nuk duhet të filmojë persona të tjerë pa lejen e tyre.",
      },
      {
        title: "5. Refuzimi i kamerës",
        body: "Pacienti mund të mos e lejojë kamerën. Në këtë rast, ushtrimet dhe raportimi i dhimbjes mund të vazhdojnë pa AI Movement Check. Fizioterapeuti mund të japë udhëzime manuale.",
      },
    ],
  },
  "data-deletion": {
    slug: "data-deletion",
    badge: "Data Deletion",
    title: "Kërkesë për fshirjen e të dhënave",
    intro: "Kjo faqe shpjegon si pacienti ose fizioterapeuti mund të kërkojë fshirje ose korrigjim të të dhënave.",
    lastUpdated: "Korrik 2026",
    sections: [
      {
        title: "1. Kush mund të bëjë kërkesë",
        body: "Pacienti mund të kërkojë qasje, korrigjim ose fshirje të të dhënave të veta. Fizioterapeuti mund të kërkojë fshirje të llogarisë dhe të dhënave të lidhura me klinikën, varësisht nga detyrimet ligjore dhe kontraktuale.",
      },
      {
        title: "2. Si bëhet kërkesa",
        body: "Kërkesa bëhet duke kontaktuar administratorin në emailin zyrtar të platformës. Në MVP, adresa e kontaktit është diellzarabushaj@gmail.com. Kërkesa duhet të përmbajë emrin, rolin, arsyen dhe mënyrën e verifikimit të identitetit.",
      },
      {
        title: "3. Çfarë të dhënash mund të fshihen",
        body: "Mund të kërkohet fshirja e profilit, planeve, logs, pain scores, AI checks, mesazheve dhe notification logs. Disa të dhëna mund të mbahen për një periudhë të caktuar nëse kërkohet nga ligji, siguria ose evidenca klinike.",
      },
      {
        title: "4. Afati i trajtimit",
        body: "Administratori e shqyrton kërkesën dhe kthen përgjigje sa më shpejt. Për version final, afatet duhet të përcaktohen sipas rregullave të privatësisë në tregun ku platforma përdoret.",
      },
      {
        title: "5. Fshirje teknike",
        body: "Fshirja mund të bëhet si soft-delete ose hard-delete varësisht nga lloji i të dhënës dhe nevoja ligjore/klinike. Për siguri, çdo kërkesë duhet të verifikohet para se të ekzekutohet.",
      },
    ],
  },
};

export function getFallbackLegalPage(slug: string) {
  return fallbackLegalPages[slug] ?? null;
}
