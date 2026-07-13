import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CAMERA_CONSENT_MAX_AGE_MS,
  CAMERA_CONSENT_STORAGE_KEY,
  hasValidCameraConsent,
  recordCameraConsent,
} from "../../src/features/ai-movement-check/domain/camera-consent.ts";
import {
  analyzeMovementPose,
  type MovementLandmark,
} from "../../src/features/ai-movement-check/domain/movement-analysis.ts";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    values,
  };
}

function visiblePose(): MovementLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0.95,
  }));
  landmarks[11] = { x: 0.42, y: 0.28, visibility: 0.95 };
  landmarks[12] = { x: 0.58, y: 0.29, visibility: 0.95 };
  landmarks[23] = { x: 0.44, y: 0.55, visibility: 0.95 };
  landmarks[24] = { x: 0.56, y: 0.55, visibility: 0.95 };
  landmarks[25] = { x: 0.45, y: 0.76, visibility: 0.95 };
  landmarks[26] = { x: 0.55, y: 0.76, visibility: 0.95 };
  landmarks[27] = { x: 0.45, y: 0.94, visibility: 0.95 };
  landmarks[28] = { x: 0.55, y: 0.94, visibility: 0.95 };
  return landmarks;
}

test("camera consent is session-scoped, versioned and expires", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;

  assert.equal(hasValidCameraConsent(storage, now), false);
  assert.equal(recordCameraConsent(storage, now), true);
  assert.equal(hasValidCameraConsent(storage, now + 1_000), true);
  assert.equal(
    hasValidCameraConsent(storage, now + CAMERA_CONSENT_MAX_AGE_MS + 1),
    false,
  );
  assert.ok(storage.values.has(CAMERA_CONSENT_STORAGE_KEY));
});

test("camera consent fails closed for malformed or future records", () => {
  const storage = memoryStorage();
  storage.setItem(CAMERA_CONSENT_STORAGE_KEY, "not-json");
  assert.equal(hasValidCameraConsent(storage, 100_000), false);

  storage.setItem(CAMERA_CONSENT_STORAGE_KEY, JSON.stringify({
    version: 1,
    confirmedAt: 200_001,
  }));
  assert.equal(hasValidCameraConsent(storage, 100_000), false);
});

test("missing or poorly visible pose requests a retry and cannot create a score", () => {
  assert.deepEqual(analyzeMovementPose(undefined), {
    status: "retry",
    reason: "no_pose",
    feedback: "Trupi nuk u detektua. Vendose pajisjen më larg, mbaje stabil dhe provo përsëri.",
    landmarksDetected: 0,
  });

  const landmarks = visiblePose();
  for (const index of [11, 12, 23, 24, 25, 26, 27, 28]) {
    landmarks[index].visibility = 0.1;
  }
  const result = analyzeMovementPose(landmarks);
  assert.equal(result.status, "retry");
  assert.equal(result.landmarksDetected, 0);
});

test("a visible pose produces bounded movement feedback without diagnosis", () => {
  const result = analyzeMovementPose(visiblePose());
  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(Number.isInteger(result.score), true);
  assert.equal(result.score >= 0 && result.score <= 100, true);
  assert.doesNotMatch(result.feedback, /diagnoz[ëa]|përshkruaj|terapi autonome/i);
});

test("camera client pins assets, requires consent and never sends video or feedback", async () => {
  const source = await readFile(
    new URL("../../app/ai-check/MovementCheckClient.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /MEDIAPIPE_VERSION = "0\.10\.35"/);
  assert.doesNotMatch(source, /@latest|float16\/latest/);
  assert.match(source, /hasValidCameraConsent/);
  assert.match(source, /recordCameraConsent/);
  assert.match(source, /navigator\.mediaDevices\?\.getUserMedia/);
  assert.match(source, /NotAllowedError/);
  assert.match(source, /analysis\.status === "retry"/);
  assert.doesNotMatch(source, /body: JSON\.stringify\([\s\S]*feedback:/);
  assert.doesNotMatch(source, /FormData|canvas\.toBlob|videoBlob|frameData/);
});

test("AI endpoint derives feedback server-side and rejects cross-origin writes", async () => {
  const source = await readFile(
    new URL("../../app/api/patient/ai-check/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /trustedOrigin/);
  assert.match(source, /deriveAlertType/);
  assert.match(source, /deriveFeedback/);
  assert.match(source, /"Cache-Control": "no-store, max-age=0"/);
  assert.match(source, /requireAssignedPlanExercise/);
  assert.doesNotMatch(source, /body\.feedback|body\.alertType|video|frame/);
});
