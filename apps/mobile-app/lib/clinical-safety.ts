export const MOBILE_PAIN_STOP_THRESHOLD = 7;
export const MOBILE_PAIN_MIN = 0;
export const MOBILE_PAIN_MAX = 10;

export function mustStopExerciseForPain(score: number) {
  if (!Number.isInteger(score) || score < MOBILE_PAIN_MIN || score > MOBILE_PAIN_MAX) {
    throw new RangeError(`Pain score must be an integer from ${MOBILE_PAIN_MIN} to ${MOBILE_PAIN_MAX}.`);
  }
  return score >= MOBILE_PAIN_STOP_THRESHOLD;
}
