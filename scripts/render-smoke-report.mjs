import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const inputPath = process.env.SMOKE_REPORT_PATH || process.argv[2] || "reports/production-smoke-test.json";
const outputPath = process.env.SMOKE_MARKDOWN_PATH || process.argv[3] || "reports/production-smoke-test.md";

if (!existsSync(inputPath)) {
  console.error(`Smoke report JSON not found: ${inputPath}`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(inputPath, "utf8"));
const failures = report.results.filter((result) => !result.ok);

function row(result) {
  const status = result.ok ? "✅ Pass" : "❌ Fail";
  return `| ${result.route} | ${result.status} | ${status} | ${result.ms ?? "—"} | ${result.reason.replace(/\|/g, "\\|")} |`;
}

const markdown = `# Production smoke test report

Generated: ${report.generatedAt}

Base URL: ${report.baseUrl}

Status: **${report.status.toUpperCase()}**

## Summary

| Metric | Value |
| --- | ---: |
| Total routes | ${report.total} |
| Passed | ${report.passed} |
| Failed | ${report.failed} |

## Route results

| Route | HTTP status | Result | ms | Reason |
| --- | ---: | --- | ---: | --- |
${report.results.map(row).join("\n")}

## Next action

${failures.length
  ? "Fix failed routes before pilot launch. Create route-failure issues for each failed route and rerun `npm run smoke:production`."
  : "All public smoke-test routes passed. Continue with protected-route/manual QA and pilot preparation."}
`;

const absoluteOutput = resolve(outputPath);
mkdirSync(dirname(absoluteOutput), { recursive: true });
writeFileSync(absoluteOutput, markdown);
console.log(`Markdown smoke report written to ${outputPath}`);
