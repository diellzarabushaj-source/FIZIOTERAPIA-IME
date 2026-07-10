"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePhysioActor, type ActorContext } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { addExerciseToPlanForActor, createDraftPlanForActor } from "@/lib/backend/plans";
import { createPatientForActor, getPatientForActor } from "@/lib/backend/patients";
import type { BackendResult } from "@/lib/backend/result";
import { cleanText } from "@/lib/backend/validation";
import { hasActivePhysioAccess } from "@/lib/billing";
import { getClinicalProgramTemplate } from "@/lib/clinical-programs";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unwrap<T>(result: BackendResult<T>): T {
  if (result.ok === false) throw new Error(result.error.message);
  return result.data;
}

async function requirePaidContext() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("status,current_period_end,price,currency")
    .eq("physio_id", actor.profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("Statusi i abonimit nuk mund të verifikohet.");
  if (!hasActivePhysioAccess(actor.role, subscription)) {
    throw new Error("Qasja është e bllokuar. Aktivizo abonimin për të përdorur dashboard-in.");
  }

  return { actor, supabase };
}

async function findAvailableExercises(actor: ActorContext, names: string[]) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !names.length) return [] as Array<{ id: string; name: string }>;

  let query = supabase
    .from("exercise_library")
    .select("id,name")
    .in("name", names)
    .eq("status", "published");

  if (actor.role === "physio") {
    query = query.or(`is_default.eq.true,owner_physio_id.eq.${actor.profileId}`);
  }

  const { data, error } = await query.returns<Array<{ id: string; name: string }>>();
  if (error) throw new Error("Ushtrimet e programit nuk mund të ngarkohen.");
  return data || [];
}

export async function createPatientAction(formData: FormData) {
  const { actor, supabase } = await requirePaidContext();
  const program = getClinicalProgramTemplate(String(formData.get("programKey") || ""));
  const planTitle = cleanText(formData.get("planTitle") || program.title, 180) || program.title;

  const outcome = unwrap(await createPatientForActor(actor, {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    diagnosis: formData.get("diagnosis") || program.diagnosisLabel,
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
  }));

  const patient = outcome.patient;

  if (outcome.created) {
    try {
      const plan = unwrap(await createDraftPlanForActor(actor, {
        patientId: patient.id,
        title: planTitle,
        durationDays: program.durationDays,
      }));

      const available = await findAvailableExercises(actor, program.exercises.map((item) => item.exerciseName));
      const byName = new Map(available.map((item) => [item.name, item.id]));

      for (const template of program.exercises) {
        const exerciseId = byName.get(template.exerciseName);
        if (!exerciseId) continue;
        unwrap(await addExerciseToPlanForActor(actor, {
          planId: plan.id,
          exerciseId,
          sets: template.sets,
          reps: template.reps ?? undefined,
          frequency: template.frequency,
          dayNumber: template.dayNumber,
          instructions: `${template.instructions}\n\nSafety: ${program.safetyNote}`,
        }));
      }
    } catch (error) {
      await supabase.from("plans").update({ status: "archived" }).eq("patient_id", patient.id).eq("status", "draft");
      await writeAuditEvent({
        actor,
        action: "patient.initial_plan_failed",
        entityType: "patient",
        entityId: patient.id,
        after: { reason: error instanceof Error ? error.message : "Unknown error" },
      });
      throw error;
    }
  }

  revalidatePath("/physiotherapist-portal/patients");
  redirect(`/physiotherapist-portal/patients/${patient.id}?${outcome.created ? "created=1" : "existing=1"}`);
}

export async function createPatientSessionAction(formData: FormData) {
  const { actor, supabase } = await requirePaidContext();
  const patientId = cleanText(formData.get("patientId"), 80);
  if (!patientId) throw new Error("Pacienti mungon.");

  const patient = unwrap(await getPatientForActor(actor, patientId));
  if (patient.archived_at) throw new Error("Pacienti është i arkivuar dhe nuk mund të ketë seancë të re.");

  const parsePain = (value: FormDataEntryValue | null) => {
    if (value === null || String(value).trim() === "") return null;
    const pain = Number(value);
    if (!Number.isInteger(pain) || pain < 0 || pain > 10) throw new Error("Dhimbja duhet të jetë nga 0 deri në 10.");
    return pain;
  };

  const payload = {
    patient_id: patient.id,
    physio_id: patient.physio_id || actor.profileId,
    created_by: actor.profileId,
    session_date: cleanText(formData.get("sessionDate"), 40) || new Date().toISOString(),
    status: "completed",
    pain_before: parsePain(formData.get("painBefore")),
    pain_after: parsePain(formData.get("painAfter")),
    treatment_summary: cleanText(formData.get("treatmentSummary"), 2000) || null,
    clinical_notes: cleanText(formData.get("clinicalNotes"), 4000) || null,
    next_steps: cleanText(formData.get("nextSteps"), 2000) || null,
  };

  const { data, error } = await supabase
    .from("patient_sessions")
    .insert(payload)
    .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
    .single();

  if (error || !data) throw new Error("Seanca nuk u ruajt.");

  await writeAuditEvent({
    actor,
    action: "patient.session_created",
    entityType: "patient_session",
    entityId: data.id,
    after: { patient_id: patient.id, session_date: data.session_date, status: data.status },
  });

  revalidatePath(`/physiotherapist-portal/patients/${patient.id}`);
  revalidatePath("/physiotherapist-portal/overview");
  redirect(`/physiotherapist-portal/patients/${patient.id}?session=created`);
}

export async function createPrivateExerciseAction(formData: FormData) {
  const { actor, supabase } = await requirePaidContext();
  const name = cleanText(formData.get("name"), 140);
  const category = cleanText(formData.get("category"), 100);
  const diagnosis = cleanText(formData.get("diagnosis"), 300);
  const instructions = cleanText(formData.get("instructions"), 2000);
  const aiEnabled = String(formData.get("aiEnabled") || "") === "on";

  if (name.length < 2) throw new Error("Emri i ushtrimit është i detyrueshëm.");

  const { data, error } = await supabase.from("exercise_library").insert({
    name,
    category: category || null,
    diagnosis: diagnosis || null,
    instructions_sq: instructions || null,
    ai_enabled: aiEnabled,
    scoring_rules: {},
    is_default: actor.role === "owner",
    owner_physio_id: actor.role === "owner" ? null : actor.profileId,
    status: "published",
  }).select("id,name,status,owner_physio_id,is_default").single();

  if (error || !data) throw new Error(error?.code === "23505" ? "Ky ushtrim ekziston." : "Ushtrimi nuk u krijua.");

  await writeAuditEvent({ actor, action: "exercise.created", entityType: "exercise", entityId: data.id, after: data });
  revalidatePath("/physiotherapist-portal/exercises");
}

export async function addExerciseToPlanAction(formData: FormData) {
  const { actor, supabase } = await requirePaidContext();
  const patientId = cleanText(formData.get("patientId"), 80);
  const exerciseId = cleanText(formData.get("exerciseId"), 80);
  if (!patientId || !exerciseId) throw new Error("Pacienti dhe ushtrimi janë të detyrueshëm.");

  let query = supabase
    .from("plans")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1);
  if (actor.role === "physio") query = query.eq("physio_id", actor.profileId);

  const { data: existingDraft, error: draftError } = await query.maybeSingle<{ id: string }>();
  if (draftError) throw new Error("Drafti i planit nuk mund të ngarkohet.");

  const planId = existingDraft?.id || unwrap(await createDraftPlanForActor(actor, {
    patientId,
    title: "Program rehabilitimi 14 ditë",
    durationDays: 14,
  })).id;

  unwrap(await addExerciseToPlanForActor(actor, {
    planId,
    exerciseId,
    sets: formData.get("sets") || 2,
    reps: formData.get("reps") || 10,
    frequency: "Çdo ditë",
    dayNumber: formData.get("dayNumber") || 1,
    instructions: formData.get("instructions") || "Kryeje me kontroll dhe pa dhimbje të fortë.",
  }));

  revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
}
