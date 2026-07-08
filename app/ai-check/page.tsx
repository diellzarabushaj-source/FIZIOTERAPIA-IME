import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { MovementCheckClient } from "./MovementCheckClient";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";

export default async function AiCheckPage({ searchParams }: { searchParams?: Promise<{ planExerciseId?: string }> }) {
  const params = await searchParams;
  let planExerciseId = params?.planExerciseId;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return (
      <main className="page patient-dashboard-page">
        <nav className="top-nav">
          <a className="brand-link" href="/"><span className="brand-logo">FP</span><span>FizioPlan</span></a>
          <div className="nav-actions"><a href="/patient-dashboard">Patient Dashboard</a></div>
        </nav>
        <section className="hero">
          <span className="badge">AI Movement Check</span>
          <h1>Konfigurimi mungon.</h1>
          <div className="role-warning">SUPABASE_SERVICE_ROLE_KEY mungon në Vercel.</div>
        </section>
      </main>
    );
  }

  const cookieStore = await cookies();
  const username = cookieStore.get(USERNAME_COOKIE)?.value?.toLowerCase();
  const code = cookieStore.get(CODE_COOKIE)?.value?.toUpperCase();

  if (!username || !code) {
    redirect("/patient-portal");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("patient_username", username)
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!patient) {
    redirect("/patient-portal");
  }

  if (planExerciseId) {
    const { data: assignedExercise } = await supabase
      .from("plan_exercises")
      .select("id,plans!inner(patient_id)")
      .eq("id", planExerciseId)
      .eq("plans.patient_id", patient.id)
      .maybeSingle();

    if (!assignedExercise) {
      redirect("/patient-dashboard");
    }
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
    <main className="page patient-dashboard-page">
      <nav className="top-nav">
        <a className="brand-link" href="/">
          <span className="brand-logo">FP</span>
          <span>FizioPlan</span>
        </a>
        <div className="nav-actions">
          <a href="/patient-dashboard">Patient Dashboard</a>
          <a href="/patient-portal">Patient Portal</a>
        </div>
      </nav>
      {!planExerciseId ? (
        <section className="hero">
          <span className="badge">AI Movement Check</span>
          <h1>Nuk ka ushtrim me AI aktiv.</h1>
          <p>Fizioterapeuti duhet të caktojë një ushtrim me AI check aktiv në planin e pacientit.</p>
          <a className="button" href="/patient-dashboard">Kthehu te dashboard</a>
        </section>
      ) : (
        <MovementCheckClient planExerciseId={planExerciseId} />
      )}
    </main>
  );
}
