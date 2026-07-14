import assert from "node:assert/strict";
import test from "node:test";
import { hasValidMonitorSecret } from "../../src/server/monitoring/monitor-auth.ts";

test("monitor authentication accepts only an exact secret", () => {
  assert.equal(hasValidMonitorSecret("monitor-secret", "monitor-secret"), true);
  assert.equal(hasValidMonitorSecret("monitor-secreu", "monitor-secret"), false);
  assert.equal(hasValidMonitorSecret("short", "monitor-secret"), false);
});

test("monitor authentication fails closed when either value is missing", () => {
  assert.equal(hasValidMonitorSecret(null, "monitor-secret"), false);
  assert.equal(hasValidMonitorSecret("monitor-secret", undefined), false);
  assert.equal(hasValidMonitorSecret("", "monitor-secret"), false);
});
