import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getActivePatientBySignedCode,
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  type ActivePatientSession,
} from "@/lib/backend-logic";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

export async function getCurrentPatientSession(): Promise<ActivePatientSession | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(PATIENT_CODE_COOKIE)?.value || "");
  const signature = cookieStore.get(PATIENT_SESSION_COOKIE)?.value || "";
  if (!code || !signature) return null;

  return getActivePatientBySignedCode({ supabase, code, signature });
}

export async function requireCurrentPatientSession(
  redirectTo = "/patient-portal",
): Promise<ActivePatientSession> {
  const patient = await getCurrentPatientSession();
  if (!patient) redirect(redirectTo);
  return patient;
}
