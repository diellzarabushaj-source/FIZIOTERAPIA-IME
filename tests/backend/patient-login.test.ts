import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticatePatientCode, type PatientLoginRecord } from "../../lib/backend/patient-login.ts";

type MockOptions = {
  rateAllowed?: boolean | null;
  rateError?: object | null;
  patient?: PatientLoginRecord | null;
  patientError?: object | null;
  auditError?: object | null;
};

function createSupabaseMock(options: MockOptions = {}) {
  const calls: string[] = [];
  const patient = options.patient === undefined
    ? { id: "patient-1", patient_username: "arta.demo", patient_code: "FI-ABC123", status: "active" }
    : options.patient;

  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    async maybeSingle() {
      return { data: patient, error: options.patientError || null };
    },
  };

  const client = {
    async rpc(name: string) {
      calls.push(name);
      if (name === "check_patient_login_attempt") {
        return {
          data: options.rateAllowed === undefined ? true : options.rateAllowed,
          error: options.rateError || null,
        };
      }

      return { data: null, error: options.auditError || null };
    },
    from() {
      return query;
    },
  } as unknown as SupabaseClient;

  return { client, calls };
}

test("patient login rejects an empty code before database access", async () => {
  const { client, calls } = createSupabaseMock();
  const result = await authenticatePatientCode({ supabase: client, rawCode: "   " });

  assert.deepEqual(result, { ok: false, reason: "missing" });
  assert.deepEqual(calls, []);
});

test("patient login fails closed when rate-limit infrastructure errors", async () => {
  const { client, calls } = createSupabaseMock({ rateError: { message: "rpc unavailable" } });
  const result = await authenticatePatientCode({ supabase: client, rawCode: "fi-abc123" });

  assert.deepEqual(result, { ok: false, reason: "misconfigured" });
  assert.deepEqual(calls, ["check_patient_login_attempt"]);
});

test("patient login fails closed when the patient query errors", async () => {
  const { client, calls } = createSupabaseMock({ patientError: { message: "query failed" } });
  const result = await authenticatePatientCode({ supabase: client, rawCode: "FI-ABC123" });

  assert.deepEqual(result, { ok: false, reason: "misconfigured" });
  assert.deepEqual(calls, ["check_patient_login_attempt"]);
});

test("patient login does not create a session when audit logging fails", async () => {
  const { client, calls } = createSupabaseMock({ auditError: { message: "audit failed" } });
  const result = await authenticatePatientCode({ supabase: client, rawCode: " FI-ABC123 " });

  assert.deepEqual(result, { ok: false, reason: "misconfigured" });
  assert.deepEqual(calls, ["check_patient_login_attempt", "record_patient_login_result"]);
});

test("patient login normalizes the code and returns the active patient", async () => {
  const { client, calls } = createSupabaseMock();
  const result = await authenticatePatientCode({ supabase: client, rawCode: " fi-abc123 " });

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.patient.patient_code, "FI-ABC123");
  assert.deepEqual(calls, ["check_patient_login_attempt", "record_patient_login_result"]);
});
