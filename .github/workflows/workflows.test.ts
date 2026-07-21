import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "@jest/globals";

describe("workflows de publication", () => {
  const ci = readFileSync(resolve(process.cwd(), ".github/workflows/ci.yml"), "utf8");
  const release = readFileSync(resolve(process.cwd(), ".github/workflows/release.yml"), "utf8");

  it("ne publie aucune release sur les push ordinaires", () => {
    expect(ci).toContain("branches: [main, master]");
    expect(ci).not.toContain("action-gh-release");
    expect(ci).not.toContain("deploy-pages");
  });

  it("publie seulement depuis un tag semantique et sans notes automatiques", () => {
    expect(release).toContain('"v*.*.*"');
    expect(release).toContain('version:check -- --tag "$GITHUB_REF_NAME"');
    expect(release).toContain("generate_release_notes: false");
    expect(release).toContain("body_path: release-body.md");
    expect(release).not.toContain("apk-${SHORT_SHA}");
  });
});
