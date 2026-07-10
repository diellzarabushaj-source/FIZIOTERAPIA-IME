import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { canTransitionPlan, type PlanStatus } from "@/lib/backend/domain";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, validatePositiveInteger } from "@/lib/backend/validation";
import { getPatientForActor } from "@/lib/backend/patients";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PlanRecord = {
  id: string;
  patient_id: string;
  physio_id: string | null;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: PlanStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PlanExerciseRecord = {
  id: string;
  plan_id: string;
  exercise_id: string;
  sets: number | null;
  reps: number | null;
  frequency: string | null;
  day_number: number | null;
  schedule_days: number[] | null;
  instructions: string | null;
};

export type CreatePlanInput = {
  patientId: unknown;
  title?: unknown;
  durationDays?: unknown;
};

export type AddPlanExerciseInput = {
  planId: unknown;
  exerciseId: unknown;
  sets?: unknown;
  reps?: unknown;
  frequency?: unknown;
  dayNumber?: unknown;
  scheduleDays?: unknown;
  instructions?: unknown;
};

export type UpdatePlanExerciseInput = Omit<AddPlanExerciseInput, "planId" | "exerciseId"> & {
  planExerciseId: unknown;
};

function editablePlanStatus(status: PlanStatus): boolean {
  return status === "draft";
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function forwardFailure<T>(result: BackendResult<unknown>): BackendResult<T> {
  if (result.ok === true) return fail<T>("INTERNAL_ERROR", "Rezultati i backend-it ishte i papritur.");
  return fail<T>(result.error.code, result.error.message, result.error);
}

function planDurationDays(plan: Pick<PlanRecord, "start_date" | "end_date">): number {
  if (!plan.start_date || !plan.end_date) return 90;
  const start = new Date(plan.start_date + "T12:00:00Z");
  const end = new Date(plan.end_date + "T12:00:00Z");
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 90;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

function parseScheduleDays(value: unknown, fallbackDay: number): BackendResult<number[]> {
  const raw = Array.isArray(value)
    ? value.map((item) => String(item)).join(",")
    : cleanText(value, 600);
  const text = raw || String(fallbackDay);
  const days = new Set<number>();

  for (const tokenValue of text.split(/[;,]/)) {
    const token = tokenValue.trim();
    if (!token) continue;

    const single = token.match(/^\d{1,2}$/);
    if (single) {
      days.add(Number(single[0]));
      continue;
    }

    const range = token.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
    if (!range) {
      return fail("VALIDATION_ERROR", "Ditët nuk janë valide.", {
        fieldErrors: { scheduleDays: "Përdor formatin 1-14 ose 1,3,5." },
      });
    }

    const start = Number(range[1]);
    const end = Number(range[2]);
    if (start > end || end - start > 89) {
      return fail("VALIDATION_ERROR", "Intervali i ditëve nuk është valid.", {
        fieldErrors: { scheduleDays: "Dita e parë duhet të jetë para ditës së fundit." },
      });
    }

    for (let day = start; day <= end; day += 1) days.add(day);
  }

  const schedule = [...days].sort((a, b) => a - b);
  if (!schedule.length || schedule.length > 90 || schedule.some((day) => day < 1 || day > 90)) {
    return fail("VALIDATION_ERROR", "Ditët duhet të jenë nga 1 deri në 90.", {
      fieldErrors: { scheduleDays: "Lejohen maksimumi 90 ditë të planifikuara." },
    });
  }

  return ok(schedule);
}

function validateScheduleForPlan(plan: PlanRecord, schedule: number[]): BackendResult<number[]> {
  const duration = planDurationDays(plan);
  if (schedule.some((day) => day > duration)) {
    return fail("VALIDATION_ERROR", "Një ditë e ushtrimit është jashtë kohëzgjatjes së planit.", {
      fieldErrors: { scheduleDays: "Përdor vetëm ditët 1-" + duration + "." },
    });
  }
  return ok(schedule);
}

export async function getPlanForActor(
  actor: ActorContext,
  planId: string,
): Promise<BackendResult<PlanRecord>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("plans")
    .select("id,patient_id,physio_id,title,start_date,end_date,status,created_at,updated_at")
    .eq("id", planId)
    .maybeSingle<PlanRecord>();

  if (error) return fail("DATABASE_ERROR", "Plani nuk mund të ngarkohet.");
  if (!data) return fail("NOT_FOUND", "Plani nuk u gjet.");
  if (!actorCanAccessPhysioResource(actor, data.physio_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë plan.");
  }
  return ok(data);
}

export async function createDraftPlanForActor(
  actor: ActorContext,
  input: CreatePlanInput,
): Promise<BackendResult<PlanRecord>> {
  const patientId = cleanText(input.patientId, 80);
  if (!patientId) return fail("VALIDATION_ERROR", "Zgjidh pacientin.");

  const patientResult = await getPatientForActor(actor, patientId);
  if (patientResult.ok === false) return forwardFailure<PlanRecord>(patientResult);
  if (patientResult.data.status !== "active") {
    return fail("CONFLICT", "Nuk mund të krijohet plan për pacient joaktiv.");
  }
  if (!patientResult.data.physio_id) {
    return fail("CONFLICT", "Pacienti nuk ka fizioterapeut të caktuar.");
  }

  const durationResult = validatePositiveInteger(input.durationDays ?? 14, "durationDays", { min: 1, max: 90 });
  if (durationResult.ok === false) return forwardFailure<PlanRecord>(durationResult);

  const title = cleanText(input.title || "Plan rehabilitimi", 180) || "Plan rehabilitimi";
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + durationResult.data - 1);

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("plans")
    .insert({
      patient_id: patientId,
      physio_id: patientResult.data.physio_id,
      title,
      start_date: toDateOnly(start),
      end_date: toDateOnly(end),
      status: "draft",
    })
    .select("id,patient_id,physio_id,title,start_date,end_date,status,created_at,updated_at")
    .single<PlanRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Plani nuk u krijua.");

  await writeAuditEvent({
    actor,
    action: "plan.created",
    entityType: "plan",
    entityId: data.id,
    after: { patient_id: data.patient_id, title: data.title, status: data.status },
  });

  return ok(data);
}

export async function addExerciseToPlanForActor(
  actor: ActorContext,
  input: AddPlanExerciseInput,
): Promise<BackendResult<PlanExerciseRecord>> {
  const planId = cleanText(input.planId, 80);
  const exerciseId = cleanText(input.exerciseId, 80);
  if (!planId || !exerciseId) return fail("VALIDATION_ERROR", "Plani dhe ushtrimi kërkohen.");

  const planResult = await getPlanForActor(actor, planId);
  if (planResult.ok === false) return forwardFailure<PlanExerciseRecord>(planResult);
  if (!editablePlanStatus(planResult.data.status)) {
    return fail("INVALID_STATUS_TRANSITION", "Vetëm plani draft mund të editohet.");
  }

  const setsResult = validatePositiveInteger(input.sets ?? 2, "sets", { min: 1, max: 20 });
  if (setsResult.ok === false) return forwardFailure<PlanExerciseRecord>(setsResult);
  const dayResult = validatePositiveInteger(input.dayNumber ?? 1, "dayNumber", { min: 1, max: 90 });
  if (dayResult.ok === false) return forwardFailure<PlanExerciseRecord>(dayResult);

  const scheduleResult = parseScheduleDays(input.scheduleDays, dayResult.data);
  if (scheduleResult.ok === false) return forwardFailure<PlanExerciseRecord>(scheduleResult);
  const scheduleForPlan = validateScheduleForPlan(planResult.data, scheduleResult.data);
  if (scheduleForPlan.ok === false) return forwardFailure<PlanExerciseRecord>(scheduleForPlan);

  let reps: number | null = null;
  if (input.reps !== undefined && input.reps !== null && String(input.reps).trim()) {
    const repsResult = validatePositiveInteger(input.reps, "reps", { min: 1, max: 200 });
    if (repsResult.ok === false) return forwardFailure<PlanExerciseRecord>(repsResult);
    reps = repsResult.data;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  let exerciseQuery = supabase
    .from("exercise_library")
    .select("id,is_default,owner_physio_id,status")
    .eq("id", exerciseId)
    .eq("status", "published");
  if (actor.role === "physio") {
    exerciseQuery = exerciseQuery.or("is_default.eq.true,owner_physio_id.eq." + actor.profileId);
  }

  const { data: exercise, error: exerciseError } = await exerciseQuery.maybeSingle();
  if (exerciseError) return fail("DATABASE_ERROR", "Ushtrimi nuk mund të verifikohet.");
  if (!exercise) return fail("FORBIDDEN", "Ushtrimi nuk është i disponueshëm.");

  const payload = {
    plan_id: planId,
    exercise_id: exerciseId,
    sets: setsResult.data,
    reps,
    frequency: cleanText(input.frequency || "Sipas ditëve të caktuara", 120) || "Sipas ditëve të caktuara",
    day_number: scheduleForPlan.data[0],
    schedule_days: scheduleForPlan.data,
    instructions: cleanText(input.instructions || "Kryeje ngadalë dhe me kontroll.", 1200),
  };

  const { data, error } = await supabase
    .from("plan_exercises")
    .insert(payload)
    .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions")
    .single<PlanExerciseRecord>();

  if (error || !data) {
    return fail(error?.code === "23505" ? "CONFLICT" : "DATABASE_ERROR", "Ushtrimi nuk u shtua në plan.");
  }

  await writeAuditEvent({
    actor,
    action: "plan.exercise_added",
    entityType: "plan_exercise",
    entityId: data.id,
    after: data,
  });
  return ok(data);
}

export async function updatePlanExerciseForActor(
  actor: ActorContext,
  input: UpdatePlanExerciseInput,
): Promise<BackendResult<PlanExerciseRecord>> {
  const planExerciseId = cleanText(input.planExerciseId, 80);
  if (!planExerciseId) return fail("VALIDATION_ERROR", "Ushtrimi në plan mungon.");

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: existing, error: existingError } = await supabase
    .from("plan_exercises")
    .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions")
    .eq("id", planExerciseId)
    .maybeSingle<PlanExerciseRecord>();

  if (existingError) return fail("DATABASE_ERROR", "Ushtrimi nuk mund të ngarkohet.");
  if (!existing) return fail("NOT_FOUND", "Ushtrimi në plan nuk u gjet.");

  const planResult = await getPlanForActor(actor, existing.plan_id);
  if (planResult.ok === false) return forwardFailure<PlanExerciseRecord>(planResult);
  if (!editablePlanStatus(planResult.data.status)) {
    return fail("INVALID_STATUS_TRANSITION", "Vetëm plani draft mund të editohet.");
  }

  const setsResult = validatePositiveInteger(input.sets ?? existing.sets ?? 2, "sets", { min: 1, max: 20 });
  if (setsResult.ok === false) return forwardFailure<PlanExerciseRecord>(setsResult);

  const fallbackDay = existing.schedule_days?.[0] || existing.day_number || 1;
  const scheduleResult = parseScheduleDays(input.scheduleDays ?? existing.schedule_days, fallbackDay);
  if (scheduleResult.ok === false) return forwardFailure<PlanExerciseRecord>(scheduleResult);
  const scheduleForPlan = validateScheduleForPlan(planResult.data, scheduleResult.data);
  if (scheduleForPlan.ok === false) return forwardFailure<PlanExerciseRecord>(scheduleForPlan);

  let reps: number | null = existing.reps;
  if (input.reps !== undefined && input.reps !== null) {
    if (String(input.reps).trim()) {
      const repsResult = validatePositiveInteger(input.reps, "reps", { min: 1, max: 200 });
      if (repsResult.ok === false) return forwardFailure<PlanExerciseRecord>(repsResult);
      reps = repsResult.data;
    } else {
      reps = null;
    }
  }

  const updates = {
    sets: setsResult.data,
    reps,
    frequency: cleanText(input.frequency ?? existing.frequency ?? "Sipas ditëve të caktuara", 120),
    day_number: scheduleForPlan.data[0],
    schedule_days: scheduleForPlan.data,
    instructions: cleanText(input.instructions ?? existing.instructions ?? "", 1200),
  };

  const { data, error } = await supabase
    .from("plan_exercises")
    .update(updates)
    .eq("id", planExerciseId)
    .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions")
    .single<PlanExerciseRecord>();

  if (error || !data) return fail("DATABASE_ERROR", "Ushtrimi nuk u përditësua.");

  await writeAuditEvent({
    actor,
    action: "plan.exercise_updated",
    entityType: "plan_exercise",
    entityId: data.id,
    before: existing,
    after: data,
  });
  return ok(data);
}

export async function removePlanExerciseForActor(
  actor: ActorContext,
  planExerciseId: string,
): Promise<BackendResult<{ id: string; planId: string }>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data: existing, error: existingError } = await supabase
    .from("plan_exercises")
    .select("id,plan_id,exercise_id,sets,reps,frequency,day_number,schedule_days,instructions")
    .eq("id", planExerciseId)
    .maybeSingle<PlanExerciseRecord>();

  if (existingError) return fail("DATABASE_ERROR", "Ushtrimi nuk mund të ngarkohet.");
  if (!existing) return fail("NOT_FOUND", "Ushtrimi në plan nuk u gjet.");

  const planResult = await getPlanForActor(actor, existing.plan_id);
  if (planResult.ok === false) return forwardFailure<{ id: string; planId: string }>(planResult);
  if (!editablePlanStatus(planResult.data.status)) {
    return fail("INVALID_STATUS_TRANSITION", "Vetëm plani draft mund të editohet.");
  }

  const { error } = await supabase.from("plan_exercises").delete().eq("id", planExerciseId);
  if (error) return fail("DATABASE_ERROR", "Ushtrimi nuk u largua.");

  await writeAuditEvent({
    actor,
    action: "plan.exercise_removed",
    entityType: "plan_exercise",
    entityId: planExerciseId,
    before: existing,
  });
  return ok({ id: planExerciseId, planId: existing.plan_id });
}

export async function transitionPlanForActor(
  actor: ActorContext,
  planId: string,
  targetStatus: PlanStatus,
): Promise<BackendResult<PlanRecord>> {
  const planResult = await getPlanForActor(actor, planId);
  if (planResult.ok === false) return forwardFailure<PlanRecord>(planResult);
  const plan = planResult.data;

  if (!canTransitionPlan(plan.status, targetStatus)) {
    return fail("INVALID_STATUS_TRANSITION", "Statusi " + plan.status + " nuk mund të kalojë në " + targetStatus + ".");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  if (targetStatus === "pending_review" || targetStatus === "approved" || targetStatus === "active") {
    const { count, error: countError } = await supabase
      .from("plan_exercises")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", planId);
    if (countError) return fail("DATABASE_ERROR", "Ushtrimet e planit nuk mund të verifikohen.");
    if (!count) return fail("VALIDATION_ERROR", "Shto të paktën një ushtrim para aprovimit.");
  }

  if (targetStatus === "active") {
    const { data, error } = await supabase.rpc("activate_plan_safely", {
      p_plan_id: planId,
      p_expected_status: plan.status,
      p_actor_profile_id: actor.profileId,
    });
    const activated = Array.isArray(data) ? data[0] : data;
    if (error) return fail("DATABASE_ERROR", "Plani nuk u aktivizua.");
    if (!activated) return fail("CONFLICT", "Plani është ndryshuar nga një kërkesë tjetër. Rifresko faqen.");

    await writeAuditEvent({
      actor,
      action: "plan.status_active",
      entityType: "plan",
      entityId: planId,
      before: { status: plan.status },
      after: { status: "active" },
    });
    return ok(activated as PlanRecord);
  }

  const { data, error } = await supabase
    .from("plans")
    .update({ status: targetStatus })
    .eq("id", planId)
    .eq("status", plan.status)
    .select("id,patient_id,physio_id,title,start_date,end_date,status,created_at,updated_at")
    .maybeSingle<PlanRecord>();

  if (error) return fail("DATABASE_ERROR", "Statusi i planit nuk u ndryshua.");
  if (!data) return fail("CONFLICT", "Plani është ndryshuar nga një kërkesë tjetër. Rifresko faqen.");

  await writeAuditEvent({
    actor,
    action: "plan.status_" + targetStatus,
    entityType: "plan",
    entityId: planId,
    before: { status: plan.status },
    after: { status: targetStatus },
  });
  return ok(data);
}
