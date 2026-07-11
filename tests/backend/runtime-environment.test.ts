import assert from "node:assert/strict";
import test from "node:test";
import {
  isProductionEnvironment,
  isStagingEnvironment,
  resolveApplicationEnvironment,
} from "../../lib/runtime-environment.ts";

function environment(values: Partial<NodeJS.ProcessEnv>): NodeJS.ProcessEnv {
  return { NODE_ENV: "production", ...values } as NodeJS.ProcessEnv;
}

test("explicit APP_ENV has priority", () => {
  assert.equal(
    resolveApplicationEnvironment(environment({ APP_ENV: "staging", VERCEL_ENV: "production" })),
    "staging",
  );
});

test("Vercel production resolves to production", () => {
  const env = environment({ VERCEL_ENV: "production" });
  assert.equal(resolveApplicationEnvironment(env), "production");
  assert.equal(isProductionEnvironment(env), true);
});

test("Vercel preview resolves to staging", () => {
  const env = environment({ VERCEL_ENV: "preview" });
  assert.equal(resolveApplicationEnvironment(env), "staging");
  assert.equal(isStagingEnvironment(env), true);
});

test("test environment is isolated", () => {
  assert.equal(resolveApplicationEnvironment(environment({ NODE_ENV: "test" })), "test");
});

test("unknown explicit environment falls back safely", () => {
  assert.equal(resolveApplicationEnvironment(environment({ APP_ENV: "wrong" })), "development");
});
