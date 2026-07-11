import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePatientCode } from "../supabase-admin.ts";

export type PatientLoginRecord = {
  id: string;
  patient_username: string | null;
  patient_code: string;
  status: string | null;
};

export type PatientLoginResult =
  | { ok: true; patient: PatientLoginRecord }
  | { ok: false; reason: "missing" | "invalid" | "rate-limited" | "misconfigured" };

export async function authenticatePatientCode({
  supabase,
  rawCode,
  ipAddress,
}: {
  supabase: SupabaseClient;
  rawCode: unknown;
  ipAddress?: string | null;
}): Promise<PatientLoginResult> {
  const code = normalizePatientCode(String(rawCode || ""));
  if (!code) return { ok: false, reason: "missing" };

  try {
    const { data: allowed, error: rateError } = await supabase.rpc("check_patient_login_attempt", {
      p_code: code,
      p_ip_address: ipAddress || null,
    });

    if (rateError) return { ok: false, reason: "misconfigured" };
    if (allowed !== true) return { ok: false, reason: "rate-limited" };

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id,patient_username,patient_code,status")
      .eq("patient_code", code)
      .eq("status", "active")
      .maybeSingle<PatientLoginRecord>();

    if (patientError) return { ok: false, reason: "misconfigured" };

    const { error: auditError } = await supabase.rpc("record_patient_login_result", {
      p_code: code,
      p_ip_address: ipAddress || null,
      p_success: Boolean(patient),
    });

    // Code-based access is security-sensitive. Do not create an unaudited session.
    if (auditError) return { ok: false, reason: "misconfigured" };
    if (!patient) return { ok: false, reason: "invalid" };

    return { ok: true, patient };
  } catch {
    return { ok: false, reason: "misconfigured" };
  }
}
