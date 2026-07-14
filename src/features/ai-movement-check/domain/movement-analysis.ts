export type MovementLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type MovementAlertType = "good" | "needs_attention" | "contact_physio";

export type MovementAnalysisResult =
  | {
      status: "ready";
      score: number;
      alertType: MovementAlertType;
      feedback: string;
      landmarksDetected: number;
    }
  | {
      status: "retry";
      reason: "no_pose" | "insufficient_visibility";
      feedback: string;
      landmarksDetected: number;
    };

const KEY_POINTS = [11, 12, 23, 24, 25, 26, 27, 28] as const;
const MINIMUM_VISIBLE_KEY_POINTS = 4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: MovementLandmark, b: MovementLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function deriveMovementAlertType(score: number): MovementAlertType {
  return score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";
}

export function deriveMovementFeedback(alertType: MovementAlertType): string {
  if (alertType === "good") {
    return "Lëvizja duket e kontrolluar. Vazhdo ngadalë dhe ndalo nëse shfaqet dhimbje e fortë.";
  }
  if (alertType === "needs_attention") {
    return "Lëvizja u pa, por bëje më ngadalë dhe mbaje trupin më stabil.";
  }
  return "Lëvizja kërkon rishikim nga fizioterapeuti. Ky rezultat nuk është diagnozë dhe nuk ndryshon planin tënd.";
}

export function analyzeMovementPose(
  landmarks: MovementLandmark[] | undefined,
): MovementAnalysisResult {
  if (!landmarks?.length) {
    return {
      status: "retry",
      reason: "no_pose",
      feedback: "Trupi nuk u detektua. Vendose pajisjen më larg, mbaje stabil dhe provo përsëri.",
      landmarksDetected: 0,
    };
  }

  const visible = KEY_POINTS.filter(
    (index) => (landmarks[index]?.visibility ?? 0.8) > 0.45,
  );
  if (visible.length < MINIMUM_VISIBLE_KEY_POINTS) {
    return {
      status: "retry",
      reason: "insufficient_visibility",
      feedback: "Trupi nuk shihet mjaftueshëm qartë. Rregullo kamerën dhe provo përsëri; ky frame nuk do të ruhet.",
      landmarksDetected: visible.length,
    };
  }

  const visibilityScore = Math.round((visible.length / KEY_POINTS.length) * 35);
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  let stabilityScore = 25;
  let symmetryScore = 25;
  let controlScore = 15;

  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipTilt = Math.abs(leftHip.y - rightHip.y);
    stabilityScore = Math.round(clamp(25 - (shoulderTilt + hipTilt) * 170, 4, 25));
  }

  if (leftHip && rightHip && leftKnee && rightKnee) {
    const difference = Math.abs(
      distance(leftHip, leftKnee) - distance(rightHip, rightKnee),
    );
    symmetryScore = Math.round(clamp(25 - difference * 140, 4, 25));
  }

  if (leftShoulder && rightShoulder && leftHip && rightHip && leftKnee && rightKnee) {
    const trunkCenter = (
      leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x
    ) / 4;
    const kneeCenter = (leftKnee.x + rightKnee.x) / 2;
    controlScore = Math.round(clamp(15 - Math.abs(trunkCenter - kneeCenter) * 80, 3, 15));
  }

  const score = Math.round(clamp(
    visibilityScore + stabilityScore + symmetryScore + controlScore,
    0,
    100,
  ));
  const alertType = deriveMovementAlertType(score);

  return {
    status: "ready",
    score,
    alertType,
    feedback: deriveMovementFeedback(alertType),
    landmarksDetected: visible.length,
  };
}
