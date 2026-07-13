import { NextResponse } from "next/server";
import { PATIENT_SESSION_MAX_AGE_SECONDS, signPatientCode } from "@/lib/backend-logic";
import {
  createPatientSession,
  patientSessionRegistryEnabled,
  PATIENT_SESSION_REGISTRY_MAX_AGE_SECONDS,
  revokePatientSession,
} from "@/lib/backend/patient-sessions";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

type PlanExerciseRow = {
  id: string;
  exercise_id: string | null;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  instructions: string | null;
};

type ExerciseLibraryRow = {
  id: string;
  name: string;
  category: string | null;
  video_url: string | null;
  instructions_sq: string | null;
  ai_enabled: boolean | null;
};

function todayIsoStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503, headers: noStoreHeaders });
  }

  const body = await request.json().catch(() => ({}));
  const code = normalizePatientCode(String(body.code || ""));
  if (!code) {
    return NextResponse.json({ error: "Patient code is required" }, { status: 400, headers: noStoreHeaders });
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent");
  const { data: allowed, error: rateError } = await supabase.rpc("check_patient_login_attempt", {
    p_code: code,
    p_ip_address: ipAddress,
  });
  if (rateError) {
    return NextResponse.json({ error: "login_protection_unavailable" }, { status: 503, headers: noStoreHeaders });
  }
  if (!allowed) {
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429, headers: noStoreHeaders });
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id,physio_id,first_name,last_name,diagnosis,patient_code,status")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  await supabase.rpc("record_patient_login_result", {
    p_code: code,
    p_ip_address: ipAddress,
    p_success: Boolean(patient),
  });
  if (patientError) {
    return NextResponse.json({ error: "database_error" }, { status: 500, headers: noStoreHeaders });
  }
  if (!patient) {
    return NextResponse.json({ error: "invalid_patient_credentials" }, { status: 401, headers: noStoreHeaders });
  }

  const registryEnabled = patientSessionRegistryEnabled();
  let sessionToken: string;
  try {
    sessionToken = registryEnabled
      ? await createPatientSession({ supabase, patientId: patient.id, ipAddress, userAgent })
      : signPatientCode(patient.patient_code);
  } catch {
    return NextResponse.json({ error: "patient_session_unavailable" }, { status: 503, headers: noStoreHeaders });
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("id,title,start_date,end_date,status")
    .eq("patient_id", patient.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planExerciseRows = plan
    ? (await supabase
        .from("plan_exercises")
        .select("id,exercise_id,sets,reps,frequency,day_number,instructions")
        .eq("plan_id", plan.id)
        .order("day_number", { ascending: true })).data ?? []
    : [];
  const rows = planExerciseRows as PlanExerciseRow[];
  const exerciseIds = rows.map((row) => row.exercise_id).filter(Boolean) as string[];
  const libraryRows = exerciseIds.length
    ? ((await supabase
        .from("exercise_library")
        .select("id,name,category,video_url,instructions_sq,ai_enabled")
        .in("id", exerciseIds)).data as ExerciseLibraryRow[] | null) ?? []
    : [];
  const libraryById = new Map(libraryRows.map((exercise) => [exercise.id, exercise]));
  const exercises = rows.map((row) => {
    const library = row.exercise_id ? libraryById.get(row.exercise_id) : null;
    const setRep = [
      row.sets ? `${row.sets} sete` : null,
      row.reps ? `${row.reps} përsëritje` : null,
    ].filter(Boolean).join(" × ");
    return {
      id: row.id,
      planExerciseId: row.id,
      exerciseId: row.exercise_id,
      name: library?.name || "Ushtrim",
      meta: setRep || row.frequency || "Sipas planit",
      duration: row.frequency || (row.day_number ? `Dita ${row.day_number}` : "Sot"),
      aiEnabled: Boolean(library?.ai_enabled),
      instructions: row.instructions || library?.instructions_sq || "Ndiq udhëzimet e fizioterapeutit.",
      videoUrl: library?.video_url || null,
      dayNumber: row.day_number,
    };
  });

  const { data: completedLogs } = await supabase
    .from("exercise_logs")
    .select("plan_exercise_id")
    .eq("patient_id", patient.id)
    .eq("completed", true)
    .gte("completed_at", todayIsoStart());
  const completedIds = Array.from(new Set(
    (completedLogs ?? [])
      .map((log: { plan_exercise_id: string | null }) => log.plan_exercise_id)
      .filter(Boolean),
  ));

  return NextResponse.json({
    sessionToken,
    sessionMode: registryEnabled ? "registry" : "signed",
    expiresIn: registryEnabled
      ? PATIENT_SESSION_REGISTRY_MAX_AGE_SECONDS
      : PATIENT_SESSION_MAX_AGE_SECONDS,
    patient: {
      id: patient.id,
      code: "",
      name: [patient.first_name, patient.last_name].filter(Boolean).join(" "),
      diagnosis: patient.diagnosis || "Plan fizioterapie",
    },
    plan: plan
      ? {
          id: plan.id,
          title: plan.title,
          startDate: plan.start_date,
          endDate: plan.end_date,
          status: plan.status,
        }
      : null,
    exercises,
    completedIds,
  }, { headers: noStoreHeaders });
}

export async function DELETE(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503, headers: noStoreHeaders });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "patient_session_required" }, { status: 401, headers: noStoreHeaders });
  }

  const revoked = patientSessionRegistryEnabled()
    ? await revokePatientSession({ supabase, token, reason: "mobile_patient_logout" })
    : false;

  return NextResponse.json({ revoked }, { headers: noStoreHeaders });
}
