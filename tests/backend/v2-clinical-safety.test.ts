import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluatePainSafety,
  PAIN_STOP_THRESHOLD,
  parsePainScore,
} from "../../src/features/clinical-safety/domain/pain-safety.ts";

test("allows scores below the stop threshold only within the professional plan", () => {
  for (let score = 0; score < PAIN_STOP_THRESHOLD; score += 1) {
    assert.deepEqual(evaluatePainSafety(score), {
      action: "continue_within_plan",
      painScore: score,
      message: "Vazhdo vetëm sipas planit të fizioterapistit.",
    });
  }
});

test("stops exercise at seven out of ten and above", () => {
  for (let score = PAIN_STOP_THRESHOLD; score <= 10; score += 1) {
    assert.deepEqual(evaluatePainSafety(score), {
      action: "stop_and_contact_physio",
      painScore: score,
      message: "Ndalo ushtrimin dhe kontakto fizioterapistin.",
    });
  }
});

test("rejects out-of-range and non-integer pain values", () => {
  for (const value of [-1, 11, 7.5, "pain"]) {
    assert.throws(() => parsePainScore(value), RangeError);
  }
});
