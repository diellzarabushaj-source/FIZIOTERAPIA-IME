import assert from "node:assert/strict";
import test from "node:test";
import {
  isProductionEnvironment,
  isStagingEnvironment,
  resolveApplicationEnvironment,
} from "../../lib/runtime-environment.ts";

test("explicit APP_ENV has priority", () => {
  assert.equal(resolveApplicationEnvironment({ APP_ENV: "staging", VERCEL_ENV: "production" } as NodeJS.ProcessEnv), "staging");
});

test("Vercel production resolves to production", () => {
  const env = { VERCEL_ENV: "production" } as NodeJS.ProcessEnv;
  assert.equal(resolveApplicationEnvironment(env), "production");
  assert.equal(isProductionEnvironment(env), true);
});

test("Vercel preview resolves to staging", () => {
  const env = { VERCEL_ENV: "preview" } as NodeJS.ProcessEnv;
  assert.equal(resolveApplicationEnvironment(env), "staging");
  assert.equal(isStagingEnvironment(env), true);
});

test("test environment is isolated", () => {
  assert.equal(resolveApplicationEnvironment({ NODE_ENV: "test" } as NodeJS.ProcessEnv), "test");
});

test("unknown explicit environment falls back safely", () => {
  assert.equal(resolveApplicationEnvironment({ APP_ENV: "wrong" } as NodeJS.ProcessEnv), "development");
});
