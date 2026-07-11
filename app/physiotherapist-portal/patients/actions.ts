"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePhysioActor } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import {
  getClinicalSessionForActor,
  scheduleClinicalSessionForActor,
} from "@/lib/backend/clinical-sessions";
import { updatePatientForActor } from "@/lib/backend/patient-profile";
import { createPatientForActor, getPatientForActor } from "@/lib/backend/patients";
import { clinicDateInputToUtcNoon } from "@/lib/backend/time-zone";
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

export type ScheduleSessionFormState = SessionFormState;

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

function revalidatePatientSessionViews(patientId: string) {
  revalidatePath(`/physiotherapist-portal/patients/${patientId}`);
  revalidatePath(`/physiotherapist-portal/patients/${patientId}/history`);
  revalidatePath("/physiotherapist-portal/overview");
  revalidatePath("/physiotherapist-portal/sessions");
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

export async function schedulePatientSessionAction(
  patientId: string,
  _previousState: ScheduleSessionFormState,
  formData: FormData,
): Promise<ScheduleSessionFormState> {
  try {
    const actor = await requirePhysioActor();
    const result = await scheduleClinicalSessionForActor(actor, {
      patientId,
      scheduledAt: formData.get("scheduledAt"),
      note: formData.get("appointmentNote"),
    });

    if (result.ok === false) {
      return {
        status: "error",
        message: result.error.message,
        fieldErrors: result.error.fieldErrors || {},
      };
    }

    revalidatePatientSessionViews(patientId);
    return {
      status: "success",
      message: "Seanca u planifikua dhe u shtua në agjendë.",
      fieldErrors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Seanca nuk u planifikua. Provo përsëri.",
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
    if (!patient.physio_id) {
      return { status: "error", message: "Pacienti nuk ka fizioterapeut të caktuar.", fieldErrors: {} };
    }
    if (patient.archived_at || patient.status !== "active") {
      return { status: "error", message: "Pacienti nuk është aktiv dhe nuk mund të ketë seancë të re.", fieldErrors: {} };
    }

    const sessionDate = cleanText(formData.get("sessionDate"), 10);
    const scheduledSessionId = cleanText(formData.get("scheduledSessionId"), 64);
    const treatment = cleanText(formData.get("treatment"), 4000);
    const subjective = cleanText(formData.get("subjective"), 3000);
    const objective = cleanText(formData.get("objective"), 3000);
    const response = cleanText(formData.get("response"), 3000);
    const nextPlan = cleanText(formData.get("nextPlan"), 3000);
    const painBefore = parsePain(formData.get("painBefore"), "painBefore");
    const painAfter = parsePain(formData.get("painAfter"), "painAfter");
    const fieldErrors: Record<string, string> = {};
    const completedAt = clinicDateInputToUtcNoon(sessionDate);

    if (!completedAt) fieldErrors.sessionDate = "Zgjidh datën e seancës.";
    if (!treatment) fieldErrors.treatment = "Shëno trajtimin e kryer në këtë seancë.";
    if (painBefore.error) fieldErrors.painBefore = painBefore.error;
    if (painAfter.error) fieldErrors.painAfter = painAfter.error;

    if (Object.keys(fieldErrors).length) {
      return {
        status: "error",
        message: "Kontrollo fushat e shënuara dhe provo përsëri.",
        fieldErrors,
      };
    }

    let scheduledSession = null;
    if (scheduledSessionId) {
      const scheduledResult = await getClinicalSessionForActor(actor, scheduledSessionId);
      if (scheduledResult.ok === false) {
        return { status: "error", message: scheduledResult.error.message, fieldErrors: {} };
      }
      scheduledSession = scheduledResult.data;
      if (scheduledSession.patient_id !== patientId) {
        return { status: "error", message: "Seanca e planifikuar nuk i përket këtij pacienti.", fieldErrors: {} };
      }
      if (!["planned", "in_progress"].includes(scheduledSession.status)) {
        return { status: "error", message: "Vetëm seanca e planifikuar ose në zhvillim mund të dokumentohet.", fieldErrors: {} };
      }
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { status: "error", message: "Databaza nuk është konfiguruar.", fieldErrors: {} };
    }

    const clinicalNotes = [
      scheduledSession?.clinical_notes || "",
      subjective ? `Subjektive:\n${subjective}` : "",
      objective ? `Objektive:\n${objective}` : "",
      response ? `Reagimi pas seancës:\n${response}` : "",
    ].filter(Boolean).join("\n\n") || null;

    const payload = {
      patient_id: patientId,
      physio_id: patient.physio_id,
      created_by: scheduledSession?.created_by || actor.profileId,
      session_date: scheduledSession?.session_date || completedAt!.toISOString(),
      status: "completed" as const,
      pain_before: painBefore.value,
      pain_after: painAfter.value,
      treatment_summary: treatment,
      clinical_notes: clinicalNotes,
      next_steps: nextPlan || null,
      updated_at: new Date().toISOString(),
    };

    const mutation = scheduledSession
      ? supabase
          .from("patient_sessions")
          .update(payload)
          .eq("id", scheduledSession.id)
          .in("status", ["planned", "in_progress"])
      : supabase.from("patient_sessions").insert(payload);

    const { data, error } = await mutation
      .select("id,session_date,status,pain_before,pain_after,treatment_summary,clinical_notes,next_steps")
      .single();

    if (error || !data) {
      console.error("patient_session_save_failed", {
        patientId,
        physioId: patient.physio_id,
        scheduledSessionId: scheduledSession?.id || null,
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
      action: scheduledSession ? "patient.session_completed" : "patient.session_created",
      entityType: "patient_session",
      entityId: data.id,
      before: scheduledSession ? { status: scheduledSession.status, session_date: scheduledSession.session_date } : undefined,
      after: {
        patient_id: patientId,
        session_date: data.session_date,
        status: data.status,
        pain_before: data.pain_before,
        pain_after: data.pain_after,
      },
    });

    revalidatePatientSessionViews(patientId);

    return {
      status: "success",
      message: scheduledSession
        ? "Seanca e planifikuar u përfundua dhe u dokumentua në të njëjtin rekord."
        : "Seanca u ruajt me sukses në historikun klinik.",
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
