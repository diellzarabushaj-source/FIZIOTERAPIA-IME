export type FaqItem = {
  question: string;
  answer: string;
  category?: string;
  order?: number;
};

export const fallbackFaqs: FaqItem[] = [
  {
    question: "Çka është Fizioterapia ime?",
    answer: "Fizioterapia ime është platformë digjitale për fizioterapi ku fizioterapeuti krijon planin e ushtrimeve, ndërsa pacienti e ndjek planin në app me kod personal.",
    category: "paciente",
    order: 1,
  },
  {
    question: "A mundet pacienti me kriju vetë plan?",
    answer: "Jo. Pacienti nuk krijon vetë plan. Plani caktohet vetëm nga fizioterapeuti. Pacienti vetëm hyn me kod, i sheh ushtrimet dhe raporton progresin/dhimbjen.",
    category: "paciente",
    order: 2,
  },
  {
    question: "A e zëvendëson AI fizioterapeutin?",
    answer: "Jo. AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk diagnostikon, nuk cakton terapi dhe nuk e ndryshon planin. Fizioterapeuti mbetet vendimmarrësi kryesor.",
    category: "ai-siguri",
    order: 3,
  },
  {
    question: "Çka ndodh nëse pacienti raporton dhimbje 7/10 ose më shumë?",
    answer: "Pacienti merr paralajmërim me ndalë ushtrimin dhe me kontaktu fizioterapeutin. Fizioterapeuti merr alert/email nëse Resend është i konfiguruar.",
    category: "ai-siguri",
    order: 4,
  },
  {
    question: "Sa kushton për fizioterapeutë?",
    answer: "Qasja për fizioterapeutë kushton 29.90 EUR në muaj. Për MVP pagesa është manuale/local-bank dhe admini e aktivizon qasjen nga paneli /admin-billing.",
    category: "pagesa",
    order: 5,
  },
  {
    question: "A përdoret Stripe?",
    answer: "Jo për momentin. Stripe nuk është zgjedhja kryesore për Kosovë. MVP përdor pagesë manuale dhe më vonë mund të lidhet me bankë lokale.",
    category: "pagesa",
    order: 6,
  },
  {
    question: "A ka app për telefon?",
    answer: "Po, mobile app është përgatitur me Expo React Native. Pacienti mund ta përdorë app-in për plan, ushtrime, pain score dhe AI Movement Check.",
    category: "paciente",
    order: 7,
  },
  {
    question: "A ruhen videot nga kamera?",
    answer: "Në MVP, kamera përdoret për analizë të lëvizjes. Ruhet score, feedback dhe alert type, jo video klinike. Për çdo ndryshim të ardhshëm duhet pëlqim i veçantë.",
    category: "privatesi",
    order: 8,
  },
  {
    question: "Kush i sheh të dhënat e pacientit?",
    answer: "Fizioterapeuti sheh pacientët e vet. Admin/owner mund të ketë qasje për menaxhim, support dhe siguri. Pacienti sheh vetëm planin e tij.",
    category: "privatesi",
    order: 9,
  },
  {
    question: "A mund të gjenerohet raport PDF?",
    answer: "Po. Fizioterapeuti mund të hapë raportin e pacientit dhe ta printojë ose ruajë si PDF. Raporti përfshin adherence, dhimbjen, AI score dhe përmbledhje klinike.",
    category: "fizioterapeute",
    order: 10,
  },
];
