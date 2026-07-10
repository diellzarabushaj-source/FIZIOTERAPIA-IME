"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePhysioActor } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import { updatePatientForActor } from "@/lib/backend/patient-profile";
import { createPatientForActor, getPatientForActor } from "@/lib/backend/patients";
import { cleanText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PatientFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export type PatientEditFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export type SessionFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

function parsePain(value: FormDataEntryValue | null, field: "painBefore" | "painAfter") {
  if (value === null || String(value).trim() === "") {
    return { value: null as number | null, error: null as string | null };
  }

  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 10) {
    return {
      value: null,
      error: field === "painBefore"
        ? "Dhimbja para duhet të jetë numër nga 0 deri 10."
        : "Dhimbja pas duhet të jetë numër nga 0 deri 10.",
    };
  }

  return { value: number, error: null };
}

export async function createSmartPatientAction(
  _previousState: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  try {
    const actor = await requirePhysioActor();
    const result = await createPatientForActor(actor, {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      dateOfBirth: formData.get("dateOfBirth"),
      phone: formData.get("phone"),
      diagnosis: formData.get("diagnosis"),
    });

    if (result.ok === false) {
      return {
        status: "error",
        message: result.error.message,
        fieldErrors: result.error.fieldErrors || {},
      };
    }

    const patient = result.data.patient;
    revalidatePath("/physiotherapist-portal/patients");
    revalidatePath("/physiotherapist-portal/overview");
    redirect(`/physiotherapist-portal/patients/${patient.id}?${result.data.created ? "created=1" : "existing=1"}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "Ndodhi një gabim i papritur. Provo përsëri.",
      fieldErrors: {},
    };
  }
}

export async function updatePatientProfileAction(
  patientId: string,
  _previousState: PatientEditFormState,
  formData: FormData,
): Promise<PatientEditFormState> {
  try {
    const actor = await requirePhysioActor();
    const result = await updatePatientForActor(actor, patientId, {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      dateOfBirth: formData.get("dateOfBirth"),
      phone: formData.get("phone"),
      diagnosis: formData.get("diagnosis"),
    });

    if (result.ok === false) {
      return {
        status: "error",
        message: result.error.message,
        fieldErrors: result.error.fieldErrors || {},
      };
    }

    revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
    revalidatePath("/physiotherapist-portal/patients");
    revalidatePath("/physiotherapist-portal/overview");

    return {
      status: "success",
      message: "Ndryshimet në kartelën e pacientit u ruajtën me sukses.",
      fieldErrors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Ndodhi një gabim i papritur gjatë ruajtjes së kartelës.",
      fieldErrors: {},
    };
  }
}

export async function createPatientSessionAction(
  patientId: string,
  _previousState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  try {
    const actor = await requirePhysioActor();
    const patientResult = await getPatientForActor(actor, patientId);
    if (patientResult.ok === false) {
      return { status: "error", message: patientResult.error.message, fieldErrors: {} };
    }

    const patient = patientResult.data;
    if (!patient.physio_id || patient.physio_id !== actor.profileId) {
      return { status: "error", message: "Nuk ke qasje në këtë pacient.", fieldErrors: {} };
    }
    if (patient.archived_at || patient.status !== "active") {
      return { status: "error", message: "Pacienti nuk është aktiv dhe nuk mund të ketë seancë të re.", fieldErrors: {} };
    }

    const sessionDate = cleanText(formData.get("sessionDate"), 10);
    const treatment = cleanText(formData.get("treatment"), 4000);
    const subjective = cleanText(formData.get("subjective"), 3000);
    const objective = cleanText(formData.get("objective"), 3000);
    const response = cleanText(formData.get("response"), 3000);
    const nextPlan = cleanText(formData.get("nextPlan"), 3000);
    const painBefore = parsePain(formData.get("painBefore"), "painBefore");
    const painAfter = parsePain(formData.get("painAfter"), "painAfter");
    const fieldErrors: Record<string, string> = {};

    if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
      fieldErrors.sessionDate = "Zgjidh datën e seancës.";
    }
    if (!treatment) {
      fieldErrors.treatment = "Shëno trajtimin e kryer në këtë seancë.";
    }
    if (painBefore.error) fieldErrors.painBefore = painBefore.error;
    if (painAfter.error) fieldErrors.painAfter = painAfter.error;

    if (Object.keys(fieldErrors).length) {
      return {
        status: "error",
        message: "Kontrollo fushat e shënuara dhe provo përsëri.",
        fieldErrors,
      };
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { status: "error", message: "Databaza nuk është konfiguruar.", fieldErrors: {} };
    }

    const clinicalNotes = [
      subjective ? `Subjektive:\n${subjective}` : "",
      objective ? `Objektive:\n${objective}` : "",
      response ? `Reagimi pas seancës:\n${response}` : "",
    ].filter(Boolean).join("\n\n") || null;

    const { data, error } = await supabase
      .from("patient_sessions")
      .insert({
        patient_id: patientId,
        physio_id: actor.profileId,
        created_by: actor.profileId,
        session_date: `${sessionDate}T12:00:00.000Z`,
        status: "completed",
        pain_before: painBefore.value,
        pain_after: painAfter.value,
        treatment_summary: treatment,
        clinical_notes: clinicalNotes,
        next_steps: nextPlan || null,
      })
      .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
      .single();

    if (error || !data) {
      console.error("patient_session_save_failed", {
        patientId,
        physioId: actor.profileId,
        code: error?.code,
        message: error?.message,
      });
      return {
        status: "error",
        message: "Seanca nuk u ruajt. Të dhënat nuk u humbën; kontrollo lidhjen dhe provo përsëri.",
        fieldErrors: {},
      };
    }

    await writeAuditEvent({
      actor,
      action: "patient.session_created",
      entityType: "patient_session",
      entityId: data.id,
      after: {
        patient_id: patientId,
        session_date: data.session_date,
        status: data.status,
        pain_before: data.pain_before,
        pain_after: data.pain_after,
      },
    });

    revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
    revalidatePath(`/physiotherapist-portal/patients/${patientId}/history`);
    revalidatePath("/physiotherapist-portal/overview");

    return {
      status: "success",
      message: "Seanca u ruajt me sukses në historikun klinik.",
      fieldErrors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Ndodhi një gabim i papritur gjatë ruajtjes së seancës.",
      fieldErrors: {},
    };
  }
}
