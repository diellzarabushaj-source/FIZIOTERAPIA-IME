import assert from "node:assert/strict";
import test from "node:test";
import {
  createPatientSession,
  PATIENT_AUTH_SESSIONS_TABLE,
  revokeAllPatientSessions,
  revokePatientSession,
  validatePatientSession,
} from "../../lib/backend/patient-sessions.ts";

type QueryCall = {
  method: string;
  args: unknown[];
};

function queryChain(finalValue: unknown, calls: QueryCall[]) {
  const chain: Record<string, (...args: unknown[]) => unknown> = {};
  for (const method of ["select", "update", "insert", "eq", "is", "gt"]) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      if (method === "insert") return Promise.resolve(finalValue);
      return chain;
    };
  }
  chain.maybeSingle = () => Promise.resolve(finalValue);
  return chain;
}

test("patient session creation stores only token and metadata hashes", async () => {
  const calls: QueryCall[] = [];
  const previousSecret = process.env.PATIENT_SESSION_SECRET;
  process.env.PATIENT_SESSION_SECRET = "a".repeat(64);

  try {
    const supabase = {
      from(table: string) {
        assert.equal(table, PATIENT_AUTH_SESSIONS_TABLE);
        return queryChain({ error: null }, calls);
      },
    };

    const token = await createPatientSession({
      supabase: supabase as never,
      patientId: "patient-1",
      ipAddress: "203.0.113.10",
      userAgent: "Test Browser",
    });

    assert.match(token, /^[A-Za-z0-9_-]{40,}$/);
    const insert = calls.find((call) => call.method === "insert");
    assert.ok(insert);
    const payload = insert.args[0] as Record<string, unknown>;
    assert.equal(payload.patient_id, "patient-1");
    assert.match(String(payload.token_hash), /^[a-f0-9]{64}$/);
    assert.notEqual(payload.token_hash, token);
    assert.match(String(payload.ip_hash), /^[a-f0-9]{64}$/);
    assert.match(String(payload.user_agent_hash), /^[a-f0-9]{64}$/);
    assert.equal(JSON.stringify(payload).includes("203.0.113.10"), false);
    assert.equal(JSON.stringify(payload).includes("Test Browser"), false);
  } finally {
    if (previousSecret === undefined) delete process.env.PATIENT_SESSION_SECRET;
    else process.env.PATIENT_SESSION_SECRET = previousSecret;
  }
});

test("patient session validation is scoped by patient and hashed token", async () => {
  const calls: QueryCall[] = [];
  const now = new Date();
  const row = {
    id: "session-1",
    expires_at: new Date(now.getTime() + 60_000).toISOString(),
    last_used_at: now.toISOString(),
    revoked_at: null,
  };
  const supabase = {
    from(table: string) {
      assert.equal(table, PATIENT_AUTH_SESSIONS_TABLE);
      return queryChain({ data: row, error: null }, calls);
    },
  };

  assert.equal(await validatePatientSession({
    supabase: supabase as never,
    patientId: "patient-7",
    token: "secret-session-token",
  }), true);

  const eqCalls = calls.filter((call) => call.method === "eq");
  assert.deepEqual(eqCalls[0]?.args, ["patient_id", "patient-7"]);
  assert.equal(eqCalls[1]?.args[0], "token_hash");
  assert.match(String(eqCalls[1]?.args[1]), /^[a-f0-9]{64}$/);
  assert.notEqual(eqCalls[1]?.args[1], "secret-session-token");
  assert.ok(calls.some((call) => call.method === "is" && call.args[0] === "revoked_at"));
  assert.ok(calls.some((call) => call.method === "gt" && call.args[0] === "expires_at"));
});

test("missing, revoked or unknown registry token fails closed", async () => {
  const supabase = {
    from() {
      return queryChain({ data: null, error: null }, []);
    },
  };

  assert.equal(await validatePatientSession({
    supabase: supabase as never,
    patientId: "patient-1",
    token: null,
  }), false);
  assert.equal(await validatePatientSession({
    supabase: supabase as never,
    patientId: "patient-1",
    token: "unknown-token",
  }), false);
});

test("individual patient logout revokes the hashed token with a bounded reason", async () => {
  const calls: QueryCall[] = [];
  const supabase = {
    from(table: string) {
      assert.equal(table, PATIENT_AUTH_SESSIONS_TABLE);
      return queryChain({ data: { id: "session-1" }, error: null }, calls);
    },
  };

  const reason = "x".repeat(180);
  assert.equal(await revokePatientSession({
    supabase: supabase as never,
    token: "logout-token",
    reason,
  }), true);

  const update = calls.find((call) => call.method === "update");
  assert.ok(update);
  const payload = update.args[0] as Record<string, unknown>;
  assert.equal(String(payload.revoked_reason).length, 100);
  const tokenEq = calls.find(
    (call) => call.method === "eq" && call.args[0] === "token_hash",
  );
  assert.match(String(tokenEq?.args[1]), /^[a-f0-9]{64}$/);
  assert.notEqual(tokenEq?.args[1], "logout-token");
});

test("physiotherapist or administrator can revoke all active sessions for one patient", async () => {
  const calls: QueryCall[] = [];
  const supabase = {
    from(table: string) {
      assert.equal(table, PATIENT_AUTH_SESSIONS_TABLE);
      return queryChain({
        data: [{ id: "session-1" }, { id: "session-2" }],
        error: null,
      }, calls);
    },
  };

  const count = await revokeAllPatientSessions({
    supabase: supabase as never,
    patientId: "patient-2",
    reason: "access_code_rotated",
  });

  assert.equal(count, 2);
  assert.ok(calls.some(
    (call) => call.method === "eq"
      && call.args[0] === "patient_id"
      && call.args[1] === "patient-2",
  ));
  assert.ok(calls.some(
    (call) => call.method === "is"
      && call.args[0] === "revoked_at"
      && call.args[1] === null,
  ));
});
