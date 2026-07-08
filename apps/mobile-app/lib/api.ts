declare const process: {
  env: Record<string, string | undefined>;
};

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://fizioterapia-ime.vercel.app").replace(/\/$/, "");

export type MobilePatient = {
  id: string;
  code: string;
  name: string;
  diagnosis: string;
};

export type MobilePlan = {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
};

export type MobileExercise = {
  id: string;
  planExerciseId: string;
  exerciseId?: string | null;
  name: string;
  meta: string;
  duration: string;
  aiEnabled: boolean;
  instructions: string;
  videoUrl?: string | null;
  dayNumber?: number | null;
};

export type PatientSession = {
  patient: MobilePatient;
  plan: MobilePlan | null;
  exercises: MobileExercise[];
  completedIds: string[];
};

export type SaveProgressPayload = {
  code: string;
  patientId: string;
  planExerciseId: string;
  score?: number;
  feedback?: string;
  alertType?: "good" | "needs_attention" | "contact_physio";
  painScore?: number;
};

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-fizioterapia-ime-client": "mobile-app",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `Request failed: ${response.status}`);
  }

  return data as T;
}

export async function loginPatientWithCode(code: string) {
  return postJson<PatientSession>("/api/mobile/patient-session", { code });
}

export async function saveMobileProgress(payload: SaveProgressPayload) {
  return postJson<{ saved: boolean; notification?: { sent: boolean; reason?: string } }>("/api/mobile/save-progress", payload);
}
