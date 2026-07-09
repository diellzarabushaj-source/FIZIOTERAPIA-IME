const BASE_URL = process.env.SMOKE_BASE_URL || "https://fizioterapia-ime.vercel.app";

async function getText(path) {
  const startedAt = Date.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "user-agent": "fizioterapia-ime-sanity-smoke/1.0",
    },
  });
  const text = await response.text();
  return { path, status: response.status, ok: response.ok, text, ms: Date.now() - startedAt };
}

async function getJson(path) {
  const result = await getText(path);
  let data = null;
  try {
    data = JSON.parse(result.text);
  } catch {
    data = { raw: result.text.slice(0, 300) };
  }
  return { ...result, data };
}

function pushHtmlCheck(checks, result, name, expectedText) {
  checks.push({
    name,
    path: result.path,
    status: result.status,
    ok: result.status === 200 && result.text.includes(expectedText),
    expected: `200 + ${expectedText}`,
    detail: result.text.includes(expectedText) ? "Rendered" : "Missing expected text",
    ms: result.ms,
  });
}

const checks = [];

const health = await getJson("/api/sanity/health");
checks.push({
  name: "Sanity content health endpoint ready",
  path: "/api/sanity/health",
  status: health.status,
  ok: health.status === 200 && health.data?.ok === true && Number(health.data?.postCount || 0) >= 1 && Number(health.data?.faqCount || 0) >= 1 && Number(health.data?.legalPageCount || 0) >= 5,
  expected: "200 + posts + FAQ + legal pages",
  detail: health.data?.status || health.data?.error || "",
  ms: health.ms,
});

const blog = await getText("/blog");
pushHtmlCheck(checks, blog, "Blog index renders Sanity/fallback posts", "Si funksionon plani digjital");

const post = await getText("/blog/si-funksionon-plani-digjital-i-fizioterapise");
pushHtmlCheck(checks, post, "Blog post renders Portable Text/fallback content", "AI Movement Check jep vetëm feedback");

const faq = await getText("/faq");
pushHtmlCheck(checks, faq, "FAQ renders Sanity/fallback items", "A e zëvendëson AI fizioterapeutin?");

const privacy = await getText("/privacy");
pushHtmlCheck(checks, privacy, "Privacy page renders Sanity/fallback legal content", "Politika e privatësisë");

const disclaimer = await getText("/medical-disclaimer");
pushHtmlCheck(checks, disclaimer, "Safety disclaimer renders Sanity/fallback legal content", "AI Movement Check");

console.table(checks.map(({ name, path, status, ok, expected, detail, ms }) => ({ name, path, status, ok, expected, detail, ms })));

const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  console.error(`\nSanity content smoke test failed for ${failures.length} check(s).`);
  process.exit(1);
}

console.log(`\nSanity content smoke test passed for ${checks.length} check(s).`);
