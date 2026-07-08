export type ClinicalProgramKey =
  | "lumbosciatica"
  | "neck_pain"
  | "knee_rehab"
  | "shoulder_mobility"
  | "core_stability"
  | "general_mobility";

export type ClinicalProgramExercise = {
  exerciseName: string;
  dayNumber: number;
  sets: number;
  reps: number | null;
  frequency: string;
  instructions: string;
  aiRecommended?: boolean;
};

export type ClinicalProgramTemplate = {
  key: ClinicalProgramKey;
  title: string;
  category: string;
  diagnosisLabel: string;
  durationDays: number;
  shortDescription: string;
  goals: string[];
  redFlags: string[];
  safetyNote: string;
  exercises: ClinicalProgramExercise[];
};

const painStopRule = "Dhimbje 7/10 ose më shumë = ndalo ushtrimin dhe kontakto fizioterapeutin.";
const aiRule = "AI Movement Check jep vetëm feedback për cilësinë e lëvizjes. Nuk diagnostikon dhe nuk e zëvendëson fizioterapeutin.";

export const clinicalProgramTemplates: ClinicalProgramTemplate[] = [
  {
    key: "lumbosciatica",
    title: "Program rehabilitimi 14 ditë – Lumbosciatica",
    category: "Low back / Sciatica",
    diagnosisLabel: "Lumbosciatica / dhimbje mesi",
    durationDays: 14,
    shortDescription: "Plan progresiv për mobilitet të mesit, kontroll të legenit, aktivizim gluteal dhe stabilizim të trungut.",
    goals: ["Ulja e provokimit të dhimbjes", "Rikthim i lëvizjes së kontrolluar", "Aktivizim gluteal dhe core"],
    redFlags: ["Mpirje progresive", "Dobësi në këmbë", "Dhimbje që rritet gjatë ushtrimit"],
    safetyNote: `${painStopRule} Nëse ka mpirje progresive, dobësi ose humbje kontrolli, kërko vlerësim mjekësor. ${aiRule}`,
    exercises: [
      { exerciseName: "Pelvic tilt", dayNumber: 1, sets: 2, reps: 12, frequency: "Çdo ditë", instructions: "Kontrollo legenin me frymëmarrje të qetë. Lëvizja duhet të jetë e vogël dhe pa dhimbje të fortë.", aiRecommended: true },
      { exerciseName: "Cat cow", dayNumber: 1, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Lëviz shtyllën ngadalë, pa kompensim të qafës dhe pa e shtyrë në dhimbje.", aiRecommended: true },
      { exerciseName: "Piriformis stretch", dayNumber: 2, sets: 3, reps: null, frequency: "3 × 30 sek", instructions: "Mbaje shtrirjen lehtë. Nuk duhet të provokojë mpirje ose therje të fortë." },
      { exerciseName: "Glute bridge", dayNumber: 3, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Aktivizo gluteus-in, ngrije legenin ngadalë dhe mos e harko tepër mesin.", aiRecommended: true },
      { exerciseName: "Bird dog", dayNumber: 4, sets: 2, reps: 8, frequency: "5 herë/javë", instructions: "Mbaje trungun stabil. Lëvize krahun dhe këmbën ngadalë pa rotacion të legenit.", aiRecommended: true },
    ],
  },
  {
    key: "neck_pain",
    title: "Program rehabilitimi 10 ditë – Dhimbje qafe",
    category: "Cervical / posture",
    diagnosisLabel: "Dhimbje qafe / tension cervikal",
    durationDays: 10,
    shortDescription: "Plan i butë për kontroll të qafës, posturë, aktivizim skapular dhe ulje të tensionit muskulor.",
    goals: ["Vetëdije posturale", "Kontroll i qafës", "Stabilizim skapular"],
    redFlags: ["Marramendje", "Mpirje në krah", "Dhimbje koke e re ose shumë e fortë"],
    safetyNote: `Nëse shfaqet marramendje, mpirje në krah ose dhimbje e fortë, pacienti ndalon dhe kontakton fizioterapeutin. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Chin tuck", dayNumber: 1, sets: 2, reps: 8, frequency: "Çdo ditë", instructions: "Tërhiq mjekrën lehtë prapa sikur po krijon mjekër të dyfishtë. Mos e përkul qafën poshtë.", aiRecommended: true },
      { exerciseName: "Scapular setting", dayNumber: 1, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Afro shpatullat lehtë mbrapa-poshtë, pa i ngritur drejt veshëve.", aiRecommended: true },
      { exerciseName: "Thoracic rotation", dayNumber: 2, sets: 2, reps: 8, frequency: "Çdo ditë", instructions: "Rrotullo kraharorin ngadalë. Qafa qëndron neutrale dhe lëvizja nuk duhet të shkaktojë marramendje." },
      { exerciseName: "Cat cow", dayNumber: 3, sets: 2, reps: 8, frequency: "Çdo ditë", instructions: "Lëviz shtyllën ngadalë dhe mbaje qafën neutrale, pa e shtyrë në fund-range.", aiRecommended: true },
    ],
  },
  {
    key: "knee_rehab",
    title: "Program rehabilitimi 14 ditë – Knee rehab",
    category: "Knee / lower limb",
    diagnosisLabel: "Rehabilitim gjuri / forcim bazik",
    durationDays: 14,
    shortDescription: "Plan bazik për aktivizim të quadriceps, kontroll të gjurit dhe rikthim gradual të funksionit.",
    goals: ["Aktivizim quadriceps", "Kontroll i linjës së gjurit", "Rikthim gradual i ngarkesës"],
    redFlags: ["Ënjtje që rritet", "Bllokim i gjurit", "Dhimbje e fortë ose paqëndrueshmëri"],
    safetyNote: `Nëse gjuri ënjtet, bllokohet ose dhimbja rritet, ndalo ushtrimin dhe kontakto fizioterapeutin. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Quad sets", dayNumber: 1, sets: 3, reps: 10, frequency: "Çdo ditë", instructions: "Shtrëngo muskujt para të kofshës dhe mbaje 3–5 sekonda. Mos e shty gjurin në dhimbje." },
      { exerciseName: "Heel slides", dayNumber: 1, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Rrëshqite thembrën drejt vitheve ngadalë, vetëm deri ku lejon dhimbja." },
      { exerciseName: "Straight leg raise", dayNumber: 2, sets: 2, reps: 8, frequency: "5 herë/javë", instructions: "Mbaje gjurin drejt, ngrije këmbën ngadalë dhe mos e humb kontrollin gjatë kthimit.", aiRecommended: true },
      { exerciseName: "Glute bridge", dayNumber: 3, sets: 2, reps: 10, frequency: "5 herë/javë", instructions: "Aktivizo gluteus-in dhe mbaje gjurin në linjë me këmbën.", aiRecommended: true },
      { exerciseName: "Sit to stand", dayNumber: 5, sets: 2, reps: 8, frequency: "3–4 herë/javë", instructions: "Çohu nga karrigia me kontroll. Gjuri nuk duhet të bjerë brenda.", aiRecommended: true },
    ],
  },
  {
    key: "shoulder_mobility",
    title: "Program rehabilitimi 10 ditë – Shoulder mobility",
    category: "Shoulder / mobility",
    diagnosisLabel: "Mobilitet shpatulle / kontroll skapular",
    durationDays: 10,
    shortDescription: "Plan i lehtë për mobilitet të shpatullës, kontroll të skapulës dhe lëvizje pa provokim të dhimbjes.",
    goals: ["Mobilitet pa provokim", "Kontroll skapular", "Rikthim gradual i amplitudës"],
    redFlags: ["Dhimbje nate e fortë", "Dobësi e papritur", "Humbje progresive e lëvizjes"],
    safetyNote: `Nëse dhimbja e shpatullës rritet ose shfaqet dobësi e papritur, ndalo ushtrimin dhe kontakto fizioterapeutin. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Pendulum shoulder exercise", dayNumber: 1, sets: 2, reps: 30, frequency: "Çdo ditë", instructions: "Lejo krahun të lëvizë lehtë si pendulum. Mos e ngrit me forcë." },
      { exerciseName: "Scapular setting", dayNumber: 1, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Vendose skapulën mbrapa-poshtë lehtë, pa tension në qafë.", aiRecommended: true },
      { exerciseName: "Wall slides", dayNumber: 2, sets: 2, reps: 8, frequency: "Çdo ditë", instructions: "Rrëshqit krahët ngadalë në mur. Ndalo para dhimbjes së fortë.", aiRecommended: true },
      { exerciseName: "Thoracic rotation", dayNumber: 3, sets: 2, reps: 8, frequency: "Çdo ditë", instructions: "Rrotullo kraharorin ngadalë për të ndihmuar lëvizjen e shpatullës." },
    ],
  },
  {
    key: "core_stability",
    title: "Program rehabilitimi 14 ditë – Core stability",
    category: "Core / stabilization",
    diagnosisLabel: "Stabilizim core / kontroll i trungut",
    durationDays: 14,
    shortDescription: "Plan për kontroll të legenit, stabilizim të mesit dhe rikthim gradual të lëvizjes.",
    goals: ["Kontroll i legenit", "Stabilitet i trungut", "Forcim gradual pa provokim"],
    redFlags: ["Dhimbje që përhapet poshtë këmbës", "Dobësi progresive", "Dhimbje e fortë gjatë stabilizimit"],
    safetyNote: `Ushtrimet duhet të bëhen pa dhimbje të fortë. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Pelvic tilt", dayNumber: 1, sets: 2, reps: 12, frequency: "Çdo ditë", instructions: "Mbaje lëvizjen të vogël, të kontrolluar dhe me frymëmarrje të qetë.", aiRecommended: true },
      { exerciseName: "Dead bug", dayNumber: 2, sets: 2, reps: 8, frequency: "5 herë/javë", instructions: "Mbaje mesin neutral. Lëviz ngadalë krahun dhe këmbën pa e humbur kontrollin.", aiRecommended: true },
      { exerciseName: "Glute bridge", dayNumber: 3, sets: 2, reps: 10, frequency: "5 herë/javë", instructions: "Ngrije legenin ngadalë dhe kontrollo kthimin poshtë.", aiRecommended: true },
      { exerciseName: "Bird dog", dayNumber: 4, sets: 2, reps: 8, frequency: "4 herë/javë", instructions: "Mbaje trungun stabil dhe mos lejo rotacion të legenit.", aiRecommended: true },
    ],
  },
  {
    key: "general_mobility",
    title: "Program rehabilitimi 7 ditë – General mobility",
    category: "General mobility",
    diagnosisLabel: "Mobilitet i përgjithshëm / rikthim gradual",
    durationDays: 7,
    shortDescription: "Plan i thjeshtë për pacientë që kanë nevojë për lëvizje të butë dhe progres gradual.",
    goals: ["Rikthim i lëvizjes", "Ulja e ngurtësisë", "Krijim rutine të sigurt"],
    redFlags: ["Dhimbje e fortë", "Marramendje", "Përkeqësim pas çdo seance"],
    safetyNote: `Pacienti duhet të punojë brenda tolerancës dhe të ndalojë në dhimbje të fortë. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Cat cow", dayNumber: 1, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Lëviz ngadalë dhe pa dhimbje të fortë.", aiRecommended: true },
      { exerciseName: "Thoracic rotation", dayNumber: 1, sets: 2, reps: 8, frequency: "Çdo ditë", instructions: "Rrotullo kraharorin lehtë dhe mbaje frymëmarrjen të qetë." },
      { exerciseName: "Glute bridge", dayNumber: 2, sets: 2, reps: 10, frequency: "Çdo ditë", instructions: "Ngrije legenin me kontroll dhe kthehu ngadalë.", aiRecommended: true },
      { exerciseName: "Piriformis stretch", dayNumber: 2, sets: 3, reps: null, frequency: "3 × 30 sek", instructions: "Mbaje shtrirjen e lehtë, pa therje apo mpirje." },
    ],
  },
];

export const defaultClinicalProgramKey: ClinicalProgramKey = "lumbosciatica";

export function getClinicalProgramTemplate(key?: string | null) {
  return clinicalProgramTemplates.find((program) => program.key === key) || clinicalProgramTemplates[0];
}

export function getClinicalProgramExerciseNames() {
  return Array.from(new Set(clinicalProgramTemplates.flatMap((program) => program.exercises.map((exercise) => exercise.exerciseName))));
}
