import assert from "node:assert/strict";
import test from "node:test";
import {
  createPatientCode,
  getPatientAccessPath,
  resolvePatientAccessBaseUrl,
} from "../../lib/supabase-admin.ts";

test("patient access codes are cryptographically random 48-bit tokens", () => {
  const codes = new Set(Array.from({ length: 256 }, () => createPatientCode("Ignored")));

  assert.equal(codes.size, 256);
  for (const code of codes) assert.match(code, /^FI-[A-F0-9]{12}$/);
});

test("patient access path normalizes whitespace and case", () => {
  assert.equal(getPatientAccessPath(" fi-ab 12 "), "/p/FI-AB12");
});

test("local development uses localhost only when no deployment environment exists", () => {
  assert.equal(resolvePatientAccessBaseUrl({ NODE_ENV: "development" }), "http://localhost:3000");
});

test("Vercel previews use the preview hostname instead of production", () => {
  assert.equal(
    resolvePatientAccessBaseUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "fizioterapia-ime-git-feature.example.vercel.app",
    }),
    "https://fizioterapia-ime-git-feature.example.vercel.app",
  );
});

test("production fails closed when NEXT_PUBLIC_APP_URL is missing", () => {
  assert.throws(
    () => resolvePatientAccessBaseUrl({ NODE_ENV: "production", VERCEL_ENV: "production" }),
    /NEXT_PUBLIC_APP_URL mungon/,
  );
});

test("production accepts only a clean HTTPS application origin", () => {
  assert.equal(
    resolvePatientAccessBaseUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://fizioterapia-ime.vercel.app",
    }),
    "https://fizioterapia-ime.vercel.app",
  );

  assert.throws(
    () => resolvePatientAccessBaseUrl({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "http://fizioterapia-ime.vercel.app",
    }),
    /HTTPS/,
  );

  assert.throws(
    () => resolvePatientAccessBaseUrl({
      NODE_ENV: "production",
      NEXT_PUBLIC_APP_URL: "https://fizioterapia-ime.vercel.app/patient",
    }),
    /vetëm origin-i/,
  );
});
