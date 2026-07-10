export const applicationEnvironments = ["development", "staging", "production", "test"] as const;
export type ApplicationEnvironment = (typeof applicationEnvironments)[number];

export function resolveApplicationEnvironment(env: NodeJS.ProcessEnv = process.env): ApplicationEnvironment {
  const explicit = env.APP_ENV?.trim().toLowerCase();
  if (explicit && applicationEnvironments.includes(explicit as ApplicationEnvironment)) {
    return explicit as ApplicationEnvironment;
  }

  if (env.NODE_ENV === "test") return "test";
  if (env.VERCEL_ENV === "production") return "production";
  if (env.VERCEL_ENV === "preview") return "staging";
  return "development";
}

export function isProductionEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return resolveApplicationEnvironment(env) === "production";
}

export function isStagingEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return resolveApplicationEnvironment(env) === "staging";
}

export function publicEnvironmentLabel(env: NodeJS.ProcessEnv = process.env): string {
  const value = resolveApplicationEnvironment(env);
  if (value === "production") return "Production";
  if (value === "staging") return "Staging";
  if (value === "test") return "Test";
  return "Development";
}
