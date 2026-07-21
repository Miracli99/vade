import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { File as ExpoFile, FileMode } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type JSZip from "jszip";
import { Platform } from "react-native";

import { Character } from "../types/game";
import {
  getSyncAssetFileName,
  materializeCharacterImages,
} from "./imageStorage";
import {
  prepareSyncRoot,
  readCharacterDirectory,
  syncCharacterDirectory,
  collectReferencedMediaIds,
} from "../features/sync/syncRepository";
import { mediaRepository } from "../features/media/mediaRepository";
import { getBuiltInMediaAsset } from "../features/media/mediaRegistry";
import { MediaCategory, MediaId } from "../features/media/types";

const STORAGE_KEY = "vade-retro.characters.v1";
const SELECTION_KEY = "vade-retro.selected-character.v1";
const SYNC_DIRECTORY_URI_KEY = "vade-retro.sync-directory-uri.v1";
const CHARACTER_SYNC_PREFIX = "character-";
const CHARACTER_SYNC_JSON_SUFFIX = ".json";
const CHARACTER_SYNC_ZIP_SUFFIX = ".zip";
const JSON_MIME_TYPE = "application/json";
const ZIP_MIME_TYPE = "application/zip";
const ZIP_MIME_TYPES = [
  ZIP_MIME_TYPE,
  "application/x-zip",
  "application/x-zip-compressed",
  "multipart/x-zip",
  "application/octet-stream",
];
const ARCHIVE_MANIFEST_PATH = "character.json";
const VALID_STANCES = new Set(["focus", "combat", "defensif"]);
const FILE_READ_CHUNK_SIZE = 512 * 1024;
const MAX_IMPORT_FILE_SIZE = 100 * 1024 * 1024;
const MAX_ARCHIVE_ASSET_COUNT = 100;
const MAX_ARCHIVE_ASSET_BASE64_SIZE = 140 * 1024 * 1024;

let storageWriteQueue: Promise<void> = Promise.resolve();
let jsZipModulePromise: Promise<typeof JSZip> | null = null;

type SyncCharacterFile = {
  version: 1 | 2;
  exportedAt: string;
  character: Character;
};

type CharacterArchiveFileV3 = {
  version: 3;
  exportedAt: string;
  characters: Character[];
};

type CharacterArchiveMedia = {
  id: MediaId;
  path: string;
  label: string;
  category: MediaCategory;
  origin: "builtin" | "custom";
  mimeType: string;
  contentHash?: string;
};

type CharacterArchiveFileV4 = {
  version: 4;
  exportedAt: string;
  characters: Character[];
  media: CharacterArchiveMedia[];
};

type ExistingSyncFile = {
  uri: string;
  format: "json" | "zip";
};

export type DirectoryImportResult = {
  characters: Character[];
  skippedFiles: Array<{
    fileName: string;
    characterId: string | null;
  }>;
  rebuiltIndex?: boolean;
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
  const serializedCharacters = JSON.stringify(characters);

  storageWriteQueue = storageWriteQueue
    .catch(() => undefined)
    .then(() =>
      AsyncStorage.multiSet([
        [STORAGE_KEY, serializedCharacters],
        [SELECTION_KEY, selectedId],
      ]),
    );

  await storageWriteQueue;
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

  return prepareSyncRoot(permissions.directoryUri);
}

export async function pickLegacySyncDirectory(): Promise<string | null> {
  if (Platform.OS !== "android") return null;
  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  return permissions.granted && permissions.directoryUri ? permissions.directoryUri : null;
}

export async function syncCharactersToDirectory(
  characters: Character[],
  directoryUri: string,
  characterIdsToWrite?: ReadonlySet<string>,
) {
  return syncCharacterDirectory(characters, directoryUri, characterIdsToWrite);
}

export async function importCharactersFromDirectory(
  directoryUri: string,
): Promise<DirectoryImportResult> {
  return readCharacterDirectory(directoryUri);
}

export async function importLegacyCharactersFromDirectory(
  directoryUri: string,
): Promise<DirectoryImportResult> {
  if (Platform.OS !== "android") {
    throw new Error("La migration de dossier est disponible uniquement sur Android.");
  }
  const entries = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri);
  const candidates = entries.filter((uri) => {
    const fileName = getUriFileName(uri).toLowerCase();
    return fileName.endsWith(".zip") || (fileName.startsWith(CHARACTER_SYNC_PREFIX) && fileName.endsWith(".json"));
  });
  const characters: Character[] = [];
  const skippedFiles: DirectoryImportResult["skippedFiles"] = [];

  for (const uri of candidates) {
    const fileName = getUriFileName(uri);
    try {
      characters.push(...(await parseCharacterFile(readBinaryFile(uri))));
    } catch {
      skippedFiles.push({ fileName, characterId: getCharacterIdFromSyncFileName(fileName) });
    }
  }
  if (!characters.length) {
    throw new Error("Aucun ancien ZIP ou JSON de personnage n'a ete trouve dans ce dossier.");
  }
  return { characters, skippedFiles };
}

export async function exportCharacters(characters: Character[], fileName = "vade-retro-characters.zip") {
  const safeFileName = replaceFileExtension(fileName, CHARACTER_SYNC_ZIP_SUFFIX);

  if (Platform.OS === "web") {
    const blob = await createCharacterArchive(characters, "blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFileName;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${safeFileName}`;
  const archiveBase64 = await createCharacterArchive(characters, "base64");
  await FileSystem.writeAsStringAsync(fileUri, archiveBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: ZIP_MIME_TYPE });
  }
}

export async function importCharacters(): Promise<Character[] | null> {
  if (Platform.OS === "web") {
    const file = await pickWebFile();

    if (!file) {
      return null;
    }

    return parseCharacterFile(new Uint8Array(await file.arrayBuffer()));
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: Platform.OS === "android" ? "*/*" : [JSON_MIME_TYPE, ...ZIP_MIME_TYPES],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return parseCharacterFile(readBinaryFile(result.assets[0].uri));
}

async function parseCharacterFile(bytes: Uint8Array) {
  if (!isZipBytes(bytes)) {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    return materializeCharacters(extractImportedCharacters(parsed));
  }

  const JSZipConstructor = await loadJSZip();
  const zip = await JSZipConstructor.loadAsync(bytes);
  const manifestEntry = zip.file(ARCHIVE_MANIFEST_PATH);

  if (!manifestEntry) {
    throw new Error("Archive invalide: character.json est absent.");
  }

  const manifest = JSON.parse(await manifestEntry.async("string")) as unknown;

  if (!isCharacterArchiveFile(manifest)) {
    throw new Error("Archive de personnage invalide.");
  }

  if (manifest.version === 4) {
    await mediaRepository.initialize();
    const remappedIds = new Map<MediaId, MediaId>();
    let totalAssetBase64Size = 0;
    if (manifest.media.length > MAX_ARCHIVE_ASSET_COUNT) {
      throw new Error("Archive refusee: trop d'images.");
    }
    for (const media of manifest.media) {
      if (getBuiltInMediaAsset(media.id)) continue;
      const entry = zip.file(media.path);
      if (!entry) {
        throw new Error(`Archive incomplete: image absente (${media.path}).`);
      }
      const base64 = await entry.async("base64");
      totalAssetBase64Size += base64.length;
      if (totalAssetBase64Size > MAX_ARCHIVE_ASSET_BASE64_SIZE) {
        throw new Error("Archive refusee: images trop volumineuses.");
      }
      const imported = await mediaRepository.import({
        uri: `data:${media.mimeType};base64,${base64}`,
        category: media.category,
        label: media.label,
        fileName: media.path.split("/").pop(),
        mimeType: media.mimeType,
      });
      remappedIds.set(media.id, imported.id);
    }
    return manifest.characters.map((character) => remapCharacterMediaIds(character, remappedIds));
  }

  const assets = new Map<string, string>();
  const referencedAssets = collectArchiveAssetPaths(manifest.characters);
  let totalAssetBase64Size = 0;

  if (referencedAssets.size > MAX_ARCHIVE_ASSET_COUNT) {
    throw new Error("Archive refusee: trop d'images.");
  }

  for (const assetPath of referencedAssets) {
    const assetEntry = zip.file(assetPath);

    if (!assetEntry) {
      throw new Error(`Archive incomplete: image absente (${assetPath}).`);
    }

    const base64 = await assetEntry.async("base64");
    totalAssetBase64Size += base64.length;

    if (totalAssetBase64Size > MAX_ARCHIVE_ASSET_BASE64_SIZE) {
      throw new Error("Archive refusee: images trop volumineuses.");
    }

    assets.set(assetPath, `data:${getArchiveMimeType(assetPath)};base64,${base64}`);
  }

  return materializeCharacters(
    manifest.characters,
    (fileName) => assets.get(fileName) ?? null,
  );
}

async function createCharacterArchive(
  characters: Character[],
  type: "base64",
): Promise<string>;
async function createCharacterArchive(
  characters: Character[],
  type: "blob",
): Promise<Blob>;
async function createCharacterArchive(characters: Character[], type: "base64" | "blob") {
  const JSZipConstructor = await loadJSZip();
  const zip = new JSZipConstructor();
  await mediaRepository.initialize();
  const archivedCharacters = characters;
  const media: CharacterArchiveMedia[] = [];
  for (const mediaId of collectReferencedMediaIds(archivedCharacters)) {
    const asset = mediaRepository.get(mediaId);
    if (!asset) continue;
    const bytes = await mediaRepository.readBytes(mediaId);
    if (!bytes) {
      if (asset.origin === "custom") {
        throw new Error(`Image introuvable pendant l'export: ${asset.label}.`);
      }
      continue;
    }
    const extension = asset.mimeType === "image/png" ? "png" : "webp";
    const path = `media/${sanitizePathSegment(mediaId)}.${extension}`;
    zip.file(path, bytes);
    media.push({
      id: mediaId,
      path,
      label: asset.label,
      category: asset.category,
      origin: asset.origin,
      mimeType: asset.mimeType,
      contentHash: asset.contentHash,
    });
  }

  const manifest: CharacterArchiveFileV4 = {
    version: 4,
    exportedAt: new Date().toISOString(),
    characters: archivedCharacters,
    media,
  };
  zip.file(ARCHIVE_MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  return type === "blob"
    ? zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
    : zip.generateAsync({ type: "base64", compression: "DEFLATE", compressionOptions: { level: 6 } });
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

function pickWebFile() {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip,.json,application/zip,application/json";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

function getCharacterSyncFileName(characterId: string) {
  // Keep the sync file name tied to the stable id so renaming a character does not create duplicates.
  return `${CHARACTER_SYNC_PREFIX}${characterId}${CHARACTER_SYNC_ZIP_SUFFIX}`;
}

function getCharacterIdFromSyncFileName(fileName: string) {
  const suffix = fileName.endsWith(CHARACTER_SYNC_ZIP_SUFFIX)
    ? CHARACTER_SYNC_ZIP_SUFFIX
    : fileName.endsWith(CHARACTER_SYNC_JSON_SUFFIX)
      ? CHARACTER_SYNC_JSON_SUFFIX
      : null;

  if (!fileName.startsWith(CHARACTER_SYNC_PREFIX) || !suffix) {
    return null;
  }

  return fileName.slice(
    CHARACTER_SYNC_PREFIX.length,
    fileName.length - suffix.length,
  );
}

function isPossibleCharacterEntry(entryUri: string) {
  const fileName = getUriFileName(entryUri).toLowerCase();
  return !/\.(png|jpe?g|webp|gif)$/.test(fileName);
}

async function findExistingSyncCharacterFiles(entryUris: string[]) {
  const filesByCharacterId = new Map<string, ExistingSyncFile[]>();

  for (const entryUri of entryUris.filter(isPossibleCharacterEntry)) {
    try {
      const inspected = await inspectCharacterFile(readBinaryFile(entryUri));

      for (const characterId of inspected.characterIds) {
        const currentFiles = filesByCharacterId.get(characterId) ?? [];
        currentFiles.push({ uri: entryUri, format: inspected.format });
        filesByCharacterId.set(characterId, currentFiles);
      }
    } catch {
      // Unrelated files are allowed in the selected directory.
    }
  }

  return filesByCharacterId;
}

function stripFileExtension(fileName: string) {
  return replaceFileExtension(fileName, "");
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

function readBinaryFile(uri: string) {
  const handle = new ExpoFile(uri).open(FileMode.ReadOnly);
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    if (handle.size !== null && handle.size > MAX_IMPORT_FILE_SIZE) {
      throw new Error("Fichier refuse: taille superieure a 100 Mo.");
    }

    while (handle.size !== null && handle.offset !== null && handle.offset < handle.size) {
      const bytes = handle.readBytes(
        Math.min(FILE_READ_CHUNK_SIZE, handle.size - handle.offset),
      );

      if (!bytes.length) {
        break;
      }

      chunks.push(bytes);
      totalLength += bytes.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } finally {
    handle.close();
  }
}

async function inspectCharacterFile(bytes: Uint8Array) {
  if (isZipBytes(bytes)) {
    const JSZipConstructor = await loadJSZip();
    const zip = await JSZipConstructor.loadAsync(bytes);
    const manifestEntry = zip.file(ARCHIVE_MANIFEST_PATH);

    if (!manifestEntry) {
      throw new Error("Manifest ZIP absent.");
    }

    const manifest = JSON.parse(await manifestEntry.async("string")) as unknown;

    if (!isCharacterArchiveFile(manifest)) {
      throw new Error("Manifest ZIP invalide.");
    }

    return {
      characterIds: manifest.characters.map((character) => character.id),
      format: "zip" as const,
    };
  }

  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  const characters = extractImportedCharacters(parsed);
  return {
    characterIds: characters.map((character) => character.id),
    format: "json" as const,
  };
}

function isZipBytes(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function isCharacterArchiveFile(value: unknown): value is CharacterArchiveFileV3 | CharacterArchiveFileV4 {
  return (
    isRecord(value) &&
    (value.version === 3 || value.version === 4) &&
    Array.isArray(value.characters) &&
    value.characters.length > 0 &&
    value.characters.length <= 100 &&
    value.characters.every(isImportableCharacter) &&
    (value.version === 3 || (Array.isArray(value.media) && value.media.every(isArchiveMedia)))
  );
}

export function isSupportedArchiveManifest(value: unknown) {
  return isCharacterArchiveFile(value);
}

export function isSupportedLegacyJson(value: unknown) {
  try {
    return extractImportedCharacters(value).length > 0;
  } catch {
    return false;
  }
}

function isArchiveMedia(value: unknown): value is CharacterArchiveMedia {
  return isRecord(value) &&
    isNonEmptyString(value.id) &&
    typeof value.path === "string" && value.path.trim().length > 0 &&
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.category) &&
    isNonEmptyString(value.origin) &&
    isNonEmptyString(value.mimeType) &&
    !value.path.includes("..") &&
    !value.path.startsWith("/");
}

function remapCharacterMediaIds(character: Character, remapped: ReadonlyMap<MediaId, MediaId>): Character {
  const remap = <T extends { imageId?: MediaId }>(value: T): T =>
    value.imageId && remapped.has(value.imageId)
      ? { ...value, imageId: remapped.get(value.imageId) }
      : value;
  return {
    ...remap(character),
    spells: character.spells.map(remap),
    equipment: character.equipment.map((item) => ({
      ...remap(item),
      grantedSpells: item.grantedSpells?.map(remap),
    })),
    inventory: character.inventory.map(remap),
  };
}

function collectArchiveAssetPaths(characters: Character[]) {
  const paths = new Set<string>();

  function visit(value: unknown) {
    if (typeof value === "string") {
      const fileName = getSyncAssetFileName(value);

      if (fileName) {
        paths.add(fileName);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (isRecord(value)) {
      Object.values(value).forEach(visit);
    }
  }

  characters.forEach(visit);
  return paths;
}

function getArchiveMimeType(fileName: string) {
  const normalized = fileName.toLowerCase();
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function sanitizePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function replaceFileExtension(fileName: string, extension: string) {
  return `${fileName.replace(/\.(json|zip)$/i, "")}${extension}`;
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

function loadJSZip() {
  jsZipModulePromise ??= import("jszip").then((module) => module.default);
  return jsZipModulePromise;
}
