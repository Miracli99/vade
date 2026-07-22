import { describe, expect, it } from "@jest/globals";

const {
  calculateVersionCode,
  extractHighlights,
  extractUnreleasedSection,
  extractVersionSection,
  findDisallowedReleaseChanges,
  parseVersion,
} = require("./versioning") as {
  calculateVersionCode: (version: string) => number;
  extractHighlights: (section: string | null, limit?: number) => string[];
  extractUnreleasedSection: (changelog: string) => string | null;
  extractVersionSection: (changelog: string, version: string) => string | null;
  findDisallowedReleaseChanges: (status: string) => string[];
  parseVersion: (version: string) => { major: number; minor: number; patch: number };
};

describe("versionnement centralise", () => {
  it("calcule le versionCode Android attendu", () => {
    expect(calculateVersionCode("0.2.10")).toBe(201000);
    expect(calculateVersionCode("1.0.0")).toBe(100000000);
    expect(calculateVersionCode("1.2.3")).toBeGreaterThan(calculateVersionCode("1.2.2"));
  });

  it("refuse les prereleases et versions incompletes", () => {
    expect(() => parseVersion("0.3")).toThrow("SemVer");
    expect(() => parseVersion("0.3.0-beta.1")).toThrow("SemVer");
  });

  it("extrait une version et limite les highlights", () => {
    const changelog = `# Changelog\n\n## [Unreleased]\n\n### Nouveautés\n\n- À venir\n\n## [0.2.10] - 2026-06-21\n\n### Nouveautés\n\n- Un\n- Deux\n- Trois\n- Quatre\n- Cinq\n- Six\n`;
    expect(extractUnreleasedSection(changelog)).toContain("À venir");
    const section = extractVersionSection(changelog, "0.2.10");
    expect(section).toContain("Six");
    expect(extractHighlights(section, 5)).toEqual(["Un", "Deux", "Trois", "Quatre", "Cinq"]);
  });

  it("autorise uniquement le changelog modifié avant une release", () => {
    expect(findDisallowedReleaseChanges("")).toEqual([]);
    expect(findDisallowedReleaseChanges(" M CHANGELOG.md\n")).toEqual([]);
    expect(findDisallowedReleaseChanges("M  CHANGELOG.md\n")).toEqual([]);
    expect(findDisallowedReleaseChanges(" M CHANGELOG.md\n M package.json\n?? notes.txt\n")).toEqual([
      " M package.json",
      "?? notes.txt",
    ]);
  });
});
