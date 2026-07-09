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

const checks = [];

const health = await getJson("/api/sanity/health");
checks.push({
  name: "Sanity health endpoint ready",
  path: "/api/sanity/health",
  status: health.status,
  ok: health.status === 200 && health.data?.ok === true && Number(health.data?.postCount || 0) >= 1,
  expected: "200 + ok + postCount >= 1",
  detail: health.data?.status || health.data?.error || "",
  ms: health.ms,
});

const blog = await getText("/blog");
checks.push({
  name: "Blog index renders Sanity/fallback posts",
  path: "/blog",
  status: blog.status,
  ok: blog.status === 200 && blog.text.includes("Artikuj të thjeshtë") && blog.text.includes("Si funksionon plani digjital"),
  expected: "200 + blog content",
  detail: blog.text.includes("Sanity connected") ? "Sanity connected" : "Rendered",
  ms: blog.ms,
});

const post = await getText("/blog/si-funksionon-plani-digjital-i-fizioterapise");
checks.push({
  name: "Blog post renders Portable Text/fallback content",
  path: "/blog/si-funksionon-plani-digjital-i-fizioterapise",
  status: post.status,
  ok: post.status === 200 && post.text.includes("Pacienti hyn vetëm me kod") && post.text.includes("AI Movement Check jep vetëm feedback"),
  expected: "200 + article + safety text",
  detail: post.text.includes("Siguri klinike") ? "Safety visible" : "Rendered",
  ms: post.ms,
});

console.table(checks.map(({ name, path, status, ok, expected, detail, ms }) => ({ name, path, status, ok, expected, detail, ms })));

const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  console.error(`\nSanity blog smoke test failed for ${failures.length} check(s).`);
  process.exit(1);
}

console.log(`\nSanity blog smoke test passed for ${checks.length} check(s).`);
