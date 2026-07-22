const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  calculateVersionCode,
  extractVersionSection,
  parseVersion,
  readChangelog,
  readPackageVersion,
} = require("./versioning");

const ROOT = path.resolve(__dirname, "..");

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  throw new Error(`Version invalide: ${message}`);
}

function run() {
  const version = readPackageVersion(ROOT);
  parseVersion(version);
  const versionCode = calculateVersionCode(version);
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, "package-lock.json"), "utf8"));
  if (lock.version !== version || lock.packages?.[""]?.version !== version) {
    fail(
      "package-lock.json ne correspond pas à package.json. " +
        "Ne modifiez pas la version à la main ; utilisez `npm run release -- patch|minor|major|X.Y.Z`.",
    );
  }

  const config = require(path.join(ROOT, "app.config.js"));
  if (config.expo?.version !== version) fail("la configuration Expo ne reprend pas package.json.");
  if (config.expo?.android?.versionCode !== versionCode) fail("le versionCode Expo est divergent.");
  if (fs.existsSync(path.join(ROOT, "app.json"))) fail("app.json ne doit plus contenir une seconde configuration.");

  const gradle = fs.readFileSync(path.join(ROOT, "android/app/build.gradle"), "utf8");
  if (!gradle.includes('file("$projectRoot/package.json")')) fail("Gradle ne lit pas package.json.");
  if (!gradle.includes("require('./scripts/versioning').calculateVersionCode")) {
    fail("Gradle n'utilise pas le calculateur de version partagé.");
  }
  if (!/versionName\s+appVersionName/.test(gradle) || !/versionCode\s+appVersionCode/.test(gradle)) {
    fail("Gradle n'utilise pas les valeurs calculées.");
  }
  if (/versionCode\s+\d+/.test(gradle)) fail("un versionCode Android est encore codé en dur.");

  const changelog = readChangelog(ROOT);
  if (!extractVersionSection(changelog, version)) fail(`CHANGELOG.md ne contient pas [${version}].`);

  let tag = readArgument("--tag") || process.env.EXPECTED_TAG;
  if (!tag) {
    const tags = execFileSync("git", ["tag", "--points-at", "HEAD"], { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .find((candidate) => /^v\d+\.\d+\.\d+$/.test(candidate));
    tag = tags;
  }
  if (tag && tag !== `v${version}`) fail(`le tag ${tag} ne correspond pas à v${version}.`);

  console.log(`Version ${version} cohérente · Android ${versionCode}${tag ? ` · ${tag}` : ""}`);
}

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
