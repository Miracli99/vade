import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Platform } from "react-native";

type Entry = { kind: "directory" | "file"; content?: string };
const mockEntries = new Map<string, Entry>();
let mockCorruptNextIndexWrite = false;

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///documents/",
  EncodingType: { Base64: "base64" },
  StorageAccessFramework: {
    readDirectoryAsync: async (uri: string) =>
      [...mockEntries.keys()].filter((candidate) => {
        if (candidate === uri || !candidate.startsWith(`${uri}/`)) return false;
        return !candidate.slice(uri.length + 1).includes("/");
      }),
    makeDirectoryAsync: async (parent: string, name: string) => {
      const uri = `${parent}/${name}`;
      mockEntries.set(uri, { kind: "directory" });
      return uri;
    },
    createFileAsync: async (parent: string, name: string, mimeType: string) => {
      const extension = mimeType === "application/json" ? ".json" : "";
      const uri = `${parent}/${name}${extension}`;
      mockEntries.set(uri, { kind: "file", content: "" });
      return uri;
    },
    writeAsStringAsync: async (uri: string, content: string) => {
      if (mockCorruptNextIndexWrite && uri.endsWith("/index.json")) {
        mockCorruptNextIndexWrite = false;
        mockEntries.set(uri, { kind: "file", content: "{" });
        throw new Error("interruption simulee");
      }
      mockEntries.set(uri, { kind: "file", content });
    },
    readAsStringAsync: async (uri: string) => mockEntries.get(uri)?.content ?? "",
    deleteAsync: async (uri: string) => {
      for (const candidate of [...mockEntries.keys()]) {
        if (candidate === uri || candidate.startsWith(`${uri}/`)) mockEntries.delete(candidate);
      }
    },
  },
  makeDirectoryAsync: async () => undefined,
  copyAsync: async () => undefined,
  deleteAsync: async () => undefined,
  getInfoAsync: async () => ({ exists: false }),
}));

jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: async (_algorithm: string, value: string) =>
    require("node:crypto").createHash("sha256").update(value).digest("hex"),
  digest: async (_algorithm: string, value: Uint8Array) =>
    require("node:crypto").createHash("sha256").update(value).digest().buffer,
}));

import type { Character } from "../../types/game";
import { readCharacterDirectory, syncCharacterDirectory } from "./syncRepository";

const PICKED_ROOT = "content://picked";

beforeAll(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
});

function character(id: string, name: string): Character {
  return {
    id,
    name,
    archetypeId: "libre",
    archetype: "Exorciste",
    theme: "humain",
    pv: { current: 10, max: 10, bonus: 0 },
    psy: { current: 5, max: 5, bonus: 0 },
    armor: { current: 0, max: 0, bonus: 0 },
    attackBonus: 0,
    stats: { physique: 0, mentale: 0, sociale: 0 },
    skills: [], equipment: [], spells: [], activeSpellIds: [], statusEffects: [],
    resistances: [], inventory: [], stance: "focus",
  };
}

beforeEach(() => {
  mockEntries.clear();
  mockEntries.set(PICKED_ROOT, { kind: "directory" });
  mockCorruptNextIndexWrite = false;
});

describe("miroir Android incrementiel", () => {
  it("reecrit uniquement le personnage modifie et garde son dossier apres renommage", async () => {
    const agnes = character("agnes", "Agnes");
    const marco = character("marco", "Marco");
    await syncCharacterDirectory([agnes, marco], PICKED_ROOT);

    const result = await syncCharacterDirectory(
      [{ ...agnes, name: "Soeur Agnes" }, marco],
      PICKED_ROOT,
      new Set(["agnes"]),
    );

    expect(result.writtenCount).toBe(1);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/characters/character-agnes`)).toBe(true);
    expect([...mockEntries.keys()].filter((uri) => uri.includes("/character-agnes/character-") && uri.endsWith(".json"))).toHaveLength(1);
  });

  it("supprime un dossier de personnage seulement apres la mise a jour de l'index", async () => {
    const agnes = character("agnes", "Agnes");
    const marco = character("marco", "Marco");
    await syncCharacterDirectory([agnes, marco], PICKED_ROOT);
    const result = await syncCharacterDirectory([marco], PICKED_ROOT, new Set());

    expect(result.deletedCount).toBe(1);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/characters/character-agnes`)).toBe(false);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/characters/character-marco`)).toBe(true);
  });

  it("restaure le dernier index valide apres une interruption d'ecriture", async () => {
    const agnes = character("agnes", "Agnes");
    await syncCharacterDirectory([agnes], PICKED_ROOT);
    mockCorruptNextIndexWrite = true;
    await expect(syncCharacterDirectory([{ ...agnes, name: "Agnes interrompue" }], PICKED_ROOT)).rejects.toThrow("interruption");

    const restored = await readCharacterDirectory(PICKED_ROOT);
    expect(restored.characters[0]?.name).toBe("Agnes");
    expect(restored.rebuiltIndex).toBe(false);
  });

  it("reconstruit un index absent a partir des petites fiches", async () => {
    const agnes = character("agnes", "Agnes");
    await syncCharacterDirectory([agnes], PICKED_ROOT);
    mockEntries.delete(`${PICKED_ROOT}/VadeRetro/index.json`);
    mockEntries.delete(`${PICKED_ROOT}/VadeRetro/index.previous.json`);

    const result = await readCharacterDirectory(PICKED_ROOT);
    expect(result.rebuiltIndex).toBe(true);
    expect(result.characters.map((item) => item.id)).toEqual(["agnes"]);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/index.json`)).toBe(true);
  });
});
