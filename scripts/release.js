const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const {
  CHANGELOG_UNRELEASED_TEMPLATE,
  extractHighlights,
  extractUnreleasedSection,
  parseVersion,
  readPackageVersion,
} = require("./versioning");

const ROOT = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function bump(version, request) {
  const current = parseVersion(version);
  if (/^\d+\.\d+\.\d+$/.test(request)) {
    parseVersion(request);
    return request;
  }
  if (request === "major") return `${current.major + 1}.0.0`;
  if (request === "minor") return `${current.major}.${current.minor + 1}.0`;
  if (request === "patch") return `${current.major}.${current.minor}.${current.patch + 1}`;
  throw new Error("Usage: npm run release -- patch|minor|major|X.Y.Z");
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Commande échouée: ${command} ${args.join(" ")}`);
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  const request = process.argv[2];
  if (!request) throw new Error("Usage: npm run release -- patch|minor|major|X.Y.Z");
  const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" }).trim();
  if (dirty) throw new Error("Le dépôt doit être propre avant de préparer une release.");

  const currentVersion = readPackageVersion(ROOT);
  const nextVersion = bump(currentVersion, request);
  if (compareVersions(nextVersion, currentVersion) <= 0) {
    throw new Error(`La nouvelle version ${nextVersion} doit être supérieure à ${currentVersion}.`);
  }
  const changelogFile = path.join(ROOT, "CHANGELOG.md");
  const packageFile = path.join(ROOT, "package.json");
  const lockFile = path.join(ROOT, "package-lock.json");
  const originals = new Map([
    [changelogFile, fs.readFileSync(changelogFile, "utf8")],
    [packageFile, fs.readFileSync(packageFile, "utf8")],
    [lockFile, fs.readFileSync(lockFile, "utf8")],
  ]);
  const unreleased = extractUnreleasedSection(originals.get(changelogFile));
  if (!extractHighlights(unreleased, 1).length) {
    throw new Error("La section Unreleased doit contenir au moins une entrée avant la release.");
  }

  const date = new Date().toISOString().slice(0, 10);
  const released = `## [${nextVersion}] - ${date}\n\n${unreleased}\n`;
  const changelog = originals.get(changelogFile).replace(
    /^## \[Unreleased\]\s*\n[\s\S]*?(?=^## \[)/m,
    `${CHANGELOG_UNRELEASED_TEMPLATE}\n${released}\n`,
  );
  const packageJson = JSON.parse(originals.get(packageFile));
  const lock = JSON.parse(originals.get(lockFile));
  packageJson.version = nextVersion;
  lock.version = nextVersion;
  lock.packages[""].version = nextVersion;

  try {
    fs.writeFileSync(changelogFile, changelog);
    writeJson(packageFile, packageJson);
    writeJson(lockFile, lock);
    run(npmCommand, ["run", "version:check"]);
    run(npmCommand, ["run", "typecheck"]);
    run(npmCommand, ["test", "--", "--runInBand"]);
    run(npmCommand, ["run", "export:web"]);
  } catch (error) {
    for (const [file, content] of originals) fs.writeFileSync(file, content);
    throw error;
  }

  run("git", ["add", "package.json", "package-lock.json", "CHANGELOG.md"]);
  run("git", ["commit", "-m", `chore(release): v${nextVersion}`]);
  run("git", ["tag", "-a", `v${nextVersion}`, "-m", `Vade Retro v${nextVersion}`]);
  console.log(`Release v${nextVersion} prête localement. Publiez-la avec: git push --follow-tags`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
