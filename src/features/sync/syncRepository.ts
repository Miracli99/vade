import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { mediaRepository } from "../media/mediaRepository";
import { MediaCategory, MediaId } from "../media/types";
import { Character } from "../../types/game";

const SYNC_FORMAT_VERSION = 1;
const SYNC_ROOT_NAME = "VadeRetro";
const INDEX_FILE_NAME = "index.json";
const PREVIOUS_INDEX_FILE_NAME = "index.previous.json";
const CHARACTERS_DIRECTORY_NAME = "characters";
const MEDIA_DIRECTORY_NAME = "media";
const JSON_MIME_TYPE = "application/json";
const BINARY_MIME_TYPE = "application/octet-stream";

export type SyncIndexCharacter = {
  id: string;
  name: string;
  directory: string;
  file: string;
  hash: string;
  updatedAt: string;
};

export type SyncIndexMedia = {
  id: MediaId;
  file: string;
  hash: string;
  category: MediaCategory;
  mimeType: string;
};

export type SyncIndex = {
  version: 1;
  syncVersion: number;
  updatedAt: string;
  characters: SyncIndexCharacter[];
  media: SyncIndexMedia[];
};

export type SyncResult = {
  writtenCount: number;
  deletedCount: number;
  mediaWrittenCount: number;
};

export type SyncReadResult = {
  characters: Character[];
  skippedFiles: Array<{ fileName: string; characterId: string | null }>;
  rebuiltIndex: boolean;
};

export async function prepareSyncRoot(selectedDirectoryUri: string) {
  assertAndroid();
  if (getEntryName(selectedDirectoryUri).toLowerCase() === SYNC_ROOT_NAME.toLowerCase()) {
    return selectedDirectoryUri;
  }
  return ensureDirectory(selectedDirectoryUri, SYNC_ROOT_NAME);
}

export async function syncCharacterDirectory(
  characters: Character[],
  selectedDirectoryUri: string,
  characterIdsToWrite?: ReadonlySet<string>,
): Promise<SyncResult> {
  assertAndroid();
  await mediaRepository.initialize();
  const rootUri = await prepareSyncRoot(selectedDirectoryUri);
  const charactersUri = await ensureDirectory(rootUri, CHARACTERS_DIRECTORY_NAME);
  const mediaUri = await ensureDirectory(rootUri, MEDIA_DIRECTORY_NAME);
  const previousIndex = await readSyncIndex(rootUri);
  const previousById = new Map(previousIndex?.characters.map((entry) => [entry.id, entry]));
  const nextCharacterEntries: SyncIndexCharacter[] = [];
  const nextMediaIds = collectReferencedMediaIds(characters);
  const nextMediaEntries: SyncIndexMedia[] = [];
  let writtenCount = 0;
  let deletedCount = 0;
  let mediaWrittenCount = 0;

  for (const character of characters) {
    const directoryName = getCharacterDirectoryName(character.id);
    const characterDirectoryUri = await ensureDirectory(charactersUri, directoryName);
    const serialized = JSON.stringify(character, null, 2);
    const hash = await hashText(serialized);
    const previous = previousById.get(character.id);
    const shouldWrite =
      !previous ||
      previous.hash !== hash ||
      !characterIdsToWrite ||
      characterIdsToWrite.has(character.id);

    if (!shouldWrite && previous) {
      nextCharacterEntries.push({ ...previous, name: character.name });
      continue;
    }

    const fileName = `character-${hash.slice(0, 12)}.json`;
    await writeVerifiedJson(characterDirectoryUri, fileName, serialized);
    nextCharacterEntries.push({
      id: character.id,
      name: character.name,
      directory: `${CHARACTERS_DIRECTORY_NAME}/${directoryName}`,
      file: fileName,
      hash,
      updatedAt: new Date().toISOString(),
    });
    writtenCount += 1;
  }

  for (const mediaId of nextMediaIds) {
    const asset = mediaRepository.get(mediaId);
    if (!asset || asset.origin !== "custom" || !asset.contentHash) continue;
    const extension = asset.mimeType === "image/png" ? "png" : "webp";
    const fileName = `${asset.contentHash}.${extension}`;
    const existing = previousIndex?.media.find((entry) => entry.id === mediaId);
    if (!existing || !(await hasNamedEntry(mediaUri, existing.file))) {
      const bytes = await mediaRepository.readBytes(mediaId);
      if (!bytes) continue;
      await writeBinaryFile(mediaUri, fileName, bytes, asset.mimeType || BINARY_MIME_TYPE);
      mediaWrittenCount += 1;
    }
    nextMediaEntries.push({
      id: mediaId,
      file: fileName,
      hash: asset.contentHash,
      category: asset.category,
      mimeType: asset.mimeType,
    });
  }

  const nextIndex: SyncIndex = {
    version: SYNC_FORMAT_VERSION,
    syncVersion: (previousIndex?.syncVersion ?? 0) + 1,
    updatedAt: new Date().toISOString(),
    characters: nextCharacterEntries,
    media: nextMediaEntries,
  };

  await commitIndex(rootUri, previousIndex, nextIndex);

  const activeIds = new Set(characters.map((character) => character.id));
  for (const previous of previousIndex?.characters ?? []) {
    if (activeIds.has(previous.id)) continue;
    const directoryUri = await findNamedEntry(charactersUri, getCharacterDirectoryName(previous.id));
    if (directoryUri) {
      await FileSystem.StorageAccessFramework.deleteAsync(directoryUri, { idempotent: true });
      deletedCount += 1;
    }
  }

  await cleanupSupersededCharacterFiles(charactersUri, nextIndex);
  await cleanupUnusedMediaFiles(mediaUri, nextIndex);
  return { writtenCount, deletedCount, mediaWrittenCount };
}

export async function readCharacterDirectory(selectedDirectoryUri: string): Promise<SyncReadResult> {
  assertAndroid();
  await mediaRepository.initialize();
  const rootUri = await prepareSyncRoot(selectedDirectoryUri);
  let index = await readSyncIndex(rootUri);
  let rebuiltIndex = false;

  if (!index) {
    index = await rebuildIndex(rootUri);
    rebuiltIndex = true;
  }

  const mediaUri = await findNamedEntry(rootUri, MEDIA_DIRECTORY_NAME);
  const remappedMediaIds = new Map<MediaId, MediaId>();
  if (mediaUri) {
    for (const media of index.media) {
      if (mediaRepository.get(media.id)) continue;
      const uri = await findNamedEntry(mediaUri, media.file);
      if (!uri) continue;
      try {
        const imported = await mediaRepository.importSynced({
          uri,
          id: media.id,
          contentHash: media.hash,
          category: media.category,
          fileName: media.file,
          mimeType: media.mimeType,
        });
        remappedMediaIds.set(media.id, imported.id);
      } catch {
        // Missing media never prevents the character data from loading.
      }
    }
  }

  const characters: Character[] = [];
  const skippedFiles: SyncReadResult["skippedFiles"] = [];
  for (const entry of index.characters) {
    try {
      const directoryUri = await resolveRelativeDirectory(rootUri, entry.directory);
      const fileUri = directoryUri ? await findNamedEntry(directoryUri, entry.file) : null;
      if (!fileUri) throw new Error("Fichier absent");
      const character = JSON.parse(await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri)) as Character;
      characters.push(remapCharacterMediaIds(character, remappedMediaIds));
    } catch {
      skippedFiles.push({ fileName: `${entry.directory}/${entry.file}`, characterId: entry.id });
    }
  }

  if (!characters.length) {
    throw new Error("Aucun personnage lisible dans le dossier de synchronisation.");
  }
  return { characters, skippedFiles, rebuiltIndex };
}

export function getCharacterDirectoryName(characterId: string) {
  return `character-${characterId.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
}

export function collectReferencedMediaIds(characters: Character[]) {
  const ids = new Set<MediaId>();
  const add = (id?: MediaId) => id && ids.add(id);
  for (const character of characters) {
    add(character.imageId);
    character.spells.forEach((spell) => add(spell.imageId));
    character.equipment.forEach((item) => {
      add(item.imageId);
      item.grantedSpells?.forEach((spell) => add(spell.imageId));
    });
    character.inventory.forEach((item) => add(item.imageId));
  }
  return ids;
}

function remapCharacterMediaIds(character: Character, ids: ReadonlyMap<MediaId, MediaId>): Character {
  const remap = (id?: MediaId) => (id ? ids.get(id) ?? id : id);
  return {
    ...character,
    imageId: remap(character.imageId),
    spells: character.spells.map((spell) => ({ ...spell, imageId: remap(spell.imageId) })),
    equipment: character.equipment.map((item) => ({
      ...item,
      imageId: remap(item.imageId),
      grantedSpells: item.grantedSpells?.map((spell) => ({ ...spell, imageId: remap(spell.imageId) })),
    })),
    inventory: character.inventory.map((item) => ({ ...item, imageId: remap(item.imageId) })),
  };
}

async function readSyncIndex(rootUri: string): Promise<SyncIndex | null> {
  for (const fileName of [INDEX_FILE_NAME, PREVIOUS_INDEX_FILE_NAME]) {
    const fileUri = await findNamedEntry(rootUri, fileName);
    if (!fileUri) continue;
    try {
      const parsed = JSON.parse(await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri)) as unknown;
      if (isSyncIndex(parsed)) return parsed;
    } catch {
      // Try the previous verified index.
    }
  }
  return null;
}

async function commitIndex(rootUri: string, previous: SyncIndex | null, next: SyncIndex) {
  if (previous) {
    await writeOrReplaceJson(rootUri, PREVIOUS_INDEX_FILE_NAME, JSON.stringify(previous, null, 2));
  }
  await writeOrReplaceJson(rootUri, INDEX_FILE_NAME, JSON.stringify(next, null, 2));
  const verified = await readSyncIndex(rootUri);
  if (!verified || verified.syncVersion !== next.syncVersion) {
    throw new Error("L'index de synchronisation n'a pas pu etre verifie.");
  }
}

async function rebuildIndex(rootUri: string): Promise<SyncIndex> {
  const charactersUri = await findNamedEntry(rootUri, CHARACTERS_DIRECTORY_NAME);
  if (!charactersUri) throw new Error("Le dossier characters est absent.");
  const entries: SyncIndexCharacter[] = [];
  for (const directoryUri of await FileSystem.StorageAccessFramework.readDirectoryAsync(charactersUri)) {
    const directoryName = getEntryName(directoryUri);
    if (!directoryName.startsWith("character-")) continue;
    const jsonFiles = (await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri))
      .filter((uri) => /^character(?:-[a-f0-9]+)?\.json$/i.test(getEntryName(uri)))
      .sort();
    const fileUri = jsonFiles[jsonFiles.length - 1];
    if (!fileUri) continue;
    try {
      const raw = await FileSystem.StorageAccessFramework.readAsStringAsync(fileUri);
      const character = JSON.parse(raw) as Character;
      if (!character.id || !character.name) continue;
      entries.push({
        id: character.id,
        name: character.name,
        directory: `${CHARACTERS_DIRECTORY_NAME}/${directoryName}`,
        file: getEntryName(fileUri),
        hash: await hashText(raw),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Ignore a single broken folder while rebuilding the index.
    }
  }
  if (!entries.length) throw new Error("Impossible de reconstruire l'index: aucune fiche valide.");
  const index: SyncIndex = {
    version: 1,
    syncVersion: 1,
    updatedAt: new Date().toISOString(),
    characters: entries,
    media: await rebuildMediaEntries(rootUri),
  };
  await commitIndex(rootUri, null, index);
  return index;
}

async function rebuildMediaEntries(rootUri: string): Promise<SyncIndexMedia[]> {
  const mediaUri = await findNamedEntry(rootUri, MEDIA_DIRECTORY_NAME);
  if (!mediaUri) return [];
  return (await FileSystem.StorageAccessFramework.readDirectoryAsync(mediaUri)).flatMap((uri) => {
    const file = getEntryName(uri);
    const match = /^([a-f0-9]{64})\.(webp|png)$/i.exec(file);
    return match?.[1]
      ? [{ id: `custom-${match[1].slice(0, 32)}`, file, hash: match[1], category: "inventory" as const, mimeType: match[2] === "png" ? "image/png" : "image/webp" }]
      : [];
  });
}

async function cleanupSupersededCharacterFiles(charactersRootUri: string, index: SyncIndex) {
  for (const entry of index.characters) {
    const directoryUri = await findNamedEntry(charactersRootUri, getCharacterDirectoryName(entry.id));
    if (!directoryUri) continue;
    for (const uri of await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri)) {
      if (getEntryName(uri) !== entry.file && /^character-.*\.json$/i.test(getEntryName(uri))) {
        await FileSystem.StorageAccessFramework.deleteAsync(uri, { idempotent: true });
      }
    }
  }
}

async function cleanupUnusedMediaFiles(mediaUri: string, index: SyncIndex) {
  const activeFiles = new Set(index.media.map((entry) => entry.file));
  for (const uri of await FileSystem.StorageAccessFramework.readDirectoryAsync(mediaUri)) {
    if (!activeFiles.has(getEntryName(uri))) {
      await FileSystem.StorageAccessFramework.deleteAsync(uri, { idempotent: true });
    }
  }
}

async function writeVerifiedJson(directoryUri: string, fileName: string, serialized: string) {
  const uri = await writeOrReplaceJson(directoryUri, fileName, serialized);
  JSON.parse(await FileSystem.StorageAccessFramework.readAsStringAsync(uri));
}

async function writeOrReplaceJson(directoryUri: string, fileName: string, serialized: string) {
  let uri = await findNamedEntry(directoryUri, fileName);
  if (!uri) {
    uri = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName.replace(/\.json$/i, ""),
      JSON_MIME_TYPE,
    );
  }
  await FileSystem.StorageAccessFramework.writeAsStringAsync(uri, serialized);
  return uri;
}

async function writeBinaryFile(directoryUri: string, fileName: string, bytes: Uint8Array, mimeType: string) {
  let uri = await findNamedEntry(directoryUri, fileName);
  if (!uri) {
    uri = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName.replace(/\.[^.]+$/, ""),
      mimeType,
    );
  }
  await FileSystem.StorageAccessFramework.writeAsStringAsync(uri, bytesToBase64(bytes), {
    encoding: FileSystem.EncodingType.Base64,
  });
}

async function ensureDirectory(parentUri: string, name: string) {
  return (await findNamedEntry(parentUri, name)) ?? FileSystem.StorageAccessFramework.makeDirectoryAsync(parentUri, name);
}

async function hasNamedEntry(parentUri: string, name: string) {
  return Boolean(await findNamedEntry(parentUri, name));
}

async function findNamedEntry(parentUri: string, name: string) {
  const entries = await FileSystem.StorageAccessFramework.readDirectoryAsync(parentUri);
  return entries.find((uri) => getEntryName(uri) === name) ?? null;
}

async function resolveRelativeDirectory(rootUri: string, relativePath: string) {
  let current: string | null = rootUri;
  for (const segment of relativePath.split("/").filter(Boolean)) {
    if (!current) return null;
    current = await findNamedEntry(current, segment);
  }
  return current;
}

function getEntryName(uri: string) {
  const decoded = decodeURIComponent(uri).split("?")[0]?.replace(/\\/g, "/") ?? uri;
  return decoded.slice(decoded.lastIndexOf("/") + 1);
}

function isSyncIndex(value: unknown): value is SyncIndex {
  if (!value || typeof value !== "object") return false;
  const candidate = value as SyncIndex;
  return candidate.version === 1 && Array.isArray(candidate.characters) && Array.isArray(candidate.media);
}

export function isValidSyncIndex(value: unknown): value is SyncIndex {
  return isSyncIndex(value);
}

async function hashText(value: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return globalThis.btoa(binary);
}

function assertAndroid() {
  if (Platform.OS !== "android") {
    throw new Error("La synchronisation par dossier est disponible uniquement sur Android.");
  }
}
