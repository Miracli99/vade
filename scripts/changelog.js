const { extractVersionSection, readChangelog, readPackageVersion } = require("./versioning");

const version = process.argv[2] || readPackageVersion();
const section = extractVersionSection(readChangelog(), version);
if (!section) {
  console.error(`Aucune section de changelog pour ${version}.`);
  process.exit(1);
}
process.stdout.write(`${section}\n`);
