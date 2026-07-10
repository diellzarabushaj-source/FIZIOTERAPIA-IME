"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { hasActivePhysioAccess } from "@/lib/billing";
import { getClinicalProgramTemplate } from "@/lib/clinical-programs";
import { createPatientUsername, createUniquePatientCode, getSupabaseAdmin } from "@/lib/supabase-admin";

type Profile = {
  id: string;
  email: string;
  role: "owner" | "admin" | "physio";
  full_name: string | null;
  clinic_name: string | null;
  status: string | null;
};

type ExerciseLibraryMatch = {
  id: string;
  name: string;
  ai_enabled: boolean | null;
  is_default: boolean | null;
  owner_physio_id: string | null;
};

function isAdminRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

function cleanOptionalText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isAllowedMediaUrl(value: string) {
  return !value || value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://");
}

async function requireProfile() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase server keys are missing in Vercel.");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const clerkUserId = user?.id;

  if (!email || !clerkUserId) {
    throw new Error("Please sign in first.");
  }

  const fullName = user.fullName || user.firstName || email;
  const adminEmail = (process.env.ADMIN_EMAIL || "diellzarabushaj@gmail.com").toLowerCase();
  const role = email === adminEmail ? "owner" : "physio";

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .or(`clerk_user_id.eq.${clerkUserId},email.eq.${email}`)
    .maybeSingle();

  if (existing) {
    const updates: Record<string, string> = {};
    if (!existing.clerk_user_id) updates.clerk_user_id = clerkUserId;
    if (!existing.full_name) updates.full_name = fullName;

    if (Object.keys(updates).length > 0) {
      await supabase.from("profiles").update(updates).eq("id", existing.id);
      return { ...existing, ...updates } as Profile;
    }

    return existing as Profile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      clerk_user_id: clerkUserId,
      email,
      role,
      full_name: fullName,
      clinic_name: "Fizioterapia ime Clinic",
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

async function requirePaidAccess(profile: Profile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status,current_period_end,price,currency")
    .eq("physio_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!hasActivePhysioAccess(profile.role, subscription)) {
    throw new Error("Qasja eshte e bllokuar. Fizioterapeuti duhet te paguaje 29.90 EUR / muaj per te perdorur dashboard-in.");
  }
}

async function requireOwnedPatient(patientId: string, profile: Profile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const query = supabase
    .from("patients")
    .select("id,physio_id")
    .eq("id", patientId)
    .eq("status", "active");

  if (!isAdminRole(profile.role)) {
    query.eq("physio_id", profile.id);
  }

  const { data: patient } = await query.maybeSingle();
  if (!patient) throw new Error("Patient not found or not assigned to your account.");
  return patient;
}

async function requireAccessibleExercise(exerciseId: string, profile: Profile) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const query = supabase
    .from("exercise_library")
    .select("id,is_default,owner_physio_id,status")
    .eq("id", exerciseId)
    .eq("status", "published");

  if (!isAdminRole(profile.role)) {
    query.or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`);
  }

  const { data: exercise } = await query.maybeSingle();
  if (!exercise) throw new Error("Exercise not found or not available for your account.");
  return exercise;
}

async function getTemplateExercises(profile: Profile, exerciseNames: string[]) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  if (!exerciseNames.length) return [] as ExerciseLibraryMatch[];

  const query = supabase
    .from("exercise_library")
    .select("id,name,ai_enabled,is_default,owner_physio_id")
    .in("name", exerciseNames)
    .eq("status", "published");

  if (!isAdminRole(profile.role)) {
    query.or(`is_default.eq.true,owner_physio_id.eq.${profile.id}`);
  }

  const { data } = await query.returns<ExerciseLibraryMatch[]>();
  return data || [];
}

export async function createPatientAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const profile = await requireProfile();
  await requirePaidAccess(profile);

  const firstName = cleanOptionalText(formData.get("firstName"));
  const lastName = cleanOptionalText(formData.get("lastName"));
  const diagnosis = cleanOptionalText(formData.get("diagnosis"));
  const phone = cleanOptionalText(formData.get("phone"));
  const ageValue = cleanOptionalText(formData.get("age"));
  const programKey = cleanOptionalText(formData.get("programKey"));
  const program = getClinicalProgramTemplate(programKey);
  const planTitle = cleanOptionalText(formData.get("planTitle")) || program.title;

  if (!firstName) throw new Error("Patient first name is required.");

  const patientCode = await createUniquePatientCode(supabase, firstName);
  const patientUsername = createPatientUsername(firstName, lastName, patientCode);

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert({
      physio_id: profile.id,
      first_name: firstName,
      last_name: lastName || null,
      phone: phone || null,
      age: ageValue ? Number(ageValue) : null,
      diagnosis: diagnosis || program.diagnosisLabel,
      patient_code: patientCode,
      patient_username: patientUsername,
      status: "active",
    })
    .select("*")
    .single();

  if (patientError) throw new Error(patientError.message);

  const today = new Date();
  const end = new Date();
  end.setDate(today.getDate() + program.durationDays - 1);

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .insert({
      patient_id: patient.id,
      physio_id: profile.id,
      title: planTitle,
      start_date: today.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      status: "active",
    })
    .select("*")
    .single();

  if (planError) throw new Error(planError.message);

  const templateExerciseNames = program.exercises.map((exercise) => exercise.exerciseName);
  const matchingExercises = await getTemplateExercises(profile, templateExerciseNames);
  const exerciseByName = new Map(matchingExercises.map((exercise) => [exercise.name, exercise]));

  const templateRows = program.exercises
    .map((templateExercise) => {
      const exercise = exerciseByName.get(templateExercise.exerciseName);
      if (!exercise) return null;

      return {
        plan_id: plan.id,
        exercise_id: exercise.id,
        sets: templateExercise.sets,
        reps: templateExercise.reps,
        frequency: templateExercise.frequency,
        day_number: templateExercise.dayNumber,
        instructions: `${templateExercise.instructions}\n\nSafety: ${program.safetyNote}`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (templateRows.length) {
    await supabase.from("plan_exercises").insert(templateRows);
  } else {
    const { data: defaultExercises } = await supabase
      .from("exercise_library")
      .select("id,name")
      .eq("is_default", true)
      .eq("status", "published")
      .limit(3);

    if (defaultExercises?.length) {
      await supabase.from("plan_exercises").insert(
        defaultExercises.map((exercise, index) => ({
          plan_id: plan.id,
          exercise_id: exercise.id,
          sets: index === 2 ? 3 : 2,
          reps: index === 2 ? null : 10,
          frequency: index === 2 ? "3 x 30 sek" : "Cdo dite",
          day_number: 1,
          instructions: `Kryeje ushtrimin ngadale dhe ndalo nese dhimbja rritet.\n\nSafety: ${program.safetyNote}`,
        })),
      );
    }
  }

  revalidatePath("/physiotherapist-portal");
}

export async function createPrivateExerciseAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const profile = await requireProfile();
  await requirePaidAccess(profile);

  const name = cleanOptionalText(formData.get("name"));
  const category = cleanOptionalText(formData.get("category"));
  const diagnosis = cleanOptionalText(formData.get("diagnosis"));
  const instructions = cleanOptionalText(formData.get("instructions"));
  const mediaUrl = cleanOptionalText(formData.get("mediaUrl"));
  const aiEnabled = String(formData.get("aiEnabled") || "") === "on";

  if (!name) throw new Error("Exercise name is required.");
  if (!isAllowedMediaUrl(mediaUrl)) {
    throw new Error("Media URL duhet te filloje me https://, http:// ose /.");
  }

  const { error } = await supabase.from("exercise_library").insert({
    name,
    category: category || null,
    diagnosis: diagnosis || null,
    video_url: mediaUrl || null,
    instructions_sq: instructions || null,
    ai_enabled: aiEnabled,
    scoring_rules: {},
    is_default: profile.role === "owner",
    owner_physio_id: profile.role === "owner" ? null : profile.id,
    status: "published",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/physiotherapist-portal");
}

export async function addExerciseToPlanAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Missing Supabase service key.");

  const profile = await requireProfile();
  await requirePaidAccess(profile);

  const patientId = String(formData.get("patientId") || "");
  const exerciseId = String(formData.get("exerciseId") || "");
  const sets = Number(formData.get("sets") || 2);
  const reps = Number(formData.get("reps") || 10);
  const dayNumber = Number(formData.get("dayNumber") || 1);
  const frequency = cleanOptionalText(formData.get("frequency"));
  const instructions = cleanOptionalText(formData.get("instructions"));

  if (!patientId || !exerciseId) throw new Error("Patient and exercise are required.");

  const patient = await requireOwnedPatient(patientId, profile);
  await requireAccessibleExercise(exerciseId, profile);

  const planQuery = supabase
    .from("plans")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!isAdminRole(profile.role)) {
    planQuery.eq("physio_id", profile.id);
  }

  const { data: existingPlan } = await planQuery.maybeSingle();
  let planId = existingPlan?.id;

  if (!planId) {
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 13);

    const { data: createdPlan, error: planError } = await supabase
      .from("plans")
      .insert({
        patient_id: patientId,
        physio_id: patient.physio_id || profile.id,
        title: "Program rehabilitimi 14 dite",
        start_date: today.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        status: "active",
      })
      .select("id")
      .single();

    if (planError) throw new Error(planError.message);
    planId = createdPlan.id;
  }

  const { error } = await supabase.from("plan_exercises").insert({
    plan_id: planId,
    exercise_id: exerciseId,
    sets,
    reps,
    frequency: frequency || "Cdo dite",
    day_number: dayNumber,
    instructions: instructions || "Kryeje me kontroll dhe pa dhimbje te forte.",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/physiotherapist-portal");
}
