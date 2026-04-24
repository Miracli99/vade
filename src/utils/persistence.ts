import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { Character } from "../types/game";

const STORAGE_KEY = "vade-retro.characters.v1";
const SELECTION_KEY = "vade-retro.selected-character.v1";
const SYNC_DIRECTORY_URI_KEY = "vade-retro.sync-directory-uri.v1";
const CHARACTER_SYNC_PREFIX = "character-";
const CHARACTER_SYNC_SUFFIX = ".json";
const JSON_MIME_TYPE = "application/json";

type SyncCharacterFile = {
  version: 1;
  exportedAt: string;
  character: Character;
};

export async function loadCharactersFromStorage() {
  const rawCharacters = await AsyncStorage.getItem(STORAGE_KEY);
  const rawSelectedId = await AsyncStorage.getItem(SELECTION_KEY);

  return {
    characters: rawCharacters ? (JSON.parse(rawCharacters) as Character[]) : null,
    selectedId: rawSelectedId,
  };
}

export async function persistCharactersToStorage(
  characters: Character[],
  selectedId: string,
) {
  await AsyncStorage.multiSet([
    [STORAGE_KEY, JSON.stringify(characters)],
    [SELECTION_KEY, selectedId],
  ]);
}

export async function loadSyncDirectoryUri() {
  return AsyncStorage.getItem(SYNC_DIRECTORY_URI_KEY);
}

export async function persistSyncDirectoryUri(directoryUri: string | null) {
  if (!directoryUri) {
    await AsyncStorage.removeItem(SYNC_DIRECTORY_URI_KEY);
    return;
  }

  await AsyncStorage.setItem(SYNC_DIRECTORY_URI_KEY, directoryUri);
}

export async function pickSyncDirectory(): Promise<string | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted || !permissions.directoryUri) {
    return null;
  }

  return permissions.directoryUri;
}

export async function syncCharactersToDirectory(characters: Character[], directoryUri: string) {
  if (Platform.OS !== "android") {
    throw new Error("La sync par dossier est disponible uniquement sur Android.");
  }

  const existingEntries = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
  const expectedUris = new Set<string>();

  for (const character of characters) {
    const fileName = getCharacterSyncFileName(character.id);
    let fileUri = findExistingCharacterFileUri(existingEntries, fileName);

    if (!fileUri) {
      fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        JSON_MIME_TYPE,
      );
    }

    const payload: SyncCharacterFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      character,
    };

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    expectedUris.add(fileUri);
  }

  for (const entryUri of existingEntries) {
    if (!isCharacterSyncEntry(entryUri) || expectedUris.has(entryUri)) {
      continue;
    }

    await FileSystem.deleteAsync(entryUri, { idempotent: true });
  }
}

export async function importCharactersFromDirectory(directoryUri: string): Promise<Character[]> {
  if (Platform.OS !== "android") {
    throw new Error("Le rechargement par dossier est disponible uniquement sur Android.");
  }

  const entryUris = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
  const characterUris = entryUris.filter(isCharacterSyncEntry);
  const jsonUris = entryUris.filter(isJsonEntry);
  const importUris = characterUris.length ? characterUris : jsonUris;
  const importedCharacters: Character[] = [];
  const parseErrors: string[] = [];

  for (const entryUri of importUris) {
    try {
      const text = await FileSystem.readAsStringAsync(entryUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = JSON.parse(text) as
        | Character[]
        | Character
        | SyncCharacterFile
        | { characters?: Character[] };

      if (isSyncCharacterFile(parsed)) {
        importedCharacters.push(parsed.character);
        continue;
      }

      if (Array.isArray(parsed)) {
        importedCharacters.push(...parsed);
        continue;
      }

      if (hasCharactersArray(parsed)) {
        importedCharacters.push(...parsed.characters);
        continue;
      }

      importedCharacters.push(parsed as Character);
    } catch {
      parseErrors.push(getUriFileName(entryUri));
    }
  }

  if (!importedCharacters.length) {
    if (parseErrors.length) {
      throw new Error("Aucun JSON lisible dans le dossier.");
    }

    throw new Error("Aucun fichier JSON trouve dans le dossier.");
  }

  return importedCharacters;
}

export async function exportCharacters(characters: Character[], fileName = "vade-retro-characters.json") {
  const payload = JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      characters,
    },
    null,
    2,
  );

  if (Platform.OS === "web") {
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, payload, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

export async function importCharacters(): Promise<Character[] | null> {
  if (Platform.OS === "web") {
    const file = await pickWebFile();

    if (!file) {
      return null;
    }

    const text = await file.text();
    return parseImportedCharacters(text);
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const text = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return parseImportedCharacters(text);
}

function parseImportedCharacters(text: string) {
  const parsed = JSON.parse(text) as
    | Character[]
    | { characters?: Character[] };

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.characters)) {
    return parsed.characters;
  }

  throw new Error("Format JSON invalide.");
}

function pickWebFile() {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

function getCharacterSyncFileName(characterId: string) {
  // Keep the sync file name tied to the stable id so renaming a character does not create duplicates.
  return `${CHARACTER_SYNC_PREFIX}${characterId}${CHARACTER_SYNC_SUFFIX}`;
}

function findExistingCharacterFileUri(entryUris: string[], fileName: string) {
  return entryUris.find((entryUri) => getUriFileName(entryUri) === fileName) ?? null;
}

function isCharacterSyncEntry(entryUri: string) {
  const fileName = getUriFileName(entryUri);
  return fileName.startsWith(CHARACTER_SYNC_PREFIX) && fileName.includes(CHARACTER_SYNC_SUFFIX);
}

function isJsonEntry(entryUri: string) {
  return getUriFileName(entryUri).includes(CHARACTER_SYNC_SUFFIX);
}

function getUriFileName(entryUri: string) {
  const decodedUri = decodeURIComponent(entryUri).split("?")[0] ?? entryUri;
  const normalizedUri = decodedUri.replace(/\\/g, "/");
  return normalizedUri.slice(normalizedUri.lastIndexOf("/") + 1);
}

function isSyncCharacterFile(value: unknown): value is SyncCharacterFile {
  return Boolean(
    value &&
      typeof value === "object" &&
      "character" in value &&
      (value as SyncCharacterFile).version === 1,
  );
}

function hasCharactersArray(value: unknown): value is { characters: Character[] } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "characters" in value &&
      Array.isArray((value as { characters?: Character[] }).characters),
  );
}
