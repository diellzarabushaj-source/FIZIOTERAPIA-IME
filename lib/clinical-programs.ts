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
  safetyNote: string;
  exercises: ClinicalProgramExercise[];
};

export const clinicalProgramTemplates: ClinicalProgramTemplate[] = [
  {
    key: "lumbosciatica",
    title: "Program rehabilitimi 14 ditë – Lumbosciatica",
    category: "Low back / Sciatica",
    diagnosisLabel: "Lumbosciatica / dhimbje mesi",
    durationDays: 14,
    shortDescription: "Plan bazik për stabilizim të mesit, mobilitet të legenit dhe ulje të tensionit në nervin sciatic.",
    safetyNote: "Nëse dhimbja shkon 7/10 ose më shumë, pacienti ndalon ushtrimin dhe kontakton fizioterapeutin.",
    exercises: [
      {
        exerciseName: "Glute bridge",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Aktivizo gluteus-in, ngrije legenin ngadalë dhe mos e harko tepër mesin.",
        aiRecommended: true,
      },
      {
        exerciseName: "Cat cow",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Lëviz shtyllën ngadalë, pa dhimbje të fortë dhe pa kompensim të qafës.",
        aiRecommended: true,
      },
      {
        exerciseName: "Piriformis stretch",
        dayNumber: 2,
        sets: 3,
        reps: null,
        frequency: "3 × 30 sek",
        instructions: "Mbaje shtrirjen lehtë. Nuk duhet të provokojë mpirje ose therje të fortë.",
      },
      {
        exerciseName: "Pelvic tilt",
        dayNumber: 2,
        sets: 2,
        reps: 12,
        frequency: "Çdo ditë",
        instructions: "Kontrollo legenin me frymëmarrje të qetë dhe mos shty me forcë.",
        aiRecommended: true,
      },
    ],
  },
  {
    key: "neck_pain",
    title: "Program rehabilitimi 10 ditë – Dhimbje qafe",
    category: "Cervical / posture",
    diagnosisLabel: "Dhimbje qafe / tension cervikal",
    durationDays: 10,
    shortDescription: "Plan i lehtë për kontroll posture, mobilitet të butë dhe ulje të tensionit muskulor.",
    safetyNote: "Nëse shfaqet marramendje, mpirje në krah ose dhimbje e fortë, pacienti ndalon dhe kontakton fizioterapeutin.",
    exercises: [
      {
        exerciseName: "Cat cow",
        dayNumber: 1,
        sets: 2,
        reps: 8,
        frequency: "Çdo ditë",
        instructions: "Lëviz ngadalë dhe mbaje qafën neutrale, pa e shtyrë në fund-range.",
        aiRecommended: true,
      },
      {
        exerciseName: "Pelvic tilt",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Përdore për vetëdije posturale dhe kontroll të trungut.",
        aiRecommended: true,
      },
      {
        exerciseName: "Glute bridge",
        dayNumber: 2,
        sets: 2,
        reps: 10,
        frequency: "3–4 herë/javë",
        instructions: "Mbaje trungun stabil. Mos e tensiono qafën gjatë ngritjes.",
      },
    ],
  },
  {
    key: "knee_rehab",
    title: "Program rehabilitimi 14 ditë – Knee rehab",
    category: "Knee / lower limb",
    diagnosisLabel: "Rehabilitim gjuri / forcim bazik",
    durationDays: 14,
    shortDescription: "Plan bazik për aktivizim të zinxhirit posterior dhe kontroll të lëvizjes pa ngarkesë të tepërt.",
    safetyNote: "Nëse gjuri ënjtet, bllokohet ose dhimbja rritet mbi 7/10, ndalo ushtrimin dhe kontakto fizioterapeutin.",
    exercises: [
      {
        exerciseName: "Glute bridge",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Aktivizo gluteus-in dhe mbaje gjurin në linjë me këmbën.",
        aiRecommended: true,
      },
      {
        exerciseName: "Pelvic tilt",
        dayNumber: 1,
        sets: 2,
        reps: 12,
        frequency: "Çdo ditë",
        instructions: "Kontrollo legenin dhe frymëmarrjen për stabilitet të trungut.",
        aiRecommended: true,
      },
      {
        exerciseName: "Cat cow",
        dayNumber: 2,
        sets: 2,
        reps: 8,
        frequency: "Çdo ditë",
        instructions: "Përdore si warm-up të butë para ushtrimeve të gjurit.",
      },
    ],
  },
  {
    key: "shoulder_mobility",
    title: "Program rehabilitimi 10 ditë – Shoulder mobility",
    category: "Shoulder / mobility",
    diagnosisLabel: "Mobilitet shpatulle / kontroll i trungut",
    durationDays: 10,
    shortDescription: "Plan i lehtë për mobilitet, kontroll të trungut dhe lëvizje pa provokim të dhimbjes.",
    safetyNote: "Nëse dhimbja e shpatullës rritet ose shfaqet dobësi e papritur, ndalo ushtrimin dhe kontakto fizioterapeutin.",
    exercises: [
      {
        exerciseName: "Cat cow",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Mbaje lëvizjen e butë dhe mos e shty shpatullën në dhimbje.",
        aiRecommended: true,
      },
      {
        exerciseName: "Pelvic tilt",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Fokus në kontroll të trungut dhe frymëmarrje.",
      },
      {
        exerciseName: "Glute bridge",
        dayNumber: 2,
        sets: 2,
        reps: 10,
        frequency: "3–4 herë/javë",
        instructions: "Mos e tensiono qafën ose shpatullat gjatë ngritjes.",
      },
    ],
  },
  {
    key: "core_stability",
    title: "Program rehabilitimi 14 ditë – Core stability",
    category: "Core / stabilization",
    diagnosisLabel: "Stabilizim core / kontroll i trungut",
    durationDays: 14,
    shortDescription: "Plan për kontroll të legenit, stabilizim të mesit dhe rikthim gradual të lëvizjes.",
    safetyNote: "Ushtrimet duhet të bëhen pa dhimbje të fortë. Dhimbje 7/10 ose më shumë = stop.",
    exercises: [
      {
        exerciseName: "Pelvic tilt",
        dayNumber: 1,
        sets: 2,
        reps: 12,
        frequency: "Çdo ditë",
        instructions: "Mbaje lëvizjen të vogël, të kontrolluar dhe me frymëmarrje të qetë.",
        aiRecommended: true,
      },
      {
        exerciseName: "Glute bridge",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Ngrije legenin ngadalë dhe kontrollo kthimin poshtë.",
        aiRecommended: true,
      },
      {
        exerciseName: "Cat cow",
        dayNumber: 2,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Përdore si mobilizim i butë para forcimit.",
      },
    ],
  },
  {
    key: "general_mobility",
    title: "Program rehabilitimi 7 ditë – General mobility",
    category: "General mobility",
    diagnosisLabel: "Mobilitet i përgjithshëm / rikthim gradual",
    durationDays: 7,
    shortDescription: "Plan i thjeshtë për pacientë që kanë nevojë për lëvizje të butë dhe progres gradual.",
    safetyNote: "Pacienti duhet të punojë brenda tolerancës dhe të ndalojë në dhimbje të fortë.",
    exercises: [
      {
        exerciseName: "Cat cow",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Lëviz ngadalë dhe pa dhimbje të fortë.",
        aiRecommended: true,
      },
      {
        exerciseName: "Glute bridge",
        dayNumber: 1,
        sets: 2,
        reps: 10,
        frequency: "Çdo ditë",
        instructions: "Ngrije legenin me kontroll dhe kthehu ngadalë.",
      },
      {
        exerciseName: "Piriformis stretch",
        dayNumber: 2,
        sets: 3,
        reps: null,
        frequency: "3 × 30 sek",
        instructions: "Mbaje shtrirjen e lehtë, pa therje apo mpirje.",
      },
    ],
  },
];

export const defaultClinicalProgramKey: ClinicalProgramKey = "lumbosciatica";

export function getClinicalProgramTemplate(key?: string | null) {
  return clinicalProgramTemplates.find((program) => program.key === key) || clinicalProgramTemplates[0];
}
