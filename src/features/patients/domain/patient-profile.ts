export const PATIENT_NAME_MAX_LENGTH = 80;
export const PATIENT_PHONE_MAX_LENGTH = 40;
export const PATIENT_DIAGNOSIS_MAX_LENGTH = 1500;

export type PatientProfileInput = {
  firstName: unknown;
  lastName: unknown;
  dateOfBirth: unknown;
  phone?: unknown;
  diagnosis?: unknown;
};

export type ValidPatientProfile = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string | null;
  diagnosis: string | null;
};

export type PatientProfileValidationResult =
  | { ok: true; data: ValidPatientProfile }
  | { ok: false; fieldErrors: Record<string, string> };

function normalizeSingleLine(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function optionalSingleLine(value: unknown, maxLength: number): string | null {
  const normalized = normalizeSingleLine(value, maxLength);
  return normalized || null;
}

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isFutureDate(value: string, now: Date): boolean {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) > todayUtc;
}

export function validatePatientProfile(
  input: PatientProfileInput,
  options: { now?: Date } = {},
): PatientProfileValidationResult {
  const now = options.now ?? new Date();
  const firstName = normalizeSingleLine(input.firstName, PATIENT_NAME_MAX_LENGTH);
  const lastName = normalizeSingleLine(input.lastName, PATIENT_NAME_MAX_LENGTH);
  const dateOfBirth = normalizeSingleLine(input.dateOfBirth, 10);
  const fieldErrors: Record<string, string> = {};

  if (firstName.length < 2) {
    fieldErrors.firstName = "Shkruaj së paku 2 karaktere.";
  }
  if (lastName.length < 2) {
    fieldErrors.lastName = "Shkruaj së paku 2 karaktere.";
  }
  if (!isValidCalendarDate(dateOfBirth)) {
    fieldErrors.dateOfBirth = "Zgjidh një datëlindje valide.";
  } else if (isFutureDate(dateOfBirth, now)) {
    fieldErrors.dateOfBirth = "Datëlindja nuk mund të jetë në të ardhmen.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      dateOfBirth,
      phone: optionalSingleLine(input.phone, PATIENT_PHONE_MAX_LENGTH),
      diagnosis: optionalSingleLine(input.diagnosis, PATIENT_DIAGNOSIS_MAX_LENGTH),
    },
  };
}
