type DatabaseErrorLike = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  hint?: unknown;
};

const SCHEMA_ERROR_CODES = new Set([
  "42P01", // undefined table
  "42703", // undefined column
  "42883", // undefined function
  "PGRST200", // relationship missing from schema cache
  "PGRST202", // function missing from schema cache
  "PGRST204", // column missing from schema cache
]);

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function isDatabaseSchemaMismatch(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as DatabaseErrorLike;
  const code = text(candidate.code).toUpperCase();
  if (SCHEMA_ERROR_CODES.has(code)) return true;

  const combined = [candidate.message, candidate.details, candidate.hint]
    .map(text)
    .join(" ")
    .toLowerCase();

  return [
    "does not exist",
    "could not find",
    "schema cache",
    "undefined column",
    "undefined table",
    "undefined function",
  ].some((fragment) => combined.includes(fragment));
}

/**
 * PostgREST `.or()` filters have their own grammar. Restrict free-text search
 * to ordinary Unicode letters/numbers and benign separators before embedding
 * it in that grammar. This preserves Albanian text while preventing operators,
 * commas and parentheses from changing the filter expression.
 */
export function sanitizePostgrestSearchTerm(value: unknown, maxLength = 120): string {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s'’\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function databaseRolloutMessage(feature: string): string {
  return `${feature} nuk është ende aktive në këtë ambient. Apliko migrimet e databazës dhe provo përsëri.`;
}
