import type { ActorContext } from "@/lib/backend/access";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PatientHistoryEvent = {
  id: string;
  occurredAt: string;
  kind: "session" | "plan" | "profile" | "system";
  title: string;
  summary: string;
  metadata: Record<string, string | number | null>;
};

type SessionRow = {
  id: string;
  session_date: string;
  status: string;
  pain_before: number | null;
  pain_after: number | null;
  treatment_summary: string | null;
  clinical_notes: string | null;
  next_steps: string | null;
  created_at: string | null;
};

type PlanRow = {
  id: string;
  title: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

function displayDate(value: string | null | undefined): string {
  return value || new Date(0).toISOString();
}

function summarizeProfileChange(row: AuditRow): string {
  const before = row.before_data || {};
  const after = row.after_data || {};
  const labels: Record<string, string> = {
    first_name: "emri",
    last_name: "mbiemri",
    date_of_birth: "datëlindja",
    phone: "telefoni",
    diagnosis: "diagnoza",
    status: "statusi",
  };
  const changed = Object.keys(labels).filter((key) => before[key] !== after[key]);
  if (!changed.length) return "Kartela e pacientit u përditësua.";
  return `U përditësuan: ${changed.map((key) => labels[key]).join(", ")}.`;
}

export async function getPatientHistoryForActor(
  actor: ActorContext,
  patientId: string,
): Promise<BackendResult<PatientHistoryEvent[]>> {
  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) {
    return fail(patientResult.error.code, patientResult.error.message, patientResult.error);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const [sessionsResult, plansResult, auditResult] = await Promise.all([
    supabase
      .from("patient_sessions")
      .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps,created_at")
      .eq("patient_id", patientId)
      .eq("physio_id", actor.profileId)
      .order("session_date", { ascending: false })
      .returns<SessionRow[]>(),
    supabase
      .from("plans")
      .select("id,title,status,start_date,end_date,created_at,updated_at")
      .eq("patient_id", patientId)
      .eq("physio_id", actor.profileId)
      .order("created_at", { ascending: false })
      .returns<PlanRow[]>(),
    supabase
      .from("audit_logs")
      .select("id,action,entity_type,before_data,after_data,created_at")
      .eq("entity_id", patientId)
      .in("action", ["patient.created", "patient.reused_existing_record", "patient.profile_updated", "patient.archived", "patient.restored"])
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<AuditRow[]>(),
  ]);

  if (sessionsResult.error || plansResult.error || auditResult.error) {
    console.error("patient_history_load_failed", {
      patientId,
      physioId: actor.profileId,
      sessionsError: sessionsResult.error?.message,
      plansError: plansResult.error?.message,
      auditError: auditResult.error?.message,
    });
    return fail("DATABASE_ERROR", "Historiku klinik nuk mund të ngarkohet.");
  }

  const events: PatientHistoryEvent[] = [];
  const sessions = sessionsResult.data || [];

  sessions.forEach((session, index) => {
    const chronologicalNumber = sessions.length - index;
    events.push({
      id: `session-${session.id}`,
      occurredAt: displayDate(session.created_at || session.session_date),
      kind: "session",
      title: `Seanca ${chronologicalNumber}`,
      summary: session.treatment_summary || "Seancë klinike e regjistruar.",
      metadata: {
        statusi: session.status,
        "dhimbja para": session.pain_before,
        "dhimbja pas": session.pain_after,
        "shënime klinike": session.clinical_notes,
        "hapi i ardhshëm": session.next_steps,
      },
    });
  });

  for (const plan of plansResult.data || []) {
    events.push({
      id: `plan-${plan.id}`,
      occurredAt: displayDate(plan.updated_at || plan.created_at || (plan.start_date ? `${plan.start_date}T10:00:00.000Z` : null)),
      kind: "plan",
      title: plan.title || "Plan trajtimi",
      summary: `Statusi i planit: ${plan.status}.`,
      metadata: {
        fillimi: plan.start_date,
        përfundimi: plan.end_date,
        statusi: plan.status,
      },
    });
  }

  for (const audit of auditResult.data || []) {
    const titleByAction: Record<string, string> = {
      "patient.created": "Kartela u krijua",
      "patient.reused_existing_record": "U përdor kartela ekzistuese",
      "patient.profile_updated": "Të dhënat u përditësuan",
      "patient.archived": "Kartela u arkivua",
      "patient.restored": "Kartela u rikthye",
    };
    events.push({
      id: `audit-${audit.id}`,
      occurredAt: audit.created_at,
      kind: audit.action === "patient.profile_updated" ? "profile" : "system",
      title: titleByAction[audit.action] || "Ndryshim në kartelë",
      summary: audit.action === "patient.profile_updated" ? summarizeProfileChange(audit) : "Ngjarje e regjistruar në audit log.",
      metadata: {},
    });
  }

  events.sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());
  return ok(events);
}
