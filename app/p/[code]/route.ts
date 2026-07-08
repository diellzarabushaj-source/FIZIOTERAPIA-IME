import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";

type RouteProps = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { code: rawCode } = await params;
  const code = normalizePatientCode(decodeURIComponent(rawCode || ""));
  const supabase = getSupabaseAdmin();

  if (!supabase || !code) {
    redirect("/patient-portal?error=missing");
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

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(CODE_COOKIE, patient.patient_code, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  if (patient.patient_username) {
    cookieStore.set(USERNAME_COOKIE, patient.patient_username, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  redirect("/patient-dashboard");
}
