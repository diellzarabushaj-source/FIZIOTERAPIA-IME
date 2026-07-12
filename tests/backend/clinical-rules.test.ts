import assert from "node:assert/strict";
import test from "node:test";
import {
  CLINICAL_RULES_VERSION,
  clinicalRules,
  getVersionedAiAlert,
  isHighPainScore,
} from "../../lib/backend/clinical-rules.ts";

test("AI alert thresholds come from one versioned source", () => {
  assert.equal(getVersionedAiAlert(0).alertType, "contact_physio");
  assert.equal(getVersionedAiAlert(clinicalRules.lowAiScoreThreshold - 1).alertType, "contact_physio");
  assert.equal(getVersionedAiAlert(clinicalRules.lowAiScoreThreshold).alertType, "needs_attention");
  assert.equal(getVersionedAiAlert(clinicalRules.needsAttentionAiScoreThreshold).alertType, "good");
  assert.equal(getVersionedAiAlert(100).rulesVersion, CLINICAL_RULES_VERSION);
});

test("invalid AI scores fail closed", () => {
  assert.throws(() => getVersionedAiAlert(-1), /between 0 and 100/);
  assert.throws(() => getVersionedAiAlert(101), /between 0 and 100/);
  assert.throws(() => getVersionedAiAlert(Number.NaN), /between 0 and 100/);
});

test("high pain threshold is inclusive", () => {
  assert.equal(isHighPainScore(clinicalRules.highPainThreshold - 1), false);
  assert.equal(isHighPainScore(clinicalRules.highPainThreshold), true);
});
