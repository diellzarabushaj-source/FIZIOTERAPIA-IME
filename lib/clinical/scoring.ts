import { demoConditionRules, demoExercises, demoFlagRules } from "./demo-exercises";
import type { Difficulty, ExerciseRecommendation, RecommendationInput, RecommendationResponse } from "./types";

const difficultyRank: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 };
const disclaimer = "Ky rezultat është vetëm renditje e përputhshmërisë. Nuk është diagnozë, nuk mat sigurinë në përqindje dhe kërkon miratim nga fizioterapeuti.";

export function generateRecommendations(input: RecommendationInput): RecommendationResponse {
  const flags = new Set(input.selectedFlags ?? []);
  const availableEquipment = new Set(input.availableEquipment ?? []);
  const maxDifficulty = input.maxDifficulty ?? "advanced";
  const painScore = Math.max(0, Math.min(10, input.painScore ?? 0));

  const recommendations: ExerciseRecommendation[] = demoExercises.map((exercise) => {
    const conditionRule = demoConditionRules.find((rule) => rule.conditionSlug === input.conditionSlug && rule.exerciseSlug === exercise.slug);
    let score = conditionRule?.baseScore ?? 35;
    let allowed = Boolean(conditionRule);
    const blockedBy: string[] = [];
    const reasons: ExerciseRecommendation["reasons"] = [];

    if (conditionRule) reasons.push({ kind: "condition", label: conditionRule.rationale, scoreDelta: conditionRule.baseScore });
    else reasons.push({ kind: "condition", label: "Nuk ka rregull të verifikuar për këtë gjendje.", scoreDelta: 0 });

    if (input.regionSlug && exercise.region !== input.regionSlug) {
      score -= 30;
      reasons.push({ kind: "condition", label: "Regjioni nuk përputhet me filtrin e zgjedhur.", scoreDelta: -30 });
    }

    if (difficultyRank[exercise.difficulty] > difficultyRank[maxDifficulty]) {
      allowed = false;
      blockedBy.push("Vështirësia tejkalon nivelin e zgjedhur.");
      reasons.push({ kind: "difficulty", label: "Ushtrimi është mbi nivelin maksimal të lejuar.", scoreDelta: -100 });
    }

    const missingEquipment = exercise.equipment.filter((item) => item !== "mur" && !availableEquipment.has(item));
    if (availableEquipment.size > 0 && missingEquipment.length > 0) {
      score -= 12;
      reasons.push({ kind: "equipment", label: `Mungon pajisja: ${missingEquipment.join(", ")}.`, scoreDelta: -12 });
    }

    for (const flagRule of demoFlagRules.filter((rule) => rule.exerciseSlug === exercise.slug && flags.has(rule.flagSlug))) {
      reasons.push({ kind: "safety", label: flagRule.rationale, scoreDelta: flagRule.scoreModifier });
      if (flagRule.action === "block") {
        allowed = false;
        blockedBy.push(flagRule.rationale);
      } else {
        score += flagRule.scoreModifier;
      }
    }

    const goalBoosts: Array<[string, typeof exercise.type]> = [
      ["goal-mobility", "mobility"],
      ["goal-strength", "strength"],
      ["goal-motor-control", "motor_control"]
    ];
    for (const [flag, type] of goalBoosts) {
      if (flags.has(flag) && exercise.type === type) {
        score += 12;
        reasons.push({ kind: "goal", label: "Përputhet me objektivin e zgjedhur.", scoreDelta: 12 });
      }
    }

    if (painScore >= 7) {
      allowed = false;
      blockedBy.push("Dhimbja është 7/10 ose më shumë: ndalo dhe kontakto fizioterapeutin.");
      reasons.push({ kind: "safety", label: "Aktivizohet rregulli i ndalimit për dhimbje të lartë.", scoreDelta: -100 });
    } else if (painScore >= 5) {
      score -= 15;
      reasons.push({ kind: "safety", label: "Dhimbja e rritur kërkon dozë dhe amplitudë më konservative.", scoreDelta: -15 });
    }

    return {
      exercise,
      compatibilityScore: allowed ? Math.max(0, Math.min(100, Math.round(score))) : 0,
      allowed,
      blockedBy,
      reasons,
      clinicalRationale: conditionRule?.rationale ?? "Kërkon vlerësim dhe lidhje klinike para përdorimit."
    };
  });

  const visible = recommendations
    .filter((item) => item.allowed && item.compatibilityScore >= 50)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, Math.max(1, Math.min(20, input.limit ?? 10)));

  return { disclaimer, generatedAt: new Date().toISOString(), input, recommendations: visible };
}
