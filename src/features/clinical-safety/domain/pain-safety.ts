export const PAIN_STOP_THRESHOLD = 7;
export const PAIN_SCALE_MIN = 0;
export const PAIN_SCALE_MAX = 10;

export type PainSafetyDecision =
  | {
      action: "continue_within_plan";
      painScore: number;
      message: "Vazhdo vetëm sipas planit të fizioterapistit.";
    }
  | {
      action: "stop_and_contact_physio";
      painScore: number;
      message: "Ndalo ushtrimin dhe kontakto fizioterapistin.";
    };

export function parsePainScore(value: unknown): number {
  const score = Number(value);
  if (!Number.isInteger(score) || score < PAIN_SCALE_MIN || score > PAIN_SCALE_MAX) {
    throw new RangeError(`painScore must be an integer from ${PAIN_SCALE_MIN} to ${PAIN_SCALE_MAX}`);
  }
  return score;
}

export function evaluatePainSafety(value: unknown): PainSafetyDecision {
  const painScore = parsePainScore(value);
  if (painScore >= PAIN_STOP_THRESHOLD) {
    return {
      action: "stop_and_contact_physio",
      painScore,
      message: "Ndalo ushtrimin dhe kontakto fizioterapistin.",
    };
  }

  return {
    action: "continue_within_plan",
    painScore,
    message: "Vazhdo vetëm sipas planit të fizioterapistit.",
  };
}
