import React from "react";
import { Platform } from "react-native";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("./src/screens/home", () => ({ HomeScreen: "HomeScreen" }));
jest.mock("./src/screens/character", () => ({ CharacterSheetScreen: "CharacterSheetScreen" }));
jest.mock("./src/screens/history", () => ({ HistoryScreen: "HistoryScreen" }));
jest.mock("./src/screens/media", () => ({ MediaLibraryScreen: "MediaLibraryScreen" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaProvider: "SafeAreaProvider", SafeAreaView: "SafeAreaView" }));
jest.mock("expo-status-bar", () => ({ StatusBar: "StatusBar" }));
jest.mock("./src/data/sampleCharacters", () => ({ sampleCharacters: [{ id: "demo", name: "Demo" }] }));
jest.mock("./src/utils/characters", () => ({ normalizeCharacter: (value: unknown) => value }));
jest.mock("./src/features/characters/characterRepository", () => ({
  characterRepository: { load: jest.fn(), save: jest.fn() },
}));
jest.mock("./src/features/media/mediaRepository", () => ({
  mediaRepository: { initialize: jest.fn() }, migrateLegacyCharacterMedia: jest.fn(),
}));
jest.mock("./src/features/data-transfer/archiveService", () => ({ archiveService: { import: jest.fn(), export: jest.fn() } }));
jest.mock("./src/utils/persistence", () => ({
  loadSyncDirectoryUri: jest.fn(), syncCharactersToDirectory: jest.fn(),
}));
jest.mock("./src/utils/updates", () => ({ fetchUpdateManifest: jest.fn(), isRemoteVersionNewer: jest.fn() }));

import App from "./App";
import { characterRepository } from "./src/features/characters/characterRepository";
import { mediaRepository, migrateLegacyCharacterMedia } from "./src/features/media/mediaRepository";
import { loadSyncDirectoryUri, syncCharactersToDirectory } from "./src/utils/persistence";
import type { Character } from "./src/types/game";
import { archiveService } from "./src/features/data-transfer/archiveService";
import { TransferProgress } from "./src/features/data-transfer/TransferProgress";

// react-test-renderer is supplied by the jest-expo preset.
const { act, create } = require("react-test-renderer") as {
  act: (callback: () => void | Promise<void>) => Promise<void>;
  create: (element: React.ReactElement) => { unmount: () => void; root: { findByType: (type: unknown) => { props: Record<string, unknown> } } };
};
let root: ReturnType<typeof create> | undefined;
const savedCharacter = { id: "saved", name: "Personnage sauvegarde" } as Character;
// The first native render also transforms React Native's lazily loaded modules.
jest.setTimeout(15000);

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  jest.mocked(characterRepository.load).mockResolvedValue({ characters: [savedCharacter], selectedId: "saved" });
  jest.mocked(characterRepository.save).mockResolvedValue(undefined);
  jest.mocked(mediaRepository.initialize).mockResolvedValue(undefined);
  jest.mocked(migrateLegacyCharacterMedia).mockImplementation(async (value) => value);
  jest.mocked(loadSyncDirectoryUri).mockResolvedValue("content://saved-mirror");
});

describe("indicateur de transfert", () => {
  it("reste visible pendant l'export et bloque un second lancement", async () => {
    let complete!: () => void;
    jest.mocked(archiveService.export).mockReturnValue(new Promise<void>((resolve) => { complete = resolve; }));
    await mount();
    const exportCharacter = root!.root.findByType("HomeScreen").props.onExportCharacter as (id: string) => void;
    await act(() => { exportCharacter("saved"); exportCharacter("saved"); });
    expect(root!.root.findByType(TransferProgress).props.operation).toBe("export");
    expect(archiveService.export).toHaveBeenCalledTimes(1);
    await act(async () => { complete(); });
    expect(root!.root.findByType(TransferProgress).props.operation).toBeNull();
  });

  it("ferme l'indicateur lorsque la selection d'import est annulee", async () => {
    let cancel!: (value: null) => void;
    jest.mocked(archiveService.import).mockReturnValue(new Promise<null>((resolve) => { cancel = resolve; }));
    await mount();
    const importCharacter = root!.root.findByType("HomeScreen").props.onImportCharacters as () => void;
    await act(() => { importCharacter(); });
    expect(root!.root.findByType(TransferProgress).props.operation).toBe("import");
    await act(async () => { cancel(null); });
    expect(root!.root.findByType(TransferProgress).props.operation).toBeNull();
  });

  it("ferme l'indicateur et affiche l'erreur si l'export echoue", async () => {
    jest.mocked(archiveService.export).mockRejectedValue(new Error("Stockage indisponible"));
    await mount();
    const exportCharacter = root!.root.findByType("HomeScreen").props.onExportCharacter as (id: string) => void;
    await act(async () => { exportCharacter("saved"); });
    expect(root!.root.findByType(TransferProgress).props.operation).toBeNull();
    expect(root!.root.findByType("HomeScreen").props.message).toContain("Stockage indisponible");
  });
});

afterEach(async () => {
  await act(() => root?.unmount());
  root = undefined;
  jest.useRealTimers();
});

async function mount() {
  await act(async () => { root = create(<App />); });
  await act(async () => { jest.advanceTimersByTime(1000); });
}

describe("protection de la sauvegarde au demarrage", () => {
  it.each(["characters", "media", "directory", "migration"])(
    "n'ecrit ni les exemples ni le miroir si %s echoue",
    async (failure) => {
      const error = new Error("Lecture impossible");
      if (failure === "characters") jest.mocked(characterRepository.load).mockRejectedValue(error);
      if (failure === "media") jest.mocked(mediaRepository.initialize).mockRejectedValue(error);
      if (failure === "directory") jest.mocked(loadSyncDirectoryUri).mockRejectedValue(error);
      if (failure === "migration") jest.mocked(migrateLegacyCharacterMedia).mockRejectedValue(error);
      await mount();
      expect(characterRepository.save).not.toHaveBeenCalled();
      expect(syncCharactersToDirectory).not.toHaveBeenCalled();
    },
  );

  it("sauvegarde les personnages charges apres un demarrage reussi", async () => {
    await mount();
    expect(characterRepository.save).toHaveBeenCalledWith([savedCharacter], "saved");
  });

  it("initialise les exemples seulement si aucune sauvegarde n'existe", async () => {
    jest.mocked(characterRepository.load).mockResolvedValue({ characters: null, selectedId: null });
    await mount();
    expect(characterRepository.save).toHaveBeenCalledWith([{ id: "demo", name: "Demo" }], "demo");
  });
});
