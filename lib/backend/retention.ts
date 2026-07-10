import type { ActorContext } from "@/lib/backend/access";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type RetentionCandidateCount = {
  policy_key: string;
  entity_type: string;
  candidate_count: number;
  cutoff_at: string;
};

export async function getRetentionCandidateCounts(
  actor: ActorContext,
): Promise<BackendResult<RetentionCandidateCount[]>> {
  if (actor.role !== "owner") {
    return fail("FORBIDDEN", "Vetëm owner mund të shohë raportin e retention-it.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase.rpc("retention_candidate_counts");
  if (error) return fail("DATABASE_ERROR", "Raporti i retention-it nuk mund të krijohet.");

  const rows = Array.isArray(data) ? data : [];
  return ok(
    rows.map((row) => ({
      policy_key: String(row.policy_key),
      entity_type: String(row.entity_type),
      candidate_count: Number(row.candidate_count || 0),
      cutoff_at: String(row.cutoff_at),
    })),
  );
}
