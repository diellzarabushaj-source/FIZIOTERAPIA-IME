import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { getActivePatientBySignedCode, PATIENT_CODE_COOKIE, PATIENT_SESSION_COOKIE } from "@/lib/backend-logic";
import { MovementCheckClient } from "./MovementCheckClient";

export default async function AiCheckPage({ searchParams }: { searchParams?: Promise<{ planExerciseId?: string }> }) {
  const params = await searchParams;
  let planExerciseId = params?.planExerciseId;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return (
      <main className="page patient-dashboard-page ai-check-page">
        <nav className="top-nav">
          <BrandMark />
          <div className="nav-actions"><a href="/patient-dashboard">Plani im</a></div>
        </nav>
        <section className="ai-empty-state">
          <span className="badge">Kontrollo lëvizjen</span>
          <h1>Kontrolli nuk është aktiv.</h1>
          <div className="role-warning">Konfigurimi i sistemit mungon.</div>
        </section>
      </main>
    );
  }

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(PATIENT_CODE_COOKIE)?.value || "");
  const signature = cookieStore.get(PATIENT_SESSION_COOKIE)?.value || "";
  if (!code) redirect("/patient-portal");

  const patient = await getActivePatientBySignedCode({ supabase, code, signature });
  if (!patient) redirect("/patient-portal");

  if (planExerciseId) {
    const { data: assignedExercise } = await supabase
      .from("plan_exercises")
      .select("id,plans!inner(patient_id),exercise_library!inner(ai_enabled)")
      .eq("id", planExerciseId)
      .eq("plans.patient_id", patient.id)
      .eq("exercise_library.ai_enabled", true)
      .maybeSingle();
    if (!assignedExercise) redirect("/patient-dashboard");
  } else {
    const { data: firstAiExercise } = await supabase
      .from("plan_exercises")
      .select("id,plans!inner(patient_id),exercise_library!inner(ai_enabled)")
      .eq("plans.patient_id", patient.id)
      .eq("exercise_library.ai_enabled", true)
      .order("day_number", { ascending: true })
      .limit(1)
      .maybeSingle();
    planExerciseId = firstAiExercise?.id;
  }

  return (
    <main className="page patient-dashboard-page ai-check-page">
      <nav className="top-nav ai-nav">
        <BrandMark />
        <div className="nav-actions">
          <a href="/patient-dashboard">Plani im</a>
          <a href="/patient-portal">Hyrja me kod</a>
          <a href="/camera-consent">Leja e kamerës</a>
        </div>
      </nav>
      {!planExerciseId ? (
        <section className="ai-empty-state">
          <span className="badge">Kontroll opsional</span>
          <h1>Nuk ka ushtrim me kontroll AI.</h1>
          <p>Fizioterapeuti duhet ta aktivizojë kontrollin e lëvizjes për një ushtrim në planin tënd.</p>
          <a className="button" href="/patient-dashboard">Kthehu te plani im</a>
        </section>
      ) : (
        <MovementCheckClient planExerciseId={planExerciseId} />
      )}
    </main>
  );
}
