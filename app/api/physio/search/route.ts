import { NextResponse, type NextRequest } from "next/server";
import { requirePhysioActor } from "@/lib/backend/access";
import { listExercisesForActor } from "@/lib/backend/exercises";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type PatientRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  diagnosis: string | null;
  patient_code: string;
  patient_username: string | null;
};

type PlanRow = {
  id: string;
  patient_id: string;
  title: string;
  status: string;
};

type PatientNameRow = {
  id: string;
  first_name: string;
  last_name: string | null;
};

type SearchResult = {
  type: "patient" | "plan" | "exercise";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

function cleanSearchTerm(value: string | null): string {
  return (value || "")
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function maskPatientCode(code: string): string {
  if (code.length <= 6) return `${code.slice(0, 2)}••••`;
  return `${code.slice(0, 3)}••••${code.slice(-4)}`;
}

function patientName(patient: Pick<PatientRow, "first_name" | "last_name">): string {
  return `${patient.first_name} ${patient.last_name || ""}`.trim();
}

function statusLabel(status: string): string {
  if (status === "draft") return "Draft";
  if (status === "pending_review") return "Në kontroll";
  if (status === "approved") return "Për aktivizim";
  if (status === "active") return "Aktiv";
  if (status === "paused") return "I pauzuar";
  return status;
}

export async function GET(request: NextRequest) {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Databaza nuk është konfiguruar." }, { status: 503 });
  }

  const term = cleanSearchTerm(request.nextUrl.searchParams.get("q"));
  if (term.length < 2) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  let patientQuery = supabase
    .from("patients")
    .select("id,first_name,last_name,diagnosis,patient_code,patient_username")
    .eq("status", "active")
    .is("archived_at", null)
    .or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,diagnosis.ilike.%${term}%,patient_code.ilike.%${term}%,patient_username.ilike.%${term}%`,
    )
    .order("updated_at", { ascending: false })
    .limit(6);
  let planQuery = supabase
    .from("plans")
    .select("id,patient_id,title,status")
    .ilike("title", `%${term}%`)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (actor.role === "physio") {
    patientQuery = patientQuery.eq("physio_id", actor.profileId);
    planQuery = planQuery.eq("physio_id", actor.profileId);
  }

  const [patientResult, planResult, exerciseResult] = await Promise.all([
    patientQuery.returns<PatientRow[]>(),
    planQuery.returns<PlanRow[]>(),
    listExercisesForActor(actor, { search: term }),
  ]);

  if (patientResult.error || planResult.error || exerciseResult.ok === false) {
    return NextResponse.json({ error: "Kërkimi nuk mund të përfundohej." }, { status: 503 });
  }

  const plans = planResult.data || [];
  const planPatientIds = [...new Set(plans.map((plan) => plan.patient_id))];
  let planPatients: PatientNameRow[] = [];

  if (planPatientIds.length) {
    let planPatientQuery = supabase
      .from("patients")
      .select("id,first_name,last_name")
      .in("id", planPatientIds);
    if (actor.role === "physio") planPatientQuery = planPatientQuery.eq("physio_id", actor.profileId);
    const { data, error } = await planPatientQuery.returns<PatientNameRow[]>();
    if (error) return NextResponse.json({ error: "Kërkimi nuk mund të përfundohej." }, { status: 503 });
    planPatients = data || [];
  }

  const planPatientMap = new Map(planPatients.map((patient) => [patient.id, patient]));
  const results: SearchResult[] = [];

  for (const patient of patientResult.data || []) {
    results.push({
      type: "patient",
      id: patient.id,
      title: patientName(patient),
      subtitle: `${patient.diagnosis || "Pa diagnozë"} · ${maskPatientCode(patient.patient_code)}`,
      href: `/physiotherapist-portal/patients/${patient.id}`,
    });
  }

  for (const plan of plans) {
    const patient = planPatientMap.get(plan.patient_id);
    results.push({
      type: "plan",
      id: plan.id,
      title: plan.title,
      subtitle: `${patient ? patientName(patient as PatientRow) : "Pacient"} · ${statusLabel(plan.status)}`,
      href: `/physiotherapist-portal/plan-builder?planId=${encodeURIComponent(plan.id)}`,
    });
  }

  for (const exercise of exerciseResult.data.slice(0, 5)) {
    results.push({
      type: "exercise",
      id: exercise.id,
      title: exercise.name,
      subtitle: `${exercise.category || "Pa kategori"} · ${exercise.is_default ? "Biblioteka standarde" : "Ushtrim privat"}`,
      href: `/physiotherapist-portal/exercises?q=${encodeURIComponent(exercise.name)}`,
    });
  }

  return NextResponse.json(
    { results: results.slice(0, 12) },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
