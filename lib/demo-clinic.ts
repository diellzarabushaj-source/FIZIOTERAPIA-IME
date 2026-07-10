export const DEMO_PATIENT_CODE = "ARB-4821";
export const DEMO_PATIENT_USERNAME = "demo-patient-4821";
export const DEMO_PHYSIO_ID = "demo-physio-1";
export const DEMO_PATIENT_ID = "demo-patient-1";
export const DEMO_PLAN_ID = "demo-plan-1";

export function normalizeDemoCode(code?: string | null) {
  return (code || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isDemoPatientCode(code?: string | null) {
  return normalizeDemoCode(code) === DEMO_PATIENT_CODE;
}

function isoDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function isoDateTime(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

export const demoPhysioProfile = {
  id: DEMO_PHYSIO_ID,
  email: "demo@fizioterapiaime.com",
  role: "physio",
  full_name: "Dr. Diellza Rabushaj",
  clinic_name: "Fizioterapia ime Demo Clinic",
  status: "active",
};

export const demoSubscription = {
  id: "demo-subscription-1",
  plan_name: "Premium Physio",
  price: 29.9,
  currency: "EUR",
  status: "active",
  current_period_end: isoDate(30),
  invoice_reference: "DEMO-2990",
};

export const demoExercises = [
  {
    id: "demo-exercise-pelvic-tilt",
    name: "Pelvic tilt",
    category: "Low back",
    diagnosis: "Lumbosciatica",
    video_url: "/app-icon.svg",
    instructions_sq: "Shtrihu ne shpine, kontrollo legenin ngadale dhe mbaje frymemarrjen e qete.",
    ai_enabled: true,
    is_default: true,
    owner_physio_id: null,
    status: "published",
  },
  {
    id: "demo-exercise-cat-cow",
    name: "Cat cow",
    category: "Mobility",
    diagnosis: "Low back pain",
    video_url: null,
    instructions_sq: "Leviz shtyllen ngadale, pa e shtyre ne dhimbje te forte.",
    ai_enabled: true,
    is_default: true,
    owner_physio_id: null,
    status: "published",
  },
  {
    id: "demo-exercise-glute-bridge",
    name: "Glute bridge",
    category: "Strength",
    diagnosis: "Hip and low back control",
    video_url: "/brand-mark.svg",
    instructions_sq: "Aktivizo gluteus-in, ngri legenin me kontroll dhe kthehu ngadale.",
    ai_enabled: true,
    is_default: true,
    owner_physio_id: null,
    status: "published",
  },
  {
    id: "demo-exercise-hip-hinge-towel",
    name: "Hip hinge me peshqir",
    category: "Private clinic drill",
    diagnosis: "Lumbosciatica",
    video_url: "/splash.svg",
    instructions_sq: "Ushtrim privat i klinikes: mbaje shpinen neutrale dhe leviz nga ijet.",
    ai_enabled: false,
    is_default: false,
    owner_physio_id: DEMO_PHYSIO_ID,
    status: "published",
  },
];

export const demoPatient = {
  id: DEMO_PATIENT_ID,
  physio_id: DEMO_PHYSIO_ID,
  first_name: "Arber",
  last_name: "Rexha",
  phone: "+383 44 000 000",
  age: 34,
  diagnosis: "Lumbosciatica",
  patient_username: DEMO_PATIENT_USERNAME,
  patient_code: DEMO_PATIENT_CODE,
  status: "active",
  plans: [
    {
      id: DEMO_PLAN_ID,
      title: "Program rehabilitimi 14 dite",
      status: "active",
    },
  ],
};

export function getDemoPlan() {
  return {
    id: DEMO_PLAN_ID,
    title: "Program rehabilitimi 14 dite",
    start_date: isoDate(-2),
    end_date: isoDate(11),
    status: "active",
  };
}

export function getDemoPlanExercises() {
  const [pelvicTilt, catCow, gluteBridge, hipHinge] = demoExercises;

  return [
    {
      id: "demo-plan-exercise-1",
      plan_id: DEMO_PLAN_ID,
      exercise_id: pelvicTilt.id,
      sets: 2,
      reps: 12,
      frequency: "Cdo dite",
      day_number: 1,
      instructions: "Fillo me levizje te vogla. Nese dhimbja rritet, ndalo.",
      exercise_library: pelvicTilt,
    },
    {
      id: "demo-plan-exercise-2",
      plan_id: DEMO_PLAN_ID,
      exercise_id: catCow.id,
      sets: 2,
      reps: 10,
      frequency: "Cdo dite",
      day_number: 1,
      instructions: "Mbaje ritmin e ngadalshem dhe mos e shty qafen.",
      exercise_library: catCow,
    },
    {
      id: "demo-plan-exercise-3",
      plan_id: DEMO_PLAN_ID,
      exercise_id: gluteBridge.id,
      sets: 2,
      reps: 10,
      frequency: "5 here/jave",
      day_number: 2,
      instructions: "Ngrije legenin me kontroll dhe mbaje 2 sekonda lart.",
      exercise_library: gluteBridge,
    },
    {
      id: "demo-plan-exercise-4",
      plan_id: DEMO_PLAN_ID,
      exercise_id: hipHinge.id,
      sets: 3,
      reps: 8,
      frequency: "3 here/jave",
      day_number: 3,
      instructions: "Ky ushtrim eshte privat per kete fizioterapeut dhe shfaqet vetem ne dashboard-in e tij.",
      exercise_library: hipHinge,
    },
  ];
}

export function getDemoPatientDashboardData(options?: {
  painScore?: number | null;
  completedPlanExerciseId?: string | null;
  aiScore?: number | null;
}) {
  const planExercises = getDemoPlanExercises();
  const completedPlanExerciseId = options?.completedPlanExerciseId || planExercises[0].id;
  const painScore = typeof options?.painScore === "number" ? options.painScore : 3;
  const aiScore = typeof options?.aiScore === "number" ? options.aiScore : 84;

  return {
    patient: demoPatient,
    physio: {
      full_name: demoPhysioProfile.full_name,
      clinic_name: demoPhysioProfile.clinic_name,
    },
    activePlan: getDemoPlan(),
    planExercises,
    logs: [
      {
        id: "demo-log-current",
        patient_id: DEMO_PATIENT_ID,
        plan_exercise_id: completedPlanExerciseId,
        completed: true,
        pain_score: painScore,
        comment: painScore >= 7 ? "Demo: dhimbje e larte, pacienti duhet te ndaloje." : "Demo: ushtrimi u krye me kontroll.",
        completed_at: isoDateTime(0),
      },
      {
        id: "demo-log-yesterday",
        patient_id: DEMO_PATIENT_ID,
        plan_exercise_id: planExercises[1].id,
        completed: true,
        pain_score: 4,
        comment: "Pak tension, por brenda kufijve.",
        completed_at: isoDateTime(-1),
      },
    ],
    aiChecks: [
      {
        id: "demo-ai-current",
        patient_id: DEMO_PATIENT_ID,
        plan_exercise_id: planExercises[0].id,
        score: aiScore,
        feedback: aiScore < 60 ? "Ritmi eshte i shpejte. Ndalo dhe kontakto fizioterapeutin nese nuk je i/e sigurt." : "Levizje e kontrolluar. Vazhdo me te njejtin ritem.",
        alert_type: aiScore < 60 ? "contact_physio" : aiScore < 80 ? "needs_attention" : "good",
        created_at: isoDateTime(0),
      },
    ],
    messages: [
      {
        id: "demo-message-1",
        message: "Vazhdo me diten 2. Nese dhimbja shkon 7/10 ose me shume, ndalo dhe me shkruaj.",
        created_at: isoDateTime(-1),
      },
    ],
    error: null,
    demoMode: true,
  };
}

export function getDemoPhysioPortalData() {
  const patient = {
    ...demoPatient,
    plans: demoPatient.plans,
  };
  const dashboardData = getDemoPatientDashboardData();

  return {
    configured: false,
    demoMode: true,
    profile: demoPhysioProfile,
    subscription: demoSubscription,
    patients: [patient],
    exercises: demoExercises,
    logs: dashboardData.logs,
    aiChecks: dashboardData.aiChecks,
    error: "Demo mode: lidh Clerk dhe Supabase per ruajtje reale. Kjo faqe tregon rrjedhen e plote.",
  };
}
