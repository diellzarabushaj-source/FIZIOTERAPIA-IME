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

const painStopRule = "Dhimbje 7/10 ose me shume = ndalo ushtrimin dhe kontakto fizioterapeutin.";
const aiRule = "AI Movement Check jep vetem feedback per cilesine e levizjes. Nuk diagnostikon dhe nuk e zevendeson fizioterapeutin.";

export const clinicalProgramTemplates: ClinicalProgramTemplate[] = [
  {
    key: "lumbosciatica",
    title: "Program rehabilitimi 14 dite - Lumbosciatica",
    category: "Low back / Sciatica",
    diagnosisLabel: "Lumbosciatica / dhimbje mesi",
    durationDays: 14,
    shortDescription: "Plan progresiv per mobilitet te mesit, kontroll te legenit, aktivizim gluteal dhe stabilizim te trungut.",
    goals: ["Ulja e provokimit te dhimbjes", "Rikthim i levizjes se kontrolluar", "Aktivizim gluteal dhe core"],
    redFlags: ["Mpirje progresive", "Dobesi ne kembe", "Dhimbje qe rritet gjate ushtrimit"],
    safetyNote: `${painStopRule} Nese ka mpirje progresive, dobesi ose humbje kontrolli, kerko vleresim mjekesor. ${aiRule}`,
    exercises: [
      { exerciseName: "Pelvic tilt", dayNumber: 1, sets: 2, reps: 12, frequency: "Cdo dite", instructions: "Kontrollo legenin me frymemarrje te qete. Levizja duhet te jete e vogel dhe pa dhimbje te forte.", aiRecommended: true },
      { exerciseName: "Cat cow", dayNumber: 1, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Leviz shtyllen ngadale, pa kompensim te qafes dhe pa e shtyre ne dhimbje.", aiRecommended: true },
      { exerciseName: "Piriformis stretch", dayNumber: 2, sets: 3, reps: null, frequency: "3 x 30 sek", instructions: "Mbaje shtrirjen lehte. Nuk duhet te provokoje mpirje ose therje te forte." },
      { exerciseName: "Glute bridge", dayNumber: 3, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Aktivizo gluteus-in, ngrije legenin ngadale dhe mos e harko teper mesin.", aiRecommended: true },
      { exerciseName: "Bird dog", dayNumber: 4, sets: 2, reps: 8, frequency: "5 here/jave", instructions: "Mbaje trungun stabil. Levize krahun dhe kemben ngadale pa rotacion te legenit.", aiRecommended: true },
    ],
  },
  {
    key: "neck_pain",
    title: "Program rehabilitimi 10 dite - Dhimbje qafe",
    category: "Cervical / posture",
    diagnosisLabel: "Dhimbje qafe / tension cervikal",
    durationDays: 10,
    shortDescription: "Plan i bute per kontroll te qafes, posture, aktivizim skapular dhe ulje te tensionit muskulor.",
    goals: ["Vetedije posturale", "Kontroll i qafes", "Stabilizim skapular"],
    redFlags: ["Marramendje", "Mpirje ne krah", "Dhimbje koke e re ose shume e forte"],
    safetyNote: `Nese shfaqet marramendje, mpirje ne krah ose dhimbje e forte, pacienti ndalon dhe kontakton fizioterapeutin. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Chin tuck", dayNumber: 1, sets: 2, reps: 8, frequency: "Cdo dite", instructions: "Terhiq mjekren lehte prapa sikur po krijon mjekerr te dyfishte. Mos e perkul qafen poshte.", aiRecommended: true },
      { exerciseName: "Scapular setting", dayNumber: 1, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Afro shpatullat lehte mbrapa-poshte, pa i ngritur drejt vesheve.", aiRecommended: true },
      { exerciseName: "Thoracic rotation", dayNumber: 2, sets: 2, reps: 8, frequency: "Cdo dite", instructions: "Rrotullo kraharorin ngadale. Qafa qendron neutrale dhe levizja nuk duhet te shkaktoje marramendje." },
      { exerciseName: "Cat cow", dayNumber: 3, sets: 2, reps: 8, frequency: "Cdo dite", instructions: "Leviz shtyllen ngadale dhe mbaje qafen neutrale, pa e shtyre ne fund-range.", aiRecommended: true },
    ],
  },
  {
    key: "knee_rehab",
    title: "Program rehabilitimi 14 dite - Knee rehab",
    category: "Knee / lower limb",
    diagnosisLabel: "Rehabilitim gjuri / forcim bazik",
    durationDays: 14,
    shortDescription: "Plan bazik per aktivizim te quadriceps, kontroll te gjurit dhe rikthim gradual te funksionit.",
    goals: ["Aktivizim quadriceps", "Kontroll i linjes se gjurit", "Rikthim gradual i ngarkeses"],
    redFlags: ["Enjtje qe rritet", "Bllokim i gjurit", "Dhimbje e forte ose paqendrueshmeri"],
    safetyNote: `Nese gjuri enjtet, bllokohet ose dhimbja rritet, ndalo ushtrimin dhe kontakto fizioterapeutin. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Quad sets", dayNumber: 1, sets: 3, reps: 10, frequency: "Cdo dite", instructions: "Shtrengo muskujt para te kofshes dhe mbaje 3-5 sekonda. Mos e shty gjurin ne dhimbje." },
      { exerciseName: "Heel slides", dayNumber: 1, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Rreshqite thembren drejt vitheve ngadale, vetem deri ku lejon dhimbja." },
      { exerciseName: "Straight leg raise", dayNumber: 2, sets: 2, reps: 8, frequency: "5 here/jave", instructions: "Mbaje gjurin drejt, ngrije kemben ngadale dhe mos e humb kontrollin gjate kthimit.", aiRecommended: true },
      { exerciseName: "Glute bridge", dayNumber: 3, sets: 2, reps: 10, frequency: "5 here/jave", instructions: "Aktivizo gluteus-in dhe mbaje gjurin ne linje me kemben.", aiRecommended: true },
      { exerciseName: "Sit to stand", dayNumber: 5, sets: 2, reps: 8, frequency: "3-4 here/jave", instructions: "Cohu nga karrigia me kontroll. Gjuri nuk duhet te bjere brenda.", aiRecommended: true },
    ],
  },
  {
    key: "shoulder_mobility",
    title: "Program rehabilitimi 10 dite - Shoulder mobility",
    category: "Shoulder / mobility",
    diagnosisLabel: "Mobilitet shpatulle / kontroll skapular",
    durationDays: 10,
    shortDescription: "Plan i lehte per mobilitet te shpatulles, kontroll te skapules dhe levizje pa provokim te dhimbjes.",
    goals: ["Mobilitet pa provokim", "Kontroll skapular", "Rikthim gradual i amplitudes"],
    redFlags: ["Dhimbje nate e forte", "Dobesi e papritur", "Humbje progresive e levizjes"],
    safetyNote: `Nese dhimbja e shpatulles rritet ose shfaqet dobesi e papritur, ndalo ushtrimin dhe kontakto fizioterapeutin. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Pendulum shoulder exercise", dayNumber: 1, sets: 2, reps: 30, frequency: "Cdo dite", instructions: "Lejo krahun te levize lehte si pendulum. Mos e ngrit me force." },
      { exerciseName: "Scapular setting", dayNumber: 1, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Vendose skapulen mbrapa-poshte lehte, pa tension ne qafe.", aiRecommended: true },
      { exerciseName: "Wall slides", dayNumber: 2, sets: 2, reps: 8, frequency: "Cdo dite", instructions: "Rreshqit krahet ngadale ne mur. Ndalo para dhimbjes se forte.", aiRecommended: true },
      { exerciseName: "Thoracic rotation", dayNumber: 3, sets: 2, reps: 8, frequency: "Cdo dite", instructions: "Rrotullo kraharorin ngadale per te ndihmuar levizjen e shpatulles." },
    ],
  },
  {
    key: "core_stability",
    title: "Program rehabilitimi 14 dite - Core stability",
    category: "Core / stabilization",
    diagnosisLabel: "Stabilizim core / kontroll i trungut",
    durationDays: 14,
    shortDescription: "Plan per kontroll te legenit, stabilizim te mesit dhe rikthim gradual te levizjes.",
    goals: ["Kontroll i legenit", "Stabilitet i trungut", "Forcim gradual pa provokim"],
    redFlags: ["Dhimbje qe perhapet poshte kembes", "Dobesi progresive", "Dhimbje e forte gjate stabilizimit"],
    safetyNote: `Ushtrimet duhet te behen pa dhimbje te forte. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Pelvic tilt", dayNumber: 1, sets: 2, reps: 12, frequency: "Cdo dite", instructions: "Mbaje levizjen te vogel, te kontrolluar dhe me frymemarrje te qete.", aiRecommended: true },
      { exerciseName: "Dead bug", dayNumber: 2, sets: 2, reps: 8, frequency: "5 here/jave", instructions: "Mbaje mesin neutral. Leviz ngadale krahun dhe kemben pa e humbur kontrollin.", aiRecommended: true },
      { exerciseName: "Glute bridge", dayNumber: 3, sets: 2, reps: 10, frequency: "5 here/jave", instructions: "Ngrije legenin ngadale dhe kontrollo kthimin poshte.", aiRecommended: true },
      { exerciseName: "Bird dog", dayNumber: 4, sets: 2, reps: 8, frequency: "4 here/jave", instructions: "Mbaje trungun stabil dhe mos lejo rotacion te legenit.", aiRecommended: true },
    ],
  },
  {
    key: "general_mobility",
    title: "Program rehabilitimi 7 dite - General mobility",
    category: "General mobility",
    diagnosisLabel: "Mobilitet i pergjithshem / rikthim gradual",
    durationDays: 7,
    shortDescription: "Plan i thjeshte per paciente qe kane nevoje per levizje te bute dhe progres gradual.",
    goals: ["Rikthim i levizjes", "Ulja e ngurtesise", "Krijim rutine te sigurt"],
    redFlags: ["Dhimbje e forte", "Marramendje", "Perkeqesim pas cdo seance"],
    safetyNote: `Pacienti duhet te punoje brenda tolerances dhe te ndaloje ne dhimbje te forte. ${painStopRule} ${aiRule}`,
    exercises: [
      { exerciseName: "Cat cow", dayNumber: 1, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Leviz ngadale dhe pa dhimbje te forte.", aiRecommended: true },
      { exerciseName: "Thoracic rotation", dayNumber: 1, sets: 2, reps: 8, frequency: "Cdo dite", instructions: "Rrotullo kraharorin lehte dhe mbaje frymemarrjen te qete." },
      { exerciseName: "Glute bridge", dayNumber: 2, sets: 2, reps: 10, frequency: "Cdo dite", instructions: "Ngrije legenin me kontroll dhe kthehu ngadale.", aiRecommended: true },
      { exerciseName: "Piriformis stretch", dayNumber: 2, sets: 3, reps: null, frequency: "3 x 30 sek", instructions: "Mbaje shtrirjen e lehte, pa therje apo mpirje." },
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
