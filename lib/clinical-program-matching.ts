import {
  clinicalProgramTemplates,
  type ClinicalProgramKey,
  type ClinicalProgramTemplate,
} from "@/lib/clinical-programs";

const diagnosisAliases: Record<ClinicalProgramKey, readonly string[]> = {
  lumbosciatica: [
    "lumbosciatica",
    "sciatica",
    "lumbar radiculopathy",
    "lumbar disc",
    "low back pain",
    "dhimbje mesi",
    "hernia diskale",
  ],
  neck_pain: [
    "neck pain",
    "cervicalgia",
    "cervical",
    "dhimbje qafe",
    "tension cervikal",
    "whiplash",
  ],
  knee_rehab: [
    "knee",
    "gju",
    "acl",
    "meniscus",
    "menisk",
    "patellofemoral",
    "gonarthrosis",
    "knee osteoarthritis",
    "total knee replacement",
  ],
  shoulder_mobility: [
    "shoulder",
    "shpatull",
    "frozen shoulder",
    "adhesive capsulitis",
    "rotator cuff",
    "impingement",
  ],
  core_stability: [
    "core",
    "stability",
    "stabilizim",
    "postural",
    "posture",
    "kontroll i trungut",
  ],
  general_mobility: [
    "general mobility",
    "mobilitet i pergjithshem",
    "mobilitet",
    "deconditioning",
    "rikthim gradual",
  ],
};

export function normalizeClinicalText(value: string | null | undefined): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function clinicalTemplateMatchesDiagnosis(
  template: ClinicalProgramTemplate,
  diagnosis: string | null | undefined,
): boolean {
  const normalizedDiagnosis = normalizeClinicalText(diagnosis);
  if (!normalizedDiagnosis) return false;

  const searchableTemplate = normalizeClinicalText(
    [template.title, template.category, template.diagnosisLabel].join(" "),
  );
  if (
    searchableTemplate.includes(normalizedDiagnosis) ||
    normalizedDiagnosis.includes(normalizeClinicalText(template.diagnosisLabel))
  ) {
    return true;
  }

  return diagnosisAliases[template.key].some((alias) => {
    const normalizedAlias = normalizeClinicalText(alias);
    return normalizedDiagnosis.includes(normalizedAlias) || normalizedAlias.includes(normalizedDiagnosis);
  });
}

export function templatesForDiagnosis(
  diagnosis: string | null | undefined,
): ClinicalProgramTemplate[] {
  return clinicalProgramTemplates.filter((template) =>
    clinicalTemplateMatchesDiagnosis(template, diagnosis),
  );
}

export function templateExerciseNamesAvailable(
  template: ClinicalProgramTemplate,
  exerciseNames: Iterable<string>,
): boolean {
  const available = new Set(Array.from(exerciseNames, normalizeClinicalText));
  return template.exercises.every((exercise) =>
    available.has(normalizeClinicalText(exercise.exerciseName)),
  );
}

export function findClinicalProgramTemplate(
  key: string | null | undefined,
): ClinicalProgramTemplate | null {
  return clinicalProgramTemplates.find((template) => template.key === key) || null;
}
