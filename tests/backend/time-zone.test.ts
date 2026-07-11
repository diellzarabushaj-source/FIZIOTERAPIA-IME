import assert from "node:assert/strict";
import test from "node:test";
import { getUtcDayRange } from "../../lib/backend/time-zone.ts";

test("winter clinical day uses Central European Time", () => {
  const { start, end } = getUtcDayRange(new Date("2026-01-15T12:00:00Z"));
  assert.equal(start.toISOString(), "2026-01-14T23:00:00.000Z");
  assert.equal(end.toISOString(), "2026-01-15T23:00:00.000Z");
});

test("summer clinical day uses Central European Summer Time", () => {
  const { start, end } = getUtcDayRange(new Date("2026-07-15T12:00:00Z"));
  assert.equal(start.toISOString(), "2026-07-14T22:00:00.000Z");
  assert.equal(end.toISOString(), "2026-07-15T22:00:00.000Z");
});

test("DST transition days preserve the real local calendar day", () => {
  const spring = getUtcDayRange(new Date("2026-03-29T12:00:00Z"));
  const autumn = getUtcDayRange(new Date("2026-10-25T12:00:00Z"));

  assert.equal(spring.end.getTime() - spring.start.getTime(), 23 * 60 * 60 * 1000);
  assert.equal(autumn.end.getTime() - autumn.start.getTime(), 25 * 60 * 60 * 1000);
});
