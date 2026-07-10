import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("high pain stop is enforced in the database", () => {
  const migration = read("supabase/migrations/20260710_serialize_daily_high_pain_stop.sql");
  assert.match(migration, /pain_score >= 7/);
  assert.match(migration, /HIGH_PAIN_STOP_ACTIVE/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /p_patient_id::text \|\| ':' \|\| v_today::text/);
});

test("patient dashboard exposes a persistent physiotherapist contact action", () => {
  const layout = read("app/patient-dashboard/layout.tsx");
  assert.match(layout, /href="\/patient-contact"/);
  assert.match(layout, /Kontakto fizioterapeutin/);
});

test("patient contact page supports whatsapp phone and email", () => {
  const page = read("app/patient-contact/page.tsx");
  assert.match(page, /https:\/\/wa\.me\//);
  assert.match(page, /tel:/);
  assert.match(page, /mailto:/);
  assert.match(page, /Dhimbje 7\/10 ose më shumë/);
});

test("remaining completion forms are hidden after a high pain alert", () => {
  const styles = read("app/patient-dashboard/patient-safety.css");
  assert.match(styles, /:has\(\.patient-simple-stop\)/);
  assert.match(styles, /\.patient-simple-form\{display:none\}/);
});
