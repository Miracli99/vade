import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { File as ExpoFile, FileMode } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { Character } from "../types/game";
import {
  makeCharacterPortable,
  materializeCharacterImages,
} from "./imageStorage";

const STORAGE_KEY = "vade-retro.characters.v1";
const SELECTION_KEY = "vade-retro.selected-character.v1";
const SYNC_DIRECTORY_URI_KEY = "vade-retro.sync-directory-uri.v1";
const CHARACTER_SYNC_PREFIX = "character-";
const CHARACTER_SYNC_SUFFIX = ".json";
const JSON_MIME_TYPE = "application/json";
const VALID_STANCES = new Set(["focus", "combat", "defensif"]);
const JSON_READ_CHUNK_SIZE = 512 * 1024;

type SyncCharacterFile = {
  version: 1 | 2;
  exportedAt: string;
  character: Character;
};

export type DirectoryImportResult = {
  characters: Character[];
  skippedFiles: Array<{
    fileName: string;
    characterId: string | null;
  }>;
};

export async function loadCharactersFromStorage() {
  const rawCharacters = await AsyncStorage.getItem(STORAGE_KEY);
  const rawSelectedId = await AsyncStorage.getItem(SELECTION_KEY);

  return {
    characters: rawCharacters
      ? await materializeCharacters(
          JSON.parse(rawCharacters) as Character[],
        )
      : null,
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
  const existingCharacterFiles = await findExistingSyncCharacterFiles(existingEntries);
  let writtenCount = 0;

  for (const character of characters) {
    const fileName = getCharacterSyncFileName(character.id);
    let fileUri = existingCharacterFiles.get(character.id);

    if (!fileUri) {
      fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        stripFileExtension(fileName),
        JSON_MIME_TYPE,
      );
    }

    const payload: SyncCharacterFile = {
      version: 2,
      exportedAt: new Date().toISOString(),
      // A sync file must be autonomous: cloud providers expose opaque child URIs,
      // so sibling image files cannot be resolved reliably on another device.
      character: await makeCharacterPortable(character),
    };

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const writtenFile = await FileSystem.getInfoAsync(fileUri);

    if (!writtenFile.exists || !writtenFile.size) {
      throw new Error(`Le fichier de ${character.name} n'a pas ete cree.`);
    }

    existingCharacterFiles.set(character.id, fileUri);
    writtenCount += 1;
  }

  return { writtenCount };
}

export async function importCharactersFromDirectory(
  directoryUri: string,
): Promise<DirectoryImportResult> {
  if (Platform.OS !== "android") {
    throw new Error("Le rechargement par dossier est disponible uniquement sur Android.");
  }

  const entryUris = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
  // Cloud document providers can expose opaque URIs without the display name.
  // Try every non-image entry and identify JSON files from their contents.
  const importUris = entryUris.filter(isPossibleJsonEntry);
  const importedCharacters: Character[] = [];
  const skippedFiles: DirectoryImportResult["skippedFiles"] = [];

  for (const entryUri of importUris) {
    try {
      const text = readLargeTextFile(entryUri);

      const parsed = JSON.parse(text) as unknown;
      const extractedCharacters = extractImportedCharacters(parsed);
      const entriesByName = new Map(entryUris.map((uri) => [getUriFileName(uri), uri]));
      importedCharacters.push(
        ...(await materializeCharacters(
          extractedCharacters,
          (fileName) => entriesByName.get(fileName) ?? null,
        )),
      );
    } catch {
      const fileName = getUriFileName(entryUri);
      skippedFiles.push({
        fileName,
        characterId: getCharacterIdFromSyncFileName(fileName),
      });
    }
  }

  if (!importedCharacters.length) {
    if (skippedFiles.length) {
      throw new Error(
        `Aucun JSON lisible dans le dossier. Fichier(s) ignore(s): ${formatFileList(
          skippedFiles.map((file) => file.fileName),
        )}.`,
      );
    }

    throw new Error("Aucun fichier JSON trouve dans le dossier.");
  }

  return {
    characters: importedCharacters,
    skippedFiles,
  };
}

export async function exportCharacters(characters: Character[], fileName = "vade-retro-characters.json") {
  const portableCharacters =
    Platform.OS === "web"
      ? characters
      : await makeCharactersPortable(characters);
  const payload = JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      characters: portableCharacters,
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

  const text = readLargeTextFile(result.assets[0].uri);

  return parseImportedCharacters(text);
}

async function parseImportedCharacters(text: string) {
  const parsed = JSON.parse(text) as unknown;
  return materializeCharacters(extractImportedCharacters(parsed));
}

async function materializeCharacters(
  characters: Character[],
  resolveSyncAsset?: (fileName: string) => string | null,
) {
  const materializedCharacters: Character[] = [];

  for (const character of characters) {
    materializedCharacters.push(await materializeCharacterImages(character, resolveSyncAsset));
  }

  return materializedCharacters;
}

async function makeCharactersPortable(characters: Character[]) {
  const portableCharacters: Character[] = [];

  for (const character of characters) {
    portableCharacters.push(await makeCharacterPortable(character));
  }

  return portableCharacters;
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

function getCharacterIdFromSyncFileName(fileName: string) {
  if (!fileName.startsWith(CHARACTER_SYNC_PREFIX) || !fileName.endsWith(CHARACTER_SYNC_SUFFIX)) {
    return null;
  }

  return fileName.slice(
    CHARACTER_SYNC_PREFIX.length,
    fileName.length - CHARACTER_SYNC_SUFFIX.length,
  );
}

function isJsonEntry(entryUri: string) {
  return getUriFileName(entryUri).endsWith(CHARACTER_SYNC_SUFFIX);
}

function isPossibleJsonEntry(entryUri: string) {
  const fileName = getUriFileName(entryUri).toLowerCase();
  return isJsonEntry(entryUri) || !/\.(png|jpe?g|webp|gif)$/.test(fileName);
}

async function findExistingSyncCharacterFiles(entryUris: string[]) {
  const filesByCharacterId = new Map<string, string>();

  for (const entryUri of entryUris.filter(isPossibleJsonEntry)) {
    try {
      const text = readLargeTextFile(entryUri);
      const parsed = JSON.parse(text) as unknown;

      if (isSyncCharacterFile(parsed)) {
        filesByCharacterId.set(parsed.character.id, entryUri);
      }
    } catch {
      // Non-JSON files are allowed in the selected directory.
    }
  }

  return filesByCharacterId;
}

function stripFileExtension(fileName: string) {
  return fileName.endsWith(CHARACTER_SYNC_SUFFIX)
    ? fileName.slice(0, -CHARACTER_SYNC_SUFFIX.length)
    : fileName;
}

function getUriFileName(entryUri: string) {
  const decodedUri = decodeURIComponent(entryUri).split("?")[0] ?? entryUri;
  const normalizedUri = decodedUri.replace(/\\/g, "/");
  return normalizedUri.slice(normalizedUri.lastIndexOf("/") + 1);
}

function extractImportedCharacters(value: unknown): Character[] {
  const candidates = getImportedCharacterCandidates(value);

  if (!candidates.length || !candidates.every(isImportableCharacter)) {
    throw new Error("Format JSON invalide.");
  }

  return candidates;
}

function readLargeTextFile(uri: string) {
  const handle = new ExpoFile(uri).open(FileMode.ReadOnly);
  const decoder = new TextDecoder();
  const chunks: string[] = [];

  try {
    while (handle.size !== null && handle.offset !== null && handle.offset < handle.size) {
      const bytes = handle.readBytes(
        Math.min(JSON_READ_CHUNK_SIZE, handle.size - handle.offset),
      );

      if (!bytes.length) {
        break;
      }

      chunks.push(decoder.decode(bytes, { stream: true }));
    }

    chunks.push(decoder.decode());
    return chunks.join("");
  } finally {
    handle.close();
  }
}

function getImportedCharacterCandidates(value: unknown): unknown[] {
  if (isSyncCharacterFile(value)) {
    return [value.character];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (hasCharactersArray(value)) {
    return value.characters;
  }

  return [value];
}

function isSyncCharacterFile(value: unknown): value is SyncCharacterFile {
  return (
    isRecord(value) &&
    (value.version === 1 || value.version === 2) &&
    isImportableCharacter(value.character)
  );
}

function hasCharactersArray(value: unknown): value is { characters: unknown[] } {
  return isRecord(value) && Array.isArray(value.characters);
}

function isImportableCharacter(value: unknown): value is Character {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.archetype) &&
    isRecord(value.pv) &&
    isRecord(value.psy) &&
    isRecord(value.armor) &&
    isRecord(value.stats) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.equipment) &&
    Array.isArray(value.spells) &&
    Array.isArray(value.activeSpellIds) &&
    Array.isArray(value.statusEffects) &&
    Array.isArray(value.resistances) &&
    Array.isArray(value.inventory) &&
    typeof value.stance === "string" &&
    VALID_STANCES.has(value.stance)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function formatFileList(fileNames: string[]) {
  return fileNames.slice(0, 3).join(", ") + (fileNames.length > 3 ? ` +${fileNames.length - 3}` : "");
}
