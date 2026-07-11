import { NextResponse, type NextRequest } from "next/server";
import { authenticatePatientCode } from "@/lib/backend/patient-login";
import {
  createPatientSession,
  patientSessionRegistryEnabled,
  PATIENT_SESSION_REGISTRY_COOKIE,
} from "@/lib/backend/patient-sessions";
import {
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  PATIENT_SESSION_MAX_AGE_SECONDS,
  PATIENT_USERNAME_COOKIE,
  signPatientCode,
} from "@/lib/backend-logic";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type RouteProps = {
  params: Promise<{ code: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  const supabase = getSupabaseAdmin();
  const { code } = await params;

  if (!supabase) {
    return NextResponse.redirect(new URL("/patient-portal?error=system", request.url));
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent");
  const result = await authenticatePatientCode({
    supabase,
    rawCode: decodeURIComponent(code || ""),
    ipAddress,
  });

  if (result.ok === false) {
    const reason = result.reason === "misconfigured" ? "system" : result.reason;
    return NextResponse.redirect(new URL(`/patient-portal?error=${encodeURIComponent(reason)}`, request.url));
  }

  let registryToken: string | null = null;
  if (patientSessionRegistryEnabled()) {
    try {
      registryToken = await createPatientSession({
        supabase,
        patientId: result.patient.id,
        ipAddress,
        userAgent,
      });
    } catch {
      return NextResponse.redirect(new URL("/patient-portal?error=system", request.url));
    }
  }

  const response = NextResponse.redirect(new URL("/patient-dashboard", request.url));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: PATIENT_SESSION_MAX_AGE_SECONDS,
    path: "/",
  };

  response.cookies.set(PATIENT_CODE_COOKIE, result.patient.patient_code, cookieOptions);
  response.cookies.set(PATIENT_SESSION_COOKIE, signPatientCode(result.patient.patient_code), cookieOptions);
  if (result.patient.patient_username) {
    response.cookies.set(PATIENT_USERNAME_COOKIE, result.patient.patient_username, cookieOptions);
  }
  if (registryToken) response.cookies.set(PATIENT_SESSION_REGISTRY_COOKIE, registryToken, cookieOptions);
  else response.cookies.delete(PATIENT_SESSION_REGISTRY_COOKIE);

  return response;
}
