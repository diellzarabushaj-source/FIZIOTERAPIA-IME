import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const source = (path: string) => readFile(new URL(path, root), "utf8");

const [choicePage, templateActions, matching, proxy] = await Promise.all([
  source("app/physiotherapist-portal/plan-builder/new/page.tsx"),
  source("app/physiotherapist-portal/plan-builder/new/actions.ts"),
  source("lib/clinical-program-matching.ts"),
  source("proxy.ts"),
]);

test("new plan creation explicitly offers manual and existing-plan modes", () => {
  assert.match(choicePage, /Krijoje vet nga zero/);
  assert.match(choicePage, /Zgjidh plan të gatshëm/);
  assert.match(choicePage, /createDraftPlanAction/);
  assert.match(choicePage, /createPlanFromTemplateAction/);
});

test("existing plans are shown only when diagnosis and library exercises match", () => {
  assert.match(choicePage, /templatesForDiagnosis\(patient\.diagnosis\)/);
  assert.match(choicePage, /templateExerciseNamesAvailable/);
  assert.match(matching, /clinicalTemplateMatchesDiagnosis/);
  assert.match(matching, /template\.exercises\.every/);
});

test("template plan remains a private editable draft", () => {
  assert.match(templateActions, /createDraftPlanForActor/);
  assert.match(templateActions, /addExerciseToPlanForActor/);
  assert.doesNotMatch(templateActions, /transitionPlanForActor/);
  assert.match(templateActions, /redirect\(editorUrl\(plan\)\)/);
});

test("template creation uses the authenticated physiotherapist and rolls back partial plans", () => {
  assert.match(templateActions, /requirePhysioActor\(\)/);
  assert.match(templateActions, /actor\.role !== "physio"/);
  assert.match(templateActions, /\.eq\("physio_id", actor\.profileId\)/);
  assert.match(templateActions, /\.eq\("status", "draft"\)/);
});

test("legacy create-plan links are routed through the choice screen while existing drafts still open directly", () => {
  assert.match(proxy, /pathname !== "\/physiotherapist-portal\/plan-builder"/);
  assert.match(proxy, /searchParams\.has\("planId"\)/);
  assert.match(proxy, /url\.pathname = "\/physiotherapist-portal\/plan-builder\/new"/);
});
