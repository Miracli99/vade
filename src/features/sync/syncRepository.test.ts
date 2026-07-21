import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "@jest/globals";

import { getMediaUsage } from "../media/mediaRepository";
import { Character } from "../../types/game";
import {
  collectReferencedMediaIds,
  getCharacterDirectoryName,
  isValidSyncIndex,
} from "./syncRepository";
import { isSupportedArchiveManifest, isSupportedLegacyJson } from "../../utils/persistence";

function character(overrides: Partial<Character> = {}): Character {
  return {
    id: "agnes-id",
    name: "Soeur Agnes",
    archetypeId: "libre",
    archetype: "Exorciste",
    theme: "humain",
    pv: { current: 10, max: 10, bonus: 0 },
    psy: { current: 5, max: 5, bonus: 0 },
    armor: { current: 0, max: 0, bonus: 0 },
    attackBonus: 0,
    stats: { physique: 0, mentale: 0, sociale: 0 },
    skills: [],
    equipment: [],
    spells: [],
    activeSpellIds: [],
    statusEffects: [],
    resistances: [],
    inventory: [],
    stance: "focus",
    ...overrides,
  };
}

describe("structure incrementale de synchronisation", () => {
  it("garde le meme dossier quand un personnage est renomme", () => {
    const before = character();
    const after = { ...before, name: "Agnes Renommee" };
    expect(getCharacterDirectoryName(before.id)).toBe(getCharacterDirectoryName(after.id));
    expect(getCharacterDirectoryName(before.id)).toBe("character-agnes-id");
  });

  it("deduplique un media partage par plusieurs emplacements", () => {
    const value = character({
      imageId: "custom-shared",
      spells: [{
        id: "spell-1",
        name: "Don",
        imageId: "custom-shared",
        basePsyCost: 1,
        reducible: false,
        description: "",
        tags: [],
        activeEffects: [],
        passiveEffects: [],
      }],
    });
    expect([...collectReferencedMediaIds([value])]).toEqual(["custom-shared"]);
    expect(getMediaUsage("custom-shared", [value])).toHaveLength(2);
  });

  it("conserve un media partage quand un personnage est supprime", () => {
    const agnes = character({ id: "agnes", imageId: "custom-shared" });
    const marco = character({ id: "marco", name: "Marco", imageId: "custom-shared" });
    expect(getMediaUsage("custom-shared", [agnes, marco])).toHaveLength(2);
    expect(getMediaUsage("custom-shared", [marco])).toHaveLength(1);
  });

  it("rejette un index corrompu pour permettre sa reconstruction", () => {
    expect(isValidSyncIndex({ version: 1, characters: [] })).toBe(false);
    expect(isValidSyncIndex({ version: 1, syncVersion: 2, updatedAt: "now", characters: [], media: [] })).toBe(true);
  });

  it("reconnait les manifests ZIP v3 et v4", () => {
    const value = character();
    expect(isSupportedArchiveManifest({ version: 3, exportedAt: "now", characters: [value] })).toBe(true);
    expect(isSupportedArchiveManifest({ version: 4, exportedAt: "now", characters: [value], media: [] })).toBe(true);
    expect(isSupportedArchiveManifest({ version: 5, characters: [value] })).toBe(false);
  });

  it("importe les enveloppes JSON v1 et v2", () => {
    const value = character();
    expect(isSupportedLegacyJson({ version: 1, character: value })).toBe(true);
    expect(isSupportedLegacyJson({ version: 2, character: value })).toBe(true);
    expect(isSupportedLegacyJson({ version: 2, character: { id: "incomplet" } })).toBe(false);
  });

  it("ne charge jamais jszip statiquement au demarrage", () => {
    const source = readFileSync(resolve(process.cwd(), "src/utils/persistence.ts"), "utf8");
    expect(source).not.toMatch(/^import\s+JSZip\s+from\s+["']jszip["']/m);
    expect(source).toContain('import("jszip")');
  });
});
