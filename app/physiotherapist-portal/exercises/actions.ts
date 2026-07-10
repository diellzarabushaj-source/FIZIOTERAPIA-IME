"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePhysioActor, type ActorContext } from "@/lib/backend/access";
import {
  archivePrivateExerciseForActor,
  createPrivateExerciseForActor,
} from "@/lib/backend/exercises";
import { cleanText } from "@/lib/backend/validation";
import { hasActivePhysioAccess } from "@/lib/billing";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MEDIA_BUCKET = "exercise-media";
const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

const mediaExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export type ExerciseFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export type ExerciseUploadTicket =
  | {
      ok: true;
      bucket: string;
      path: string;
      signedUrl: string;
      publicUrl: string;
      contentType: string;
    }
  | { ok: false; message: string };

async function requireExerciseWorkspace(): Promise<{
  actor: ActorContext;
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>;
}> {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Databaza nuk është konfiguruar.");

  if (actor.role === "physio") {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("physio_id", actor.profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !hasActivePhysioAccess(actor.role, subscription)) {
      throw new Error("Aktivizo abonimin për të menaxhuar bibliotekën e ushtrimeve.");
    }
  }

  return { actor, supabase };
}

function validMediaUrl(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/")) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function createExerciseMediaUploadAction(input: {
  fileName: string;
  contentType: string;
  size: number;
}): Promise<ExerciseUploadTicket> {
  try {
    const { actor, supabase } = await requireExerciseWorkspace();
    const contentType = cleanText(input.contentType, 100).toLowerCase();
    const extension = mediaExtensions[contentType];
    const size = Number(input.size);

    if (!extension) {
      return { ok: false, message: "Lejohen vetëm foto JPG, PNG, WebP, GIF dhe video MP4, WebM ose MOV." };
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_MEDIA_BYTES) {
      return { ok: false, message: "Media duhet të jetë deri në 50 MB." };
    }

    const dateFolder = new Date().toISOString().slice(0, 10);
    const path = `${actor.profileId}/${dateFolder}/${randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      return { ok: false, message: "Upload-i nuk u përgatit. Kontrollo që migration-i i storage është aplikuar." };
    }

    const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return {
      ok: true,
      bucket: MEDIA_BUCKET,
      path,
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
      contentType,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Upload-i nuk mund të fillojë.",
    };
  }
}

export async function createPrivateExerciseDashboardAction(
  _previousState: ExerciseFormState,
  formData: FormData,
): Promise<ExerciseFormState> {
  try {
    const { actor } = await requireExerciseWorkspace();
    const mediaUrl = cleanText(formData.get("mediaUrl"), 500);

    if (!validMediaUrl(mediaUrl)) {
      return {
        status: "error",
        message: "Linku i medias nuk është valid.",
        fieldErrors: { mediaUrl: "Përdor një link HTTPS ose ngarko skedarin nga pajisja." },
      };
    }

    const result = await createPrivateExerciseForActor(actor, {
      name: formData.get("name"),
      category: formData.get("category"),
      diagnosis: formData.get("diagnosis"),
      instructions: formData.get("instructions"),
      videoUrl: mediaUrl,
    });

    if (result.ok === false) {
      return {
        status: "error",
        message: result.error.message,
        fieldErrors: result.error.fieldErrors || {},
      };
    }

    revalidatePath("/physiotherapist-portal/exercises");
    revalidatePath("/physiotherapist-portal/plan-builder");
    revalidatePath("/physiotherapist-portal/programs");

    return {
      status: "success",
      message: `Ushtrimi “${result.data.name}” u ruajt në bibliotekën tënde private.`,
      fieldErrors: {},
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Ushtrimi nuk u ruajt.",
      fieldErrors: {},
    };
  }
}

export async function archivePrivateExerciseDashboardAction(formData: FormData) {
  const { actor } = await requireExerciseWorkspace();
  const exerciseId = cleanText(formData.get("exerciseId"), 80);
  if (!exerciseId) throw new Error("Ushtrimi mungon.");

  const result = await archivePrivateExerciseForActor(actor, exerciseId);
  if (result.ok === false) throw new Error(result.error.message);

  revalidatePath("/physiotherapist-portal/exercises");
  revalidatePath("/physiotherapist-portal/plan-builder");
}
