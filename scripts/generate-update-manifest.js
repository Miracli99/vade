const fs = require("fs");
const path = require("path");
const {
  calculateVersionCode,
  extractHighlights,
  extractVersionSection,
  readChangelog,
  readPackageVersion,
} = require("./versioning");

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const version = readPackageVersion();
const apkUrl = argument("--apk-url");
const releaseUrl = argument("--release-url");
const output = argument("--output");
if (!apkUrl || !releaseUrl || !output) {
  throw new Error("Usage: generate-update-manifest --apk-url URL --release-url URL --output FILE");
}
const section = extractVersionSection(readChangelog(), version);
if (!section) throw new Error(`Changelog absent pour ${version}.`);
const highlights = extractHighlights(section, 5);
const manifest = {
  schemaVersion: 2,
  version,
  versionCode: calculateVersionCode(version),
  apkUrl,
  highlights,
  releaseUrl,
  publishedAt: new Date().toISOString(),
  // Compatibilité temporaire avec les clients qui ne connaissent que le schéma v1.
  notes: highlights.map((highlight) => `- ${highlight}`).join("\n"),
};
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(path.resolve(output), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest ${version} écrit dans ${output}.`);
