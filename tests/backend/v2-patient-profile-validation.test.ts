import assert from "node:assert/strict";
import test from "node:test";
import { validatePatientProfile } from "../../src/features/patients/domain/patient-profile.ts";

const now = new Date("2026-07-13T12:00:00.000Z");

test("normalizes and accepts a valid patient profile", () => {
  assert.deepEqual(
    validatePatientProfile(
      {
        firstName: "  Ana   Maria ",
        lastName: "  Krasniqi ",
        dateOfBirth: "1994-02-28",
        phone: " +383 44 123 456 ",
        diagnosis: " Dhimbje   lumbare ",
      },
      { now },
    ),
    {
      ok: true,
      data: {
        firstName: "Ana Maria",
        lastName: "Krasniqi",
        dateOfBirth: "1994-02-28",
        phone: "+383 44 123 456",
        diagnosis: "Dhimbje lumbare",
      },
    },
  );
});

test("rejects impossible calendar dates", () => {
  const result = validatePatientProfile(
    { firstName: "Ana", lastName: "Krasniqi", dateOfBirth: "2025-02-30" },
    { now },
  );

  assert.equal(result.ok, false);
  if (result.ok === false) assert.equal(result.fieldErrors.dateOfBirth, "Zgjidh një datëlindje valide.");
});

test("rejects future dates", () => {
  const result = validatePatientProfile(
    { firstName: "Ana", lastName: "Krasniqi", dateOfBirth: "2026-07-14" },
    { now },
  );

  assert.equal(result.ok, false);
  if (result.ok === false) assert.equal(result.fieldErrors.dateOfBirth, "Datëlindja nuk mund të jetë në të ardhmen.");
});

test("accepts an elderly patient's valid date of birth", () => {
  const result = validatePatientProfile(
    { firstName: "Mara", lastName: "Gashi", dateOfBirth: "1936-01-01" },
    { now },
  );

  assert.equal(result.ok, true);
});

test("returns field-specific errors for missing names", () => {
  const result = validatePatientProfile(
    { firstName: "A", lastName: "", dateOfBirth: "2000-01-01" },
    { now },
  );

  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.ok(result.fieldErrors.firstName);
    assert.ok(result.fieldErrors.lastName);
  }
});
