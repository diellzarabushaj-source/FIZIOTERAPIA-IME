"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasActivePhysioAccess } from "@/lib/billing";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = "diellzarabushaj@gmail.com";

type Profile = { id: string; email: string; role: string; status: string | null };

function isAdmin(role?: string | null) {
  return role === "owner" || role === "admin";
}

async function requirePhysio() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key mungon.");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) redirect("/sign-in?redirect_url=/physiotherapist-portal/plan-builder");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role,status")
    .eq("email", email)
    .maybeSingle<Profile>();

  if (!profile) redirect("/physiotherapist-portal?access=profile-required");
  if (["inactive", "suspended", "blocked"].includes(profile.status || "")) {
    redirect("/physiotherapist-portal?access=blocked#billing");
  }

  if (!isAdmin(profile.role) && email !== (process.env.ADMIN_EMAIL || ADMIN_EMAIL).toLowerCase()) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("physio_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!hasActivePhysioAccess(profile.role, subscription)) {
      redirect("/physiotherapist-portal?access=subscription-required#billing");
    }
  }

  return { supabase, profile };
}

async function requireOwnedPatient(patientId: string, profile: Profile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key mungon.");
  const query = supabase.from("patients").select("id,physio_id").eq("id", patientId).eq("status", "active");
  if (!isAdmin(profile.role)) query.eq("physio_id", profile.id);
  const { data } = await query.maybeSingle();
  if (!data) throw new Error("Pacienti nuk u gjet ose nuk është i yti.");
  return data;
}

async function requireOwnedPlan(planId: string, profile: Profile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key mungon.");
  const query = supabase.from("plans").select("id,patient_id,physio_id,status").eq("id", planId);
  if (!isAdmin(profile.role)) query.eq("physio_id", profile.id);
  const { data } = await query.maybeSingle();
  if (!data) throw new Error("Plani nuk u gjet ose nuk është i yti.");
  return data;
}

export async function createDraftPlanAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const patientId = String(formData.get("patientId") || "");
  const title = String(formData.get("title") || "Plan rehabilitimi").trim().slice(0, 180);
  const duration = Math.min(90, Math.max(1, Number(formData.get("durationDays") || 14)));
  if (!patientId) throw new Error("Zgjidh pacientin.");
  await requireOwnedPatient(patientId, profile);

  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + duration - 1);

  const { data, error } = await supabase.from("plans").insert({
    patient_id: patientId,
    physio_id: profile.id,
    title,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    status: "draft",
  }).select("id").single();

  if (error) throw new Error(error.message);
  redirect(`/physiotherapist-portal/plan-builder?patientId=${encodeURIComponent(patientId)}&planId=${encodeURIComponent(data.id)}`);
}

export async function addLibraryExerciseAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const planId = String(formData.get("planId") || "");
  const exerciseId = String(formData.get("exerciseId") || "");
  if (!planId || !exerciseId) throw new Error("Plani dhe ushtrimi kërkohen.");
  const plan = await requireOwnedPlan(planId, profile);
  if (plan.status === "active" || plan.status === "archived") throw new Error("Plani i dërguar nuk editohet pa u kthyer në draft.");

  const exerciseQuery = supabase.from("exercise_library").select("id,is_default,owner_physio_id,status").eq("id", exerciseId).eq("status", "published");
  if (!isAdmin(profile.role)) exerciseQuery.or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`);
  const { data: exercise } = await exerciseQuery.maybeSingle();
  if (!exercise) throw new Error("Ushtrimi nuk është i disponueshëm.");

  const sets = Math.min(20, Math.max(1, Number(formData.get("sets") || 2)));
  const repsRaw = String(formData.get("reps") || "").trim();
  const reps = repsRaw ? Math.min(200, Math.max(1, Number(repsRaw))) : null;
  const dayNumber = Math.min(90, Math.max(1, Number(formData.get("dayNumber") || 1)));
  const frequency = String(formData.get("frequency") || "Çdo ditë").trim().slice(0, 120);
  const instructions = String(formData.get("instructions") || "Kryeje ngadalë dhe me kontroll.").trim().slice(0, 1200);

  const { error } = await supabase.from("plan_exercises").insert({ plan_id: planId, exercise_id: exerciseId, sets, reps, frequency, day_number: dayNumber, instructions });
  if (error) throw new Error(error.message);
  revalidatePath(`/physiotherapist-portal/plan-builder`);
}

export async function addCustomExerciseAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const planId = String(formData.get("planId") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 160);
  if (!planId || !name) throw new Error("Plani dhe emri i ushtrimit kërkohen.");
  const plan = await requireOwnedPlan(planId, profile);
  if (plan.status === "active" || plan.status === "archived") throw new Error("Plani nuk mund të editohet.");

  const { data: exercise, error: exerciseError } = await supabase.from("exercise_library").insert({
    name,
    category: String(formData.get("category") || "Custom").trim().slice(0, 120),
    diagnosis: String(formData.get("diagnosis") || "").trim().slice(0, 180) || null,
    instructions_sq: String(formData.get("instructions") || "").trim().slice(0, 1200) || null,
    video_url: String(formData.get("videoUrl") || "").trim().slice(0, 500) || null,
    ai_enabled: false,
    scoring_rules: {},
    is_default: false,
    owner_physio_id: profile.id,
    status: "published",
  }).select("id").single();
  if (exerciseError) throw new Error(exerciseError.message);

  const sets = Math.min(20, Math.max(1, Number(formData.get("sets") || 2)));
  const repsRaw = String(formData.get("reps") || "").trim();
  const reps = repsRaw ? Math.min(200, Math.max(1, Number(repsRaw))) : null;
  const { error } = await supabase.from("plan_exercises").insert({
    plan_id: planId,
    exercise_id: exercise.id,
    sets,
    reps,
    frequency: String(formData.get("frequency") || "Çdo ditë").trim().slice(0, 120),
    day_number: Math.min(90, Math.max(1, Number(formData.get("dayNumber") || 1))),
    instructions: String(formData.get("instructions") || "Kryeje me kontroll.").trim().slice(0, 1200),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/physiotherapist-portal/plan-builder`);
}

export async function updatePlanExerciseAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const planExerciseId = String(formData.get("planExerciseId") || "");
  const { data: row } = await supabase.from("plan_exercises").select("id,plan_id").eq("id", planExerciseId).maybeSingle();
  if (!row?.plan_id) throw new Error("Ushtrimi në plan nuk u gjet.");
  const plan = await requireOwnedPlan(row.plan_id, profile);
  if (plan.status === "active" || plan.status === "archived") throw new Error("Plani i dërguar nuk mund të editohet.");

  const repsRaw = String(formData.get("reps") || "").trim();
  const { error } = await supabase.from("plan_exercises").update({
    sets: Math.min(20, Math.max(1, Number(formData.get("sets") || 2))),
    reps: repsRaw ? Math.min(200, Math.max(1, Number(repsRaw))) : null,
    frequency: String(formData.get("frequency") || "Çdo ditë").trim().slice(0, 120),
    day_number: Math.min(90, Math.max(1, Number(formData.get("dayNumber") || 1))),
    instructions: String(formData.get("instructions") || "").trim().slice(0, 1200),
  }).eq("id", planExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/physiotherapist-portal/plan-builder`);
}

export async function removePlanExerciseAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const planExerciseId = String(formData.get("planExerciseId") || "");
  const { data: row } = await supabase.from("plan_exercises").select("id,plan_id").eq("id", planExerciseId).maybeSingle();
  if (!row?.plan_id) throw new Error("Ushtrimi në plan nuk u gjet.");
  const plan = await requireOwnedPlan(row.plan_id, profile);
  if (plan.status === "active" || plan.status === "archived") throw new Error("Plani i dërguar nuk mund të editohet.");
  const { error } = await supabase.from("plan_exercises").delete().eq("id", planExerciseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/physiotherapist-portal/plan-builder`);
}

export async function markPendingReviewAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const planId = String(formData.get("planId") || "");
  const plan = await requireOwnedPlan(planId, profile);
  if (plan.status === "active" || plan.status === "archived") throw new Error("Statusi nuk mund të ndryshohet.");
  const { error } = await supabase.from("plans").update({ status: "pending_review" }).eq("id", planId);
  if (error) throw new Error(error.message);
  revalidatePath(`/physiotherapist-portal/plan-builder`);
}

export async function approveAndSendPlanAction(formData: FormData) {
  const { supabase, profile } = await requirePhysio();
  const planId = String(formData.get("planId") || "");
  const plan = await requireOwnedPlan(planId, profile);

  const { count } = await supabase.from("plan_exercises").select("id", { count: "exact", head: true }).eq("plan_id", planId);
  if (!count) throw new Error("Shto të paktën një ushtrim para aprovimit.");

  await supabase.from("plans").update({ status: "archived" }).eq("patient_id", plan.patient_id).eq("status", "active").neq("id", planId);
  const { error } = await supabase.from("plans").update({ status: "active" }).eq("id", planId);
  if (error) throw new Error(error.message);

  revalidatePath("/physiotherapist-portal");
  revalidatePath("/patient-dashboard");
  redirect(`/physiotherapist-portal/plan-builder?patientId=${encodeURIComponent(plan.patient_id)}&planId=${encodeURIComponent(planId)}&sent=1`);
}
