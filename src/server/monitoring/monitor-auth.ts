import { timingSafeEqual } from "node:crypto";

export function hasValidMonitorSecret(
  providedSecret: string | null | undefined,
  expectedSecret: string | null | undefined = process.env.HEALTH_MONITOR_SECRET,
) {
  if (!providedSecret || !expectedSecret) return false;

  const provided = Buffer.from(providedSecret, "utf8");
  const expected = Buffer.from(expectedSecret, "utf8");
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
