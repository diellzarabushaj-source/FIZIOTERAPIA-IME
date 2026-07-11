import assert from "node:assert/strict";
import test from "node:test";
import {
  clinicDateInputToUtcNoon,
  clinicDateTimeInputToUtc,
  getClinicDateInput,
  getClinicDateTimeInput,
} from "../../lib/backend/time-zone.ts";

test("clinic date inputs follow Europe/Belgrade instead of server UTC", () => {
  assert.equal(getClinicDateInput(new Date("2026-07-10T22:30:00.000Z")), "2026-07-11");
  assert.equal(getClinicDateInput(new Date("2026-01-10T23:30:00.000Z")), "2026-01-11");
  assert.equal(getClinicDateTimeInput(new Date("2026-07-10T22:30:00.000Z")), "2026-07-11T00:30");
});

test("nonexistent DST clock times are rejected", () => {
  assert.equal(clinicDateTimeInputToUtc("2026-03-29T02:30"), null);
  assert.equal(clinicDateTimeInputToUtc("2026-02-30T12:00"), null);
});

test("valid local appointments convert to stable UTC instants", () => {
  assert.equal(clinicDateTimeInputToUtc("2026-07-11T10:00")?.toISOString(), "2026-07-11T08:00:00.000Z");
  assert.equal(clinicDateTimeInputToUtc("2026-01-11T10:00")?.toISOString(), "2026-01-11T09:00:00.000Z");
  assert.equal(clinicDateInputToUtcNoon("2026-07-11")?.toISOString(), "2026-07-11T10:00:00.000Z");
});
