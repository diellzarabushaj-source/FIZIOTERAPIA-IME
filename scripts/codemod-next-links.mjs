import { readFile, writeFile } from "node:fs/promises";

const files = [
  "app/admin-hidden/page.tsx",
  "app/blog/[slug]/page.tsx",
  "app/blog/page.tsx",
  "app/launch-checklist/page.tsx",
  "app/page.tsx",
  "app/physiotherapist-dashboard/page.tsx",
  "app/pilot-feedback/page.tsx",
  "app/pilot-feedback/success/page.tsx",
  "app/pilot-onboarding/page.tsx",
  "app/product-flow/page.tsx",
  "app/qa-checklist/page.tsx",
  "components/LegalPage.tsx",
];

const internalAnchorPattern = /<a(\s+[^>]*href=["']\/(?!\/)[^"']*["'][^>]*)>([\s\S]*?)<\/a>/g;

for (const file of files) {
  let source = await readFile(file, "utf8");
  const converted = source.replace(internalAnchorPattern, "<Link$1>$2</Link>");
  if (converted === source) continue;

  source = converted;
  if (!source.includes('from "next/link"') && !source.includes("from 'next/link'")) {
    const directive = '"use client";\n\n';
    source = source.startsWith(directive)
      ? `${directive}import Link from "next/link";\n`
      : `import Link from "next/link";\n${source}`;
  }

  await writeFile(file, source);
  console.log(`Converted internal anchors in ${file}`);
}
