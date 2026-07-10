import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_PATIENT_CODE, DEMO_PATIENT_USERNAME, isDemoPatientCode } from "@/lib/demo-clinic";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";

type RouteProps = {
  params: Promise<{ code: string }>;
};

async function setPatientCookies(code: string, username?: string | null) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(CODE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  if (username) {
    cookieStore.set(USERNAME_COOKIE, username, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { code: rawCode } = await params;
  const code = normalizePatientCode(decodeURIComponent(rawCode || ""));
  const supabase = getSupabaseAdmin();

  if (!code) {
    redirect("/patient-portal?error=missing");
  }

  if (!supabase) {
    if (isDemoPatientCode(code)) {
      await setPatientCookies(DEMO_PATIENT_CODE, DEMO_PATIENT_USERNAME);
      redirect("/patient-dashboard?demo=1");
    }

    redirect(`/patient-portal?error=not_configured&code=${encodeURIComponent(code)}`);
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!patient) {
    redirect(`/patient-portal?error=invalid&code=${encodeURIComponent(code)}`);
  }

  await setPatientCookies(patient.patient_code, patient.patient_username);
  redirect("/patient-dashboard");
}
