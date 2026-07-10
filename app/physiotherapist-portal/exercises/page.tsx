import { requirePhysioActor } from "@/lib/backend/access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "../dashboard.module.css";

type ExerciseRow = { id: string; name: string; category: string | null; diagnosis: string | null; ai_enabled: boolean | null };

export default async function ExercisesPage() {
  const actor = await requirePhysioActor();
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase nuk është konfiguruar.");
  let query = supabase.from("exercise_library").select("id,name,category,diagnosis,ai_enabled").eq("status", "published").order("name");
  if (actor.role === "physio") query = query.or(`is_default.eq.true,owner_physio_id.eq.${actor.profileId}`);
  const { data, error } = await query.returns<ExerciseRow[]>();
  if (error) throw new Error("Ushtrimet nuk mund të ngarkohen.");

  return (
    <>
      <header className={styles.topbar}><div><h1>Ushtrimet</h1><p>Biblioteka klinike e ushtrimeve.</p></div></header>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Ushtrimi</th><th>Kategoria</th><th>Diagnoza</th><th>AI</th></tr></thead>
          <tbody>
            {(data || []).map((exercise) => <tr key={exercise.id}><td>{exercise.name}</td><td>{exercise.category || "—"}</td><td>{exercise.diagnosis || "—"}</td><td>{exercise.ai_enabled ? "Aktiv" : "Jo"}</td></tr>)}
            {!data?.length && <tr><td colSpan={4}>Nuk ka ushtrime.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
