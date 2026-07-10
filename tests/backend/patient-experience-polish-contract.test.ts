import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("patient dashboard has clear loading and recoverable error states", async () => {
  const loading = await read("app/patient-dashboard/loading.tsx");
  const error = await read("app/patient-dashboard/error.tsx");

  assert.match(loading, /Po hapet plani yt/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(error, /Provo përsëri/);
  assert.match(error, /Hyr përsëri me kod/);
  assert.match(error, /reset\(\)/);
});

test("patient shell exposes network feedback and a skip link", async () => {
  const layout = await read("app/patient-dashboard/layout.tsx");
  const network = await read("components/PatientNetworkStatus.tsx");

  assert.match(layout, /PatientNetworkStatus/);
  assert.match(layout, /Kalo direkt te plani/);
  assert.match(layout, /id="patient-content"/);
  assert.match(network, /window\.addEventListener\("offline"/);
  assert.match(network, /Nuk ka internet/);
  assert.match(network, /Interneti u kthye/);
});

test("patient polish preserves accessible focus, touch and reduced motion", async () => {
  const css = await read("app/patient-dashboard/patient-polish.css");

  assert.match(css, /focus-visible/);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:420px/);
  assert.match(css, /min-height:54px/);
});
