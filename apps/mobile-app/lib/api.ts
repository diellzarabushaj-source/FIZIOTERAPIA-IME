declare const process: { env: Record<string, string | undefined> };

const REQUEST_TIMEOUT_MS = 15_000;
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") || "";
let activePatientSessionToken = "";

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
  sessionToken: string;
  sessionMode: "registry" | "signed";
  expiresIn: number;
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
  painScore?: number;
};

export type SaveProgressResult = {
  saved: boolean;
  painAction: "continue_within_plan" | "stop_and_contact_physio" | null;
};

export type MobileHealth = {
  app: string;
  service: "mobile-api";
  ok: boolean;
  status: "ready" | "missing-required-env";
  checks: Record<string, boolean>;
  timestamp: string;
  note: string;
};

export class MobileApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly code: string,
  ) {
    super(message);
    this.name = "MobileApiError";
  }
}

function getApiBaseUrl() {
  if (!configuredBaseUrl) {
    throw new MobileApiError(
      "Aplikacioni nuk është lidhur me serverin. Konfiguro EXPO_PUBLIC_API_BASE_URL.",
      null,
      "missing_api_base_url",
    );
  }

  let url: URL;
  try {
    url = new URL(configuredBaseUrl);
  } catch {
    throw new MobileApiError("Adresa e serverit nuk është valide.", null, "invalid_api_base_url");
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new MobileApiError(
      "Serveri mobile duhet të përdorë HTTPS jashtë zhvillimit lokal.",
      null,
      "insecure_api_base_url",
    );
  }

  return configuredBaseUrl;
}

function userMessageForError(code: string, status: number) {
  if (code === "invalid_patient_credentials") return "Kodi nuk u gjet ose nuk është aktiv.";
  if (code === "too_many_attempts") return "Shumë tentativa. Prit pak dhe provo përsëri.";
  if (code === "invalid_or_expired_patient_session") return "Sesioni ka skaduar. Hyr përsëri me kod.";
  if (code === "exercise_not_assigned_to_active_plan") return "Ky ushtrim nuk është pjesë e planit aktiv.";
  if (code === "ai_not_enabled_for_exercise") return "AI Movement Check nuk është aktiv për këtë ushtrim.";
  if (status >= 500) return "Serveri nuk është përkohësisht i gatshëm. Provo përsëri.";
  return "Kërkesa nuk mund të përfundohej.";
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-fizioterapia-ime-client": "mobile-app",
        ...(init?.headers || {}),
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const code = typeof data.error === "string" ? data.error : "request_failed";
      throw new MobileApiError(userMessageForError(code, response.status), response.status, code);
    }
    return data as T;
  } catch (error) {
    if (error instanceof MobileApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new MobileApiError("Kërkesa zgjati shumë. Kontrollo lidhjen dhe provo përsëri.", null, "timeout");
    }
    throw new MobileApiError("Nuk ka lidhje me serverin. Kontrollo internetin.", null, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}

function postJson<T>(path: string, payload: Record<string, unknown>, token?: string): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

export async function checkMobileBackendHealth() {
  return requestJson<MobileHealth>("/api/mobile/health");
}

export async function loginPatientWithCode(code: string) {
  activePatientSessionToken = "";
  const session = await postJson<PatientSession>("/api/mobile/patient-session", { code });
  activePatientSessionToken = session.sessionToken;
  return session;
}

export async function saveMobileProgress(payload: SaveProgressPayload) {
  if (!activePatientSessionToken) {
    throw new MobileApiError("Sesioni mungon. Hyr përsëri me kod.", 401, "patient_session_missing");
  }

  return postJson<SaveProgressResult>(
    "/api/mobile/save-progress",
    payload,
    activePatientSessionToken,
  );
}

export async function logoutPatientSession() {
  const token = activePatientSessionToken;
  activePatientSessionToken = "";
  if (!token) return { revoked: false };

  try {
    return await requestJson<{ revoked: boolean }>("/api/mobile/patient-session", {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
  } catch {
    return { revoked: false };
  }
}

export function clearPatientSessionLocally() {
  activePatientSessionToken = "";
}
