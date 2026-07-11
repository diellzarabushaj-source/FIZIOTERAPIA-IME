import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const root = new URL("../", import.meta.url);
const packageJsonUrl = new URL("package.json", root);
const packageLockUrl = new URL("package-lock.json", root);
const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));

const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const dependencySections = ["dependencies", "devDependencies"];
const problems = [];

for (const section of dependencySections) {
  for (const [name, version] of Object.entries(packageJson[section] || {})) {
    if (typeof version !== "string" || !exactVersionPattern.test(version)) {
      problems.push(`${section}.${name} must use an exact semantic version, received ${JSON.stringify(version)}`);
    }
  }
}

if (packageJson.packageManager !== "npm@10.9.2") {
  problems.push(`packageManager must be npm@10.9.2, received ${JSON.stringify(packageJson.packageManager)}`);
}

if (packageJson.engines?.node !== ">=22 <23") {
  problems.push(`engines.node must be ">=22 <23", received ${JSON.stringify(packageJson.engines?.node)}`);
}

if (packageJson.engines?.npm !== ">=10 <11") {
  problems.push(`engines.npm must be ">=10 <11", received ${JSON.stringify(packageJson.engines?.npm)}`);
}

if (packageJson.dependencies?.react !== packageJson.dependencies?.["react-dom"]) {
  problems.push("react and react-dom must use the same exact version");
}

if (packageJson.dependencies?.next !== packageJson.devDependencies?.["eslint-config-next"]) {
  problems.push("next and eslint-config-next must use the same exact version");
}

let hasLockfile = true;
try {
  await access(packageLockUrl, constants.R_OK);
} catch {
  hasLockfile = false;
}

if (hasLockfile) {
  const packageLock = JSON.parse(await readFile(packageLockUrl, "utf8"));
  const rootPackage = packageLock.packages?.[""];

  if (packageLock.lockfileVersion !== 3) {
    problems.push(`package-lock.json must use lockfileVersion 3, received ${JSON.stringify(packageLock.lockfileVersion)}`);
  }

  if (!rootPackage) {
    problems.push("package-lock.json is missing the root package entry");
  } else {
    for (const section of dependencySections) {
      const expected = packageJson[section] || {};
      const locked = rootPackage[section] || {};
      for (const [name, version] of Object.entries(expected)) {
        if (locked[name] !== version) {
          problems.push(`package-lock.json does not match ${section}.${name}: expected ${version}, received ${JSON.stringify(locked[name])}`);
        }
      }
    }
  }
} else if (process.env.REQUIRE_PACKAGE_LOCK === "1") {
  problems.push("package-lock.json is required but was not found");
}

if (problems.length > 0) {
  console.error("Dependency policy check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Dependency policy check passed (${hasLockfile ? "lockfile verified" : "lockfile bootstrap pending"}).`);
