import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare const process: {
  env: Record<string, string | undefined>;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

type AiPayload = {
  patientId: string;
  planExerciseId: string;
  score: number;
  feedback: string;
  alertType: 'good' | 'needs_attention' | 'contact_physio';
  painScore?: number;
};

export async function saveAiCheck(payload: AiPayload) {
  const db = getSupabase();
  const now = new Date().toISOString();

  if (!db) {
    return { saved: false, demoMode: true };
  }

  const aiResult = await db.from('ai_checks').insert({
    patient_id: payload.patientId,
    plan_exercise_id: payload.planExerciseId,
    score: payload.score,
    feedback: payload.feedback,
    alert_type: payload.alertType,
    created_at: now,
  });

  if (payload.painScore !== undefined) {
    await db.from('exercise_logs').insert({
      patient_id: payload.patientId,
      plan_exercise_id: payload.planExerciseId,
      completed: true,
      pain_score: payload.painScore,
      comment: 'Raportuar gjate kontrollit me kamere',
      completed_at: now,
    });
  }

  return { saved: !aiResult.error, demoMode: false, error: aiResult.error };
}
