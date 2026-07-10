import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanText,
  optionalText,
  validatePainScore,
  validatePositiveInteger,
  validateUuid,
} from "../../lib/backend/validation.ts";

test("cleanText trims, normalizes whitespace and enforces limits", () => {
  assert.equal(cleanText("  Arta   Demo  ", 50), "Arta Demo");
  assert.equal(cleanText("abcdefgh", 4), "abcd");
  assert.equal(optionalText("   ", 20), null);
});

test("pain score accepts integers from 0 to 10 only", () => {
  assert.equal(validatePainScore(0).ok, true);
  assert.equal(validatePainScore(10).ok, true);
  assert.equal(validatePainScore(7).ok, true);
  assert.equal(validatePainScore(-1).ok, false);
  assert.equal(validatePainScore(11).ok, false);
  assert.equal(validatePainScore(7.5).ok, false);
});

test("positive integer validation enforces configured bounds", () => {
  assert.equal(validatePositiveInteger(1, "months", { min: 1, max: 24 }).ok, true);
  assert.equal(validatePositiveInteger(24, "months", { min: 1, max: 24 }).ok, true);
  assert.equal(validatePositiveInteger(0, "months", { min: 1, max: 24 }).ok, false);
  assert.equal(validatePositiveInteger(25, "months", { min: 1, max: 24 }).ok, false);
});

test("UUID validation rejects malformed resource identifiers", () => {
  assert.equal(validateUuid("22222222-2222-4222-8222-222222222222").ok, true);
  assert.equal(validateUuid("not-a-uuid").ok, false);
  assert.equal(validateUuid("").ok, false);
});
