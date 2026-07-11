import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const sections = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];
const invalid = [];

for (const section of sections) {
  for (const [name, version] of Object.entries(packageJson[section] || {})) {
    const value = String(version).trim();
    if (!value || value === "latest" || value === "*" || /^[~^><=]/.test(value)) {
      invalid.push(`${section}.${name}=${value || "<empty>"}`);
    }
  }
}

if (packageJson.engines?.node !== ">=22 <23") {
  invalid.push(`engines.node=${packageJson.engines?.node || "<missing>"}`);
}

if (packageJson.packageManager !== "npm@10.9.2") {
  invalid.push(`packageManager=${packageJson.packageManager || "<missing>"}`);
}

if (invalid.length) {
  console.error("Dependency policy failed:\n- " + invalid.join("\n- "));
  process.exit(1);
}

console.log("Dependency policy passed: exact versions, Node 22 and npm 10 are enforced.");
