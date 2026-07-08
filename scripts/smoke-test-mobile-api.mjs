const BASE_URL = process.env.SMOKE_BASE_URL || "https://fizioterapia-ime.vercel.app";
const PATIENT_CODE = process.env.MOBILE_SMOKE_PATIENT_CODE || "";

async function postJson(path, payload) {
  const startedAt = Date.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "fizioterapia-ime-mobile-api-smoke/1.0",
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  return { path, status: response.status, ok: response.ok, ms: Date.now() - startedAt, data };
}

const checks = [];

const missingCode = await postJson("/api/mobile/patient-session", {});
checks.push({
  name: "patient-session validates missing code",
  status: missingCode.status,
  ok: missingCode.status === 400,
  expected: "400",
  detail: missingCode.data?.error || "",
  ms: missingCode.ms,
});

const invalidProgress = await postJson("/api/mobile/save-progress", {});
checks.push({
  name: "save-progress validates required fields",
  status: invalidProgress.status,
  ok: invalidProgress.status === 400,
  expected: "400",
  detail: invalidProgress.data?.error || "",
  ms: invalidProgress.ms,
});

if (PATIENT_CODE) {
  const session = await postJson("/api/mobile/patient-session", { code: PATIENT_CODE });
  checks.push({
    name: "patient-session loads configured patient code",
    status: session.status,
    ok: session.status === 200 && Boolean(session.data?.patient?.id),
    expected: "200 + patient.id",
    detail: session.data?.patient?.name || session.data?.error || "",
    ms: session.ms,
  });
} else {
  checks.push({
    name: "patient-session real patient smoke",
    status: "skipped",
    ok: true,
    expected: "set MOBILE_SMOKE_PATIENT_CODE to run",
    detail: "Skipped because no patient code was provided.",
    ms: null,
  });
}

console.table(checks.map(({ name, status, ok, expected, detail, ms }) => ({ name, status, ok, expected, detail, ms })));

const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  console.error(`\nMobile API smoke test failed for ${failures.length} check(s).`);
  process.exit(1);
}

console.log(`\nMobile API smoke test passed for ${checks.length} check(s).`);
