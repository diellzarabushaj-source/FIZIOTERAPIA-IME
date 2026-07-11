import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("overview masks patient access codes and links clinical priorities", async () => {
  const page = await source("app/physiotherapist-portal/overview/page.tsx");

  assert.match(page, /function maskPatientCode/);
  assert.match(page, /maskPatientCode\(patient\.patient_code\)/);
  assert.doesNotMatch(page, /\{patient\.diagnosis \|\| "Pa diagnozë"\} · \{patient\.patient_code\}/);
  assert.match(page, /href="\/physiotherapist-portal\/alerts"/);
  assert.match(page, /href="#today-agenda"/);
});

test("overview scopes alerts and sessions to the physiotherapist", async () => {
  const page = await source("app/physiotherapist-portal/overview/page.tsx");

  assert.match(page, /attentionQuery = attentionQuery\.eq\("physio_id", actor\.profileId\)/);
  assert.match(page, /todaySessionQuery = todaySessionQuery\.eq\("physio_id", actor\.profileId\)/);
  assert.match(page, /alertCountQuery = alertCountQuery\.eq\("physio_id", actor\.profileId\)/);
});

test("overview separates every actionable plan state", async () => {
  const page = await source("app/physiotherapist-portal/overview/page.tsx");

  assert.match(page, /status=draft/);
  assert.match(page, /status=pending_review/);
  assert.match(page, /status=approved/);
  assert.match(page, /status=active/);
  assert.match(page, /Plane në pritje/);
});

test("overview relies on the global quick action menu instead of duplicate page actions", async () => {
  const page = await source("app/physiotherapist-portal/overview/page.tsx");

  assert.doesNotMatch(page, /UserPlus/);
  assert.doesNotMatch(page, />Shto pacient<\/Link>/);
  assert.doesNotMatch(page, />Krijo plan<\/Link>/);
});

test("overview has isolated responsive styles", async () => {
  const [page, css] = await Promise.all([
    source("app/physiotherapist-portal/overview/page.tsx"),
    source("app/physiotherapist-portal/overview/overview.module.css"),
  ]);

  assert.match(page, /import overviewStyles from "\.\/overview\.module\.css"/);
  assert.match(css, /\.priorityGrid/);
  assert.match(css, /\.attentionItem/);
  assert.match(css, /@media \(max-width: 520px\)/);
});
