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
      const extension = mimeType === "application/json" ? ".json"
        : mimeType === "image/png" ? ".png"
          : mimeType === "image/webp" ? ".webp" : "";
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
import { mediaRepository } from "../media/mediaRepository";

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
  jest.restoreAllMocks();
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
    expect([...mockEntries.keys()].filter((uri) => uri.includes("/character-agnes/character-") && uri.endsWith(".json"))).toHaveLength(2);
  });

  it("conserve le personnage supprime jusqu'a la rotation de l'index de secours", async () => {
    const agnes = character("agnes", "Agnes");
    const marco = character("marco", "Marco");
    await syncCharacterDirectory([agnes, marco], PICKED_ROOT);
    const result = await syncCharacterDirectory([marco], PICKED_ROOT, new Set());

    expect(result.deletedCount).toBe(0);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/characters/character-agnes`)).toBe(true);
    const rotated = await syncCharacterDirectory([marco], PICKED_ROOT, new Set());
    expect(rotated.deletedCount).toBe(1);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/characters/character-agnes`)).toBe(false);
    expect(mockEntries.has(`${PICKED_ROOT}/VadeRetro/characters/character-marco`)).toBe(true);
  });

  it("restaure les fiches modifiees et supprimees apres corruption de l'index courant", async () => {
    const agnes = character("agnes", "Agnes");
    const marco = character("marco", "Marco");
    await syncCharacterDirectory([agnes, marco], PICKED_ROOT);
    await syncCharacterDirectory([{ ...agnes, name: "Agnes modifiee" }], PICKED_ROOT);
    mockEntries.set(`${PICKED_ROOT}/VadeRetro/index.json`, { kind: "file", content: "{" });

    const restored = await readCharacterDirectory(PICKED_ROOT);
    expect(restored.characters.map((entry) => entry.name)).toEqual(["Agnes", "Marco"]);
    expect(restored.skippedFiles).toEqual([]);
  });

  it("ne conserve que les deux generations de fiches encore referencees", async () => {
    const agnes = character("agnes", "Agnes");
    await syncCharacterDirectory([agnes], PICKED_ROOT);
    await syncCharacterDirectory([{ ...agnes, name: "Agnes 2" }], PICKED_ROOT);
    await syncCharacterDirectory([{ ...agnes, name: "Agnes 3" }], PICKED_ROOT);
    const files = [...mockEntries.entries()].filter(([uri]) =>
      uri.includes("/character-agnes/character-") && uri.endsWith(".json"),
    );
    expect(files.map(([, entry]) => JSON.parse(entry.content!).name).sort()).toEqual(["Agnes 2", "Agnes 3"]);
  });

  it("ne nettoie pas les fichiers recuperables si les deux index sont absents", async () => {
    const agnes = character("agnes", "Agnes");
    await syncCharacterDirectory([agnes], PICKED_ROOT);
    const oldFile = [...mockEntries.keys()].find((uri) => uri.includes("/character-agnes/character-"))!;
    mockEntries.delete(`${PICKED_ROOT}/VadeRetro/index.json`);
    const orphanMedia = `${PICKED_ROOT}/VadeRetro/media/recoverable.webp`;
    mockEntries.set(orphanMedia, { kind: "file", content: "image" });
    await syncCharacterDirectory([{ ...agnes, name: "Agnes 2" }], PICKED_ROOT);
    expect(mockEntries.has(oldFile)).toBe(true);
    expect(mockEntries.has(orphanMedia)).toBe(true);
  });

  it("conserve les medias de secours puis les nettoie apres rotation", async () => {
    const hash = "a".repeat(64);
    jest.spyOn(mediaRepository, "get").mockImplementation((id) => id === "custom-test" ? {
      id, label: "Test", category: "character", origin: "custom", tags: [],
      mimeType: "image/png", contentHash: hash,
    } : undefined);
    jest.spyOn(mediaRepository, "readBytes").mockResolvedValue(new Uint8Array([1, 2, 3]));
    const agnes = character("agnes", "Agnes");
    await syncCharacterDirectory([{ ...agnes, imageId: "custom-test" }], PICKED_ROOT);
    const mediaFiles = () => [...mockEntries.keys()].filter((uri) => uri.includes(`/media/${hash}`));
    expect(mediaFiles()).toHaveLength(1);
    await syncCharacterDirectory([agnes], PICKED_ROOT);
    expect(mediaFiles()).toHaveLength(1);
    await syncCharacterDirectory([agnes], PICKED_ROOT);
    expect(mediaFiles()).toHaveLength(0);
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
