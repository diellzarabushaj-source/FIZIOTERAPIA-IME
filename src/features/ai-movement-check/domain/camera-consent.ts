export const CAMERA_CONSENT_STORAGE_KEY = "fizioterapia_camera_consent_v1";
export const CAMERA_CONSENT_VERSION = 1;
export const CAMERA_CONSENT_MAX_AGE_MS = 8 * 60 * 60 * 1000;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type CameraConsentRecord = {
  version: number;
  confirmedAt: number;
};

function parseRecord(value: string | null): CameraConsentRecord | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<CameraConsentRecord>;
    if (parsed.version !== CAMERA_CONSENT_VERSION) return null;
    if (!Number.isFinite(parsed.confirmedAt)) return null;
    return {
      version: CAMERA_CONSENT_VERSION,
      confirmedAt: Number(parsed.confirmedAt),
    };
  } catch {
    return null;
  }
}

export function hasValidCameraConsent(
  storage: StorageLike,
  now = Date.now(),
): boolean {
  try {
    const record = parseRecord(storage.getItem(CAMERA_CONSENT_STORAGE_KEY));
    if (!record) return false;
    if (record.confirmedAt > now + 60_000) return false;
    return now - record.confirmedAt <= CAMERA_CONSENT_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function recordCameraConsent(
  storage: StorageLike,
  now = Date.now(),
): boolean {
  try {
    const record: CameraConsentRecord = {
      version: CAMERA_CONSENT_VERSION,
      confirmedAt: now,
    };
    storage.setItem(CAMERA_CONSENT_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearCameraConsent(storage: StorageLike): void {
  try {
    storage.removeItem(CAMERA_CONSENT_STORAGE_KEY);
  } catch {
    // Consent remains fail-closed when storage is unavailable.
  }
}
