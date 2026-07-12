export const CLINICAL_RULES_VERSION = "2026-07-12.1";

export const clinicalRules = Object.freeze({
  highPainThreshold: 7,
  lowAiScoreThreshold: 60,
  needsAttentionAiScoreThreshold: 80,
  patientCommentMaxLength: 500,
  aiFeedbackMaxLength: 600,
  clinicalTextMaxLength: 1_500,
});

export type AiAlertType = "good" | "needs_attention" | "contact_physio";

export function getVersionedAiAlert(score: number): {
  alertType: AiAlertType;
  rulesVersion: string;
} {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("AI score must be a number between 0 and 100.");
  }

  if (score < clinicalRules.lowAiScoreThreshold) {
    return { alertType: "contact_physio", rulesVersion: CLINICAL_RULES_VERSION };
  }
  if (score < clinicalRules.needsAttentionAiScoreThreshold) {
    return { alertType: "needs_attention", rulesVersion: CLINICAL_RULES_VERSION };
  }
  return { alertType: "good", rulesVersion: CLINICAL_RULES_VERSION };
}

export function isHighPainScore(score: number): boolean {
  return Number.isFinite(score) && score >= clinicalRules.highPainThreshold;
}
