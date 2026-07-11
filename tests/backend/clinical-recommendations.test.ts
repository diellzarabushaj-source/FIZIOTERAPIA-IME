import assert from "node:assert/strict";
import test from "node:test";
import { generateRecommendations } from "../../lib/clinical/scoring.ts";

test("ACL recommendations rank quadriceps setting first", () => {
  const result = generateRecommendations({
    conditionSlug: "acl-reconstruction",
    selectedFlags: ["goal-strength"],
    painScore: 2,
    maxDifficulty: "intermediate"
  });

  assert.equal(result.recommendations[0]?.exercise.slug, "quadriceps-setting");
  assert.ok((result.recommendations[0]?.compatibilityScore ?? 0) >= 90);
});

test("extension lag blocks straight leg raise", () => {
  const result = generateRecommendations({
    conditionSlug: "acl-reconstruction",
    selectedFlags: ["extension-lag"],
    painScore: 2,
    maxDifficulty: "intermediate"
  });

  assert.equal(result.recommendations.some((item) => item.exercise.slug === "straight-leg-raise"), false);
});

test("pain 7/10 blocks every recommendation", () => {
  const result = generateRecommendations({
    conditionSlug: "non-specific-low-back-pain",
    painScore: 7
  });

  assert.equal(result.recommendations.length, 0);
});

test("unknown condition does not surface unverified exercises", () => {
  const result = generateRecommendations({ conditionSlug: "unknown-condition", painScore: 0 });
  assert.equal(result.recommendations.length, 0);
});
