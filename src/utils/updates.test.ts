import { describe, expect, it } from "@jest/globals";

import { isRemoteVersionNewer, parseUpdateManifest } from "./updates";

describe("manifest de mise a jour", () => {
  it("accepte le schema v2 et limite les nouveautés a cinq", () => {
    const manifest = parseUpdateManifest({
      schemaVersion: 2,
      version: "0.3.0",
      versionCode: 300000,
      apkUrl: "https://example.test/app.apk",
      releaseUrl: "https://example.test/release",
      publishedAt: "2026-07-21T00:00:00.000Z",
      highlights: ["Un", "Deux", "Trois", "Quatre", "Cinq", "Six"],
    });
    expect(manifest).toMatchObject({ schemaVersion: 2, version: "0.3.0", versionCode: 300000 });
    expect(manifest?.highlights).toEqual(["Un", "Deux", "Trois", "Quatre", "Cinq"]);
  });

  it("convertit les anciennes notes du schema v1", () => {
    const manifest = parseUpdateManifest({
      version: "0.2.10",
      apkUrl: "https://example.test/app.apk",
      notes: "- Première nouveauté\n- Deuxième nouveauté",
    });
    expect(manifest).toEqual({
      schemaVersion: 1,
      version: "0.2.10",
      versionCode: undefined,
      apkUrl: "https://example.test/app.apk",
      highlights: ["Première nouveauté", "Deuxième nouveauté"],
      releaseUrl: undefined,
      publishedAt: undefined,
    });
  });

  it("gere un manifest sans notes et rejette un manifest incomplet", () => {
    expect(parseUpdateManifest({ version: "0.3.0", apkUrl: "https://example.test/app.apk" })?.highlights).toEqual([]);
    expect(parseUpdateManifest({ version: "0.3.0" })).toBeNull();
    expect(isRemoteVersionNewer("0.2.10", "0.3.0")).toBe(true);
  });
});
