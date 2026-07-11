import type { ActorContext } from "@/lib/backend/access";
import { actorCanAccessPhysioResource } from "@/lib/backend/access";
import { writeAuditEvent } from "@/lib/backend/audit";
import {
  databaseRolloutMessage,
  isDatabaseSchemaMismatch,
  sanitizePostgrestSearchTerm,
} from "@/lib/backend/database-compatibility";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, optionalText } from "@/lib/backend/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type ExerciseRecord = {
  id: string;
  name: string;
  category: string | null;
  diagnosis: string | null;
  instructions_sq: string | null;
  video_url: string | null;
  ai_enabled: boolean | null;
  is_default: boolean | null;
  owner_physio_id: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type LegacyExerciseRecord = Omit<
  ExerciseRecord,
  "is_default" | "owner_physio_id" | "status" | "updated_at"
>;

export type ExerciseFilters = {
  search?: unknown;
  category?: unknown;
  diagnosis?: unknown;
  includeArchived?: boolean;
};

export type CreatePrivateExerciseInput = {
  name: unknown;
  category?: unknown;
  diagnosis?: unknown;
  instructions?: unknown;
  videoUrl?: unknown;
};

export type UpdatePrivateExerciseInput = CreatePrivateExerciseInput & {
  exerciseId: unknown;
};

const selectFields =
  "id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,is_default,owner_physio_id,status,created_at,updated_at";
const legacySelectFields =
  "id,name,category,diagnosis,instructions_sq,video_url,ai_enabled,created_at";

function validateMediaUrl(value: unknown): BackendResult<string | null> {
  const mediaUrl = optionalText(value, 500);
  if (!mediaUrl || mediaUrl.startsWith("/")) return ok(mediaUrl);

  try {
    const parsed = new URL(mediaUrl);
    if (parsed.protocol === "https:") return ok(mediaUrl);
  } catch {
    // The validation result below keeps the same field-level contract as other inputs.
  }

  return fail("VALIDATION_ERROR", "Linku i fotos ose videos nuk është valid.", {
    fieldErrors: { mediaUrl: "Përdor një link HTTPS ose ngarko skedarin nga pajisja." },
  });
}

function isVisibleToActor(
  actor: ActorContext,
  exercise: Pick<ExerciseRecord, "is_default" | "owner_physio_id">,
): boolean {
  return Boolean(exercise.is_default) || actorCanAccessPhysioResource(actor, exercise.owner_physio_id);
}

function mapLegacyExercise(exercise: LegacyExerciseRecord): ExerciseRecord {
  return {
    ...exercise,
    is_default: true,
    owner_physio_id: null,
    status: "published",
    updated_at: exercise.created_at ?? null,
  };
}

function applySearchFilters<T>(
  query: T,
  filters: ExerciseFilters,
): T {
  let filtered = query as T & {
    or: (value: string) => T;
    ilike: (column: string, value: string) => T;
  };
  const search = sanitizePostgrestSearchTerm(filters.search, 120);
  const category = sanitizePostgrestSearchTerm(filters.category, 120);
  const diagnosis = sanitizePostgrestSearchTerm(filters.diagnosis, 180);

  if (search) {
    filtered = filtered.or(
      `name.ilike.%${search}%,category.ilike.%${search}%,diagnosis.ilike.%${search}%`,
    ) as typeof filtered;
  }
  if (category) filtered = filtered.ilike("category", category) as typeof filtered;
  if (diagnosis) filtered = filtered.ilike("diagnosis", `%${diagnosis}%`) as typeof filtered;
  return filtered as T;
}

async function listLegacyExercises(filters: ExerciseFilters): Promise<BackendResult<ExerciseRecord[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  let query = supabase
    .from("exercise_library")
    .select(legacySelectFields)
    .order("name", { ascending: true });
  query = applySearchFilters(query, filters);

  const { data, error } = await query.returns<LegacyExerciseRecord[]>();
  if (error) {
    console.error("legacy_exercise_library_load_failed", {
      code: error.code,
      message: error.message,
    });
    return fail("DATABASE_ERROR", "Banka e ushtrimeve nuk mund të ngarkohet.");
  }

  return ok((data || []).map(mapLegacyExercise));
}

export async function listExercisesForActor(
  actor: ActorContext,
  filters: ExerciseFilters = {},
): Promise<BackendResult<ExerciseRecord[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  let query = supabase.from("exercise_library").select(selectFields).order("name", { ascending: true });
  if (!filters.includeArchived) query = query.eq("status", "published");
  query = applySearchFilters(query, filters);
  if (actor.role === "physio") {
    query = query.or(`is_default.eq.true,owner_physio_id.eq.${actor.profileId}`);
  }

  const { data, error } = await query.returns<ExerciseRecord[]>();
  if (!error) return ok(data || []);

  if (isDatabaseSchemaMismatch(error) && !filters.includeArchived) {
    console.warn("exercise_library_schema_rollout_fallback", {
      code: error.code,
      actorRole: actor.role,
    });
    return listLegacyExercises(filters);
  }

  console.error("exercise_library_load_failed", {
    code: error.code,
    message: error.message,
  });
  return fail("DATABASE_ERROR", "Banka e ushtrimeve nuk mund të ngarkohet.");
}

export async function getExerciseForActor(
  actor: ActorContext,
  exerciseId: string,
): Promise<BackendResult<ExerciseRecord>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("exercise_library")
    .select(selectFields)
    .eq("id", exerciseId)
    .maybeSingle<ExerciseRecord>();

  if (error) {
    if (isDatabaseSchemaMismatch(error)) {
      return fail("SCHEMA_NOT_READY", databaseRolloutMessage("Biblioteka private e ushtrimeve"));
    }
    return fail("DATABASE_ERROR", "Ushtrimi nuk mund të ngarkohet.");
  }
  if (!data) return fail("NOT_FOUND", "Ushtrimi nuk u gjet.");
  if (!isVisibleToActor(actor, data)) return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje në këtë ushtrim.");
  return ok(data);
}

export async function createPrivateExerciseForActor(
  actor: ActorContext,
  input: CreatePrivateExerciseInput,
): Promise<BackendResult<ExerciseRecord>> {
  const name = cleanText(input.name, 160);
  if (name.length < 2) {
    return fail("VALIDATION_ERROR", "Emri i ushtrimit është i detyrueshëm.", {
      fieldErrors: { name: "Shkruaj së paku 2 karaktere." },
    });
  }

  const mediaResult = validateMediaUrl(input.videoUrl);
  if (mediaResult.ok === false) return mediaResult;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const payload = {
    name,
    category: optionalText(input.category, 120) || "Custom",
    diagnosis: optionalText(input.diagnosis, 180),
    instructions_sq: optionalText(input.instructions, 1200),
    video_url: mediaResult.data,
    ai_enabled: false,
    scoring_rules: {},
    is_default: false,
    owner_physio_id: actor.profileId,
    status: "published",
  };

  const { data, error } = await supabase
    .from("exercise_library")
    .insert(payload)
    .select(selectFields)
    .single<ExerciseRecord>();

  if (error || !data) {
    if (isDatabaseSchemaMismatch(error)) {
      return fail("SCHEMA_NOT_READY", databaseRolloutMessage("Krijimi i ushtrimeve private"));
    }
    return fail(
      error?.code === "23505" ? "CONFLICT" : "DATABASE_ERROR",
      "Ushtrimi privat nuk u krijua.",
    );
  }

  await writeAuditEvent({
    actor,
    action: "exercise.created",
    entityType: "exercise",
    entityId: data.id,
    after: {
      name: data.name,
      category: data.category,
      owner_physio_id: data.owner_physio_id,
      status: data.status,
    },
  });

  return ok(data);
}

export async function updatePrivateExerciseForActor(
  actor: ActorContext,
  input: UpdatePrivateExerciseInput,
): Promise<BackendResult<ExerciseRecord>> {
  const exerciseId = cleanText(input.exerciseId, 80);
  if (!exerciseId) return fail("VALIDATION_ERROR", "Mungon ushtrimi.");

  const currentResult = await getExerciseForActor(actor, exerciseId);
  if (!currentResult.ok) return currentResult;
  const current = currentResult.data;

  if (current.is_default) return fail("FORBIDDEN", "Ushtrimet globale nuk mund të editohen nga fizioterapeuti.");
  if (!actorCanAccessPhysioResource(actor, current.owner_physio_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje për ta ndryshuar këtë ushtrim.");
  }

  const name = cleanText(input.name, 160);
  if (name.length < 2) return fail("VALIDATION_ERROR", "Emri i ushtrimit është i detyrueshëm.");

  const mediaResult = validateMediaUrl(input.videoUrl);
  if (mediaResult.ok === false) return mediaResult;

  const updates = {
    name,
    category: optionalText(input.category, 120) || "Custom",
    diagnosis: optionalText(input.diagnosis, 180),
    instructions_sq: optionalText(input.instructions, 1200),
    video_url: mediaResult.data,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase
    .from("exercise_library")
    .update(updates)
    .eq("id", exerciseId)
    .eq("owner_physio_id", current.owner_physio_id)
    .select(selectFields)
    .single<ExerciseRecord>();

  if (error || !data) {
    if (isDatabaseSchemaMismatch(error)) {
      return fail("SCHEMA_NOT_READY", databaseRolloutMessage("Editimi i ushtrimeve private"));
    }
    return fail("DATABASE_ERROR", "Ushtrimi nuk u përditësua.");
  }

  await writeAuditEvent({
    actor,
    action: "exercise.updated",
    entityType: "exercise",
    entityId: exerciseId,
    before: current,
    after: data,
  });

  return ok(data);
}

export async function archivePrivateExerciseForActor(
  actor: ActorContext,
  exerciseId: string,
): Promise<BackendResult<{ id: string }>> {
  const currentResult = await getExerciseForActor(actor, exerciseId);
  if (!currentResult.ok) return currentResult;
  const current = currentResult.data;

  if (current.is_default) return fail("FORBIDDEN", "Ushtrimet globale nuk mund të arkivohen nga fizioterapeuti.");
  if (!actorCanAccessPhysioResource(actor, current.owner_physio_id)) {
    return fail("OWNERSHIP_MISMATCH", "Nuk ke qasje për ta arkivuar këtë ushtrim.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { error } = await supabase
    .from("exercise_library")
    .update({ status: "archived" })
    .eq("id", exerciseId)
    .eq("owner_physio_id", current.owner_physio_id);

  if (error) {
    if (isDatabaseSchemaMismatch(error)) {
      return fail("SCHEMA_NOT_READY", databaseRolloutMessage("Arkivimi i ushtrimeve private"));
    }
    return fail("DATABASE_ERROR", "Ushtrimi nuk u arkivua.");
  }

  await writeAuditEvent({
    actor,
    action: "exercise.archived",
    entityType: "exercise",
    entityId: exerciseId,
    before: { status: current.status },
    after: { status: "archived" },
  });

  return ok({ id: exerciseId });
}
