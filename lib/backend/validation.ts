import { fail, ok, type BackendResult } from "./result.ts";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function optionalText(value: unknown, maxLength: number): string | null {
  const text = cleanText(value, maxLength);
  return text || null;
}

export function validateUuid(value: unknown, fieldName = "id"): BackendResult<string> {
  const id = cleanText(value, 64);
  if (!uuidPattern.test(id)) {
    return fail("VALIDATION_ERROR", "Identifikuesi nuk është valid.", {
      fieldErrors: { [fieldName]: "ID jo valide." },
    });
  }
  return ok(id);
}

export function validateEmail(value: unknown): BackendResult<string> {
  const email = cleanText(value, 254).toLowerCase();
  if (!emailPattern.test(email)) {
    return fail("VALIDATION_ERROR", "Email-i nuk është valid.", {
      fieldErrors: { email: "Shkruaj një email valid." },
    });
  }
  return ok(email);
}

export function validatePainScore(value: unknown, fieldName = "painScore"): BackendResult<number> {
  const score = Number(value);
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    return fail("VALIDATION_ERROR", "Dhimbja duhet të jetë nga 0 deri në 10.", {
      fieldErrors: { [fieldName]: "Lejohen vetëm vlerat 0–10." },
    });
  }
  return ok(score);
}

export function validatePositiveInteger(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number } = {},
): BackendResult<number> {
  const min = options.min ?? 1;
  const max = options.max ?? 10_000;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    return fail("VALIDATION_ERROR", `${fieldName} nuk është valid.`, {
      fieldErrors: { [fieldName]: `Vlera duhet të jetë mes ${min} dhe ${max}.` },
    });
  }
  return ok(number);
}

export function validateIsoDate(value: unknown, fieldName: string): BackendResult<string> {
  const text = cleanText(value, 40);
  const parsed = new Date(text);
  if (!text || !Number.isFinite(parsed.getTime())) {
    return fail("VALIDATION_ERROR", "Data nuk është valide.", {
      fieldErrors: { [fieldName]: "Shkruaj një datë valide." },
    });
  }
  return ok(parsed.toISOString());
}
