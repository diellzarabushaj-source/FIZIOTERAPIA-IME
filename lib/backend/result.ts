export type BackendErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "PROFILE_NOT_FOUND"
  | "PROFILE_INACTIVE"
  | "SUBSCRIPTION_INACTIVE"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "OWNERSHIP_MISMATCH"
  | "INVALID_STATUS_TRANSITION"
  | "CONFLICT"
  | "STORAGE_ERROR"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

export type BackendError = {
  code: BackendErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
};

export type BackendResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: BackendError };

export function ok<T>(data: T): BackendResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: BackendErrorCode,
  message: string,
  options?: Pick<BackendError, "fieldErrors" | "requestId">,
): BackendResult<T> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...options,
    },
  };
}

export function errorMessage(error: unknown, fallback = "Ndodhi një gabim i papritur."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
