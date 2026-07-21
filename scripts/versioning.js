const fs = require("fs");
const path = require("path");

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const CHANGELOG_UNRELEASED_TEMPLATE = `## [Unreleased]

### Nouveautés

### Améliorations

### Corrections
`;

function parseVersion(version) {
  const match = SEMVER_PATTERN.exec(version);
  if (!match) throw new Error(`Version SemVer stable invalide: ${version}`);
  const [, majorText, minorText, patchText] = match;
  const major = Number(majorText);
  const minor = Number(minorText);
  const patch = Number(patchText);
  if (major > 21 || minor > 999 || patch > 999) {
    throw new Error("Version trop grande pour le versionCode Android.");
  }
  return { major, minor, patch };
}

function calculateVersionCode(version) {
  const { major, minor, patch } = parseVersion(version);
  // Mmmpppbb: réserve deux chiffres de build et donne 0.2.10 -> 201000.
  return major * 100_000_000 + minor * 100_000 + patch * 100;
}

function readPackageVersion(rootDirectory = path.resolve(__dirname, "..")) {
  return require(path.join(rootDirectory, "package.json")).version;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractVersionSection(changelog, version) {
  const expression = new RegExp(
    `^## \\[${escapeRegExp(version)}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`,
    "m",
  );
  return expression.exec(changelog)?.[1]?.trim() ?? null;
}

function extractUnreleasedSection(changelog) {
  return /^## \[Unreleased\]\s*\n([\s\S]*?)(?=^## \[|(?![\s\S]))/m.exec(changelog)?.[1]?.trim() ?? null;
}

function extractHighlights(section, limit = 5) {
  if (!section) return [];
  return section
    .split(/\r?\n/)
    .map((line) => /^\s*-\s+(.+?)\s*$/.exec(line)?.[1])
    .filter(Boolean)
    .slice(0, limit);
}

function readChangelog(rootDirectory = path.resolve(__dirname, "..")) {
  return fs.readFileSync(path.join(rootDirectory, "CHANGELOG.md"), "utf8");
}

module.exports = {
  CHANGELOG_UNRELEASED_TEMPLATE,
  calculateVersionCode,
  extractHighlights,
  extractUnreleasedSection,
  extractVersionSection,
  parseVersion,
  readChangelog,
  readPackageVersion,
};
