import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { File as ExpoFile } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useSyncExternalStore } from "react";
import { Image, ImageSourcePropType, Platform } from "react-native";

import { Character } from "../../types/game";
import { BUILTIN_MEDIA_ASSETS, getBuiltInMediaAsset, getBuiltInMediaIdForModule } from "./mediaRegistry";
import { MediaAsset, MediaCategory, MediaId, MediaImportInput, MediaUsage } from "./types";

const MEDIA_METADATA_KEY = "vade-retro.media.v1";
const MEDIA_DIRECTORY_NAME = "media";
const WEB_DATABASE_NAME = "vade-retro-media";
const WEB_DATABASE_VERSION = 1;
const WEB_STORE_NAME = "files";
const MAX_IMAGE_EDGE = 1600;
const THUMBNAIL_EDGE = 320;

type StoredMediaAsset = Omit<MediaAsset, "imageModule" | "thumbnailModule" | "uri" | "thumbnailUri"> & {
  fileName: string;
  thumbnailFileName: string;
};

class MediaRepository {
  private customAssets = new Map<MediaId, MediaAsset>();
  private storedAssets = new Map<MediaId, StoredMediaAsset>();
  private listeners = new Set<() => void>();
  private initialized = false;
  private initializing: Promise<void> | null = null;
  private snapshot: MediaAsset[] = BUILTIN_MEDIA_ASSETS;
  private objectUrls = new Set<string>();

  initialize() {
    if (this.initialized) return Promise.resolve();
    if (this.initializing) return this.initializing;

    this.initializing = this.loadStoredAssets().finally(() => {
      this.initialized = true;
      this.initializing = null;
    });
    return this.initializing;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  list() {
    return this.snapshot;
  }

  get(id: MediaId | undefined) {
    return getBuiltInMediaAsset(id) ?? (id ? this.customAssets.get(id) : undefined);
  }

  resolve(id: MediaId | undefined, thumbnail = false): ImageSourcePropType | undefined {
    const asset = this.get(id);
    if (!asset) return undefined;
    if (thumbnail) {
      return asset.thumbnailModule ?? (asset.thumbnailUri ? { uri: asset.thumbnailUri } : undefined) ?? asset.imageModule ?? (asset.uri ? { uri: asset.uri } : undefined);
    }
    return asset.imageModule ?? (asset.uri ? { uri: asset.uri } : undefined);
  }

  async import(input: MediaImportInput) {
    await this.initialize();
    const normalized = await normalizeImage(input.uri);
    const bytes = await readUriBytes(normalized.uri);
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
    const contentHash = bytesToHex(new Uint8Array(digest));
    const id = `custom-${contentHash.slice(0, 32)}`;
    const existing = this.customAssets.get(id);
    if (existing) return existing;

    const thumbResult = await manipulateAsync(
      normalized.uri,
      [{ resize: normalized.width >= normalized.height ? { width: THUMBNAIL_EDGE } : { height: THUMBNAIL_EDGE } }],
      { compress: 0.76, format: SaveFormat.WEBP },
    );
    const fileName = `${contentHash}.webp`;
    const thumbnailFileName = `${contentHash}-thumb.webp`;
    const stored: StoredMediaAsset = {
      id,
      label: input.label?.trim() || labelFromFileName(input.fileName) || "Image personnelle",
      category: input.category,
      origin: "custom",
      tags: buildTags(input.fileName, input.category),
      mimeType: "image/webp",
      width: normalized.width,
      height: normalized.height,
      byteSize: bytes.byteLength,
      createdAt: new Date().toISOString(),
      originalFileName: input.fileName ?? undefined,
      contentHash,
      fileName,
      thumbnailFileName,
    };

    const resolved = await this.writeFiles(stored, normalized.uri, thumbResult.uri);
    this.storedAssets.set(id, stored);
    this.customAssets.set(id, resolved);
    await this.persistMetadata();
    this.emit();
    return resolved;
  }

  async importSynced(input: {
    uri: string;
    id: MediaId;
    contentHash: string;
    category: MediaCategory;
    mimeType: string;
    fileName: string;
    label?: string;
  }) {
    await this.initialize();
    const existing = this.customAssets.get(input.id);
    if (existing) return existing;

    const bytes = await readUriBytes(input.uri);
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);
    const actualHash = bytesToHex(new Uint8Array(digest));
    if (actualHash !== input.contentHash) {
      throw new Error("Le média synchronisé ne correspond pas à son empreinte.");
    }

    const thumbnail = await manipulateAsync(
      input.uri,
      [{ resize: { width: THUMBNAIL_EDGE } }],
      { compress: 0.76, format: SaveFormat.WEBP },
    );
    const extension = input.mimeType === "image/png" ? "png" : "webp";
    const stored: StoredMediaAsset = {
      id: input.id,
      label: input.label?.trim() || labelFromFileName(input.fileName) || "Image synchronisée",
      category: input.category,
      origin: "custom",
      tags: buildTags(input.fileName, input.category),
      mimeType: input.mimeType,
      byteSize: bytes.byteLength,
      createdAt: new Date().toISOString(),
      originalFileName: input.fileName,
      contentHash: input.contentHash,
      fileName: `${input.contentHash}.${extension}`,
      thumbnailFileName: `${input.contentHash}-thumb.webp`,
    };
    const resolved = await this.writeFiles(stored, input.uri, thumbnail.uri);
    this.storedAssets.set(input.id, stored);
    this.customAssets.set(input.id, resolved);
    await this.persistMetadata();
    this.emit();
    return resolved;
  }

  async remove(id: MediaId, characters: Character[]) {
    const usages = getMediaUsage(id, characters);
    if (usages.length) {
      throw new Error(`Cette image est encore utilisee ${usages.length} fois.`);
    }
    const stored = this.storedAssets.get(id);
    if (!stored) return false;

    if (Platform.OS === "web") {
      await Promise.all([deleteWebBlob(stored.fileName), deleteWebBlob(stored.thumbnailFileName)]);
    } else if (FileSystem.documentDirectory) {
      const directory = `${FileSystem.documentDirectory}${MEDIA_DIRECTORY_NAME}/`;
      await Promise.all([
        FileSystem.deleteAsync(`${directory}${stored.fileName}`, { idempotent: true }),
        FileSystem.deleteAsync(`${directory}${stored.thumbnailFileName}`, { idempotent: true }),
      ]);
    }

    const asset = this.customAssets.get(id);
    [asset?.uri, asset?.thumbnailUri].forEach((uri) => {
      if (uri?.startsWith("blob:")) {
        URL.revokeObjectURL(uri);
        this.objectUrls.delete(uri);
      }
    });
    this.customAssets.delete(id);
    this.storedAssets.delete(id);
    await this.persistMetadata();
    this.emit();
    return true;
  }

  async readBytes(id: MediaId) {
    const stored = this.storedAssets.get(id);
    if (stored) {
      if (Platform.OS === "web") {
        const blob = await readWebBlob(stored.fileName);
        return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
      }
      if (FileSystem.documentDirectory) {
        return new ExpoFile(`${FileSystem.documentDirectory}${MEDIA_DIRECTORY_NAME}/${stored.fileName}`).bytes();
      }
    }

    const builtin = getBuiltInMediaAsset(id);
    const source = builtin?.imageModule ? Image.resolveAssetSource(builtin.imageModule) : undefined;
    return source?.uri ? readUriBytes(source.uri).catch(() => null) : null;
  }

  private async loadStoredAssets() {
    const raw = await AsyncStorage.getItem(MEDIA_METADATA_KEY);
    const storedAssets = raw ? (JSON.parse(raw) as StoredMediaAsset[]) : [];

    for (const stored of storedAssets) {
      try {
        const resolved = await this.resolveStoredAsset(stored);
        if (!resolved) continue;
        this.storedAssets.set(stored.id, stored);
        this.customAssets.set(stored.id, resolved);
      } catch {
        // Keep startup resilient if a single media file disappeared.
      }
    }
    this.refreshSnapshot();
  }

  private async resolveStoredAsset(stored: StoredMediaAsset): Promise<MediaAsset | null> {
    if (Platform.OS === "web") {
      const [blob, thumbnailBlob] = await Promise.all([
        readWebBlob(stored.fileName),
        readWebBlob(stored.thumbnailFileName),
      ]);
      if (!blob) return null;
      const uri = URL.createObjectURL(blob);
      const thumbnailUri = thumbnailBlob ? URL.createObjectURL(thumbnailBlob) : uri;
      this.objectUrls.add(uri);
      this.objectUrls.add(thumbnailUri);
      return { ...stored, uri, thumbnailUri };
    }
    if (!FileSystem.documentDirectory) return null;
    const directory = `${FileSystem.documentDirectory}${MEDIA_DIRECTORY_NAME}/`;
    const uri = `${directory}${stored.fileName}`;
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? { ...stored, uri, thumbnailUri: `${directory}${stored.thumbnailFileName}` } : null;
  }

  private async writeFiles(stored: StoredMediaAsset, uri: string, thumbnailUri: string) {
    if (Platform.OS === "web") {
      const [blob, thumbnailBlob] = await Promise.all([
        fetch(uri).then((response) => response.blob()),
        fetch(thumbnailUri).then((response) => response.blob()),
      ]);
      await Promise.all([
        writeWebBlob(stored.fileName, blob),
        writeWebBlob(stored.thumbnailFileName, thumbnailBlob),
      ]);
      return (await this.resolveStoredAsset(stored))!;
    }
    if (!FileSystem.documentDirectory) throw new Error("Stockage local indisponible.");
    const directory = `${FileSystem.documentDirectory}${MEDIA_DIRECTORY_NAME}/`;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    await Promise.all([
      FileSystem.copyAsync({ from: uri, to: `${directory}${stored.fileName}` }),
      FileSystem.copyAsync({ from: thumbnailUri, to: `${directory}${stored.thumbnailFileName}` }),
    ]);
    return { ...stored, uri: `${directory}${stored.fileName}`, thumbnailUri: `${directory}${stored.thumbnailFileName}` };
  }

  private async persistMetadata() {
    await AsyncStorage.setItem(MEDIA_METADATA_KEY, JSON.stringify([...this.storedAssets.values()]));
  }

  private emit() {
    this.refreshSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private refreshSnapshot() {
    this.snapshot = [...BUILTIN_MEDIA_ASSETS, ...this.customAssets.values()];
  }
}

export const mediaRepository = new MediaRepository();

export function useMediaAssets() {
  return useSyncExternalStore(mediaRepository.subscribe, mediaRepository.getSnapshot, mediaRepository.getSnapshot);
}

export function useMediaSource(id: MediaId | undefined, thumbnail = false) {
  useSyncExternalStore(mediaRepository.subscribe, mediaRepository.getSnapshot, mediaRepository.getSnapshot);
  return mediaRepository.resolve(id, thumbnail);
}

export function getMediaUsage(mediaId: MediaId, characters: Character[]): MediaUsage[] {
  const usages: MediaUsage[] = [];
  for (const character of characters) {
    if (character.imageId === mediaId) usages.push({ characterId: character.id, characterName: character.name, slot: "Portrait" });
    character.spells.forEach((spell) => {
      if (spell.imageId === mediaId) usages.push({ characterId: character.id, characterName: character.name, slot: `Don : ${spell.name}` });
    });
    character.equipment.forEach((item) => {
      if (item.imageId === mediaId) usages.push({ characterId: character.id, characterName: character.name, slot: `Equipement : ${item.name}` });
      item.grantedSpells?.forEach((spell) => {
        if (spell.imageId === mediaId) usages.push({ characterId: character.id, characterName: character.name, slot: `Don associe : ${spell.name}` });
      });
    });
    character.inventory.forEach((item) => {
      if (item.imageId === mediaId) usages.push({ characterId: character.id, characterName: character.name, slot: `Inventaire : ${item.name}` });
    });
  }
  return usages;
}

export async function migrateLegacyCharacterMedia(character: Character): Promise<Character> {
  async function migrate<T extends { imageId?: MediaId; imageUrl?: string; imageModule?: ImageSourcePropType }>(
    value: T,
    category: MediaCategory,
    label: string,
  ): Promise<T> {
    if (value.imageId) return value;
    const builtInId = getBuiltInMediaIdForModule(value.imageModule);
    if (builtInId) return { ...value, imageId: builtInId, imageModule: undefined, imageUrl: undefined };
    if (!value.imageUrl || /^https?:\/\//i.test(value.imageUrl)) return value;
    try {
      const asset = await mediaRepository.import({ uri: value.imageUrl, category, label });
      return { ...value, imageId: asset.id, imageModule: undefined, imageUrl: undefined };
    } catch {
      return value;
    }
  }

  const equipment = await Promise.all(character.equipment.map(async (item) => ({
    ...(await migrate(item, "equipment", item.name)),
    grantedSpells: await Promise.all((item.grantedSpells ?? []).map((spell) => migrate(spell, "spell", spell.name))),
  })));
  return {
    ...(await migrate(character, "character", character.name)),
    equipment,
    spells: await Promise.all(character.spells.map((spell) => migrate(spell, "spell", spell.name))),
    inventory: await Promise.all(character.inventory.map((item) => migrate(item, "inventory", item.name))),
  };
}

async function normalizeImage(uri: string) {
  let result = await manipulateAsync(uri, [], { compress: 0.82, format: SaveFormat.WEBP });
  if (Math.max(result.width, result.height) > MAX_IMAGE_EDGE) {
    result = await manipulateAsync(
      uri,
      [{ resize: result.width >= result.height ? { width: MAX_IMAGE_EDGE } : { height: MAX_IMAGE_EDGE } }],
      { compress: 0.82, format: SaveFormat.WEBP },
    );
  }
  return result;
}

async function readUriBytes(uri: string) {
  if (Platform.OS === "web" || uri.startsWith("data:") || uri.startsWith("blob:") || /^https?:\/\//i.test(uri)) {
    return new Uint8Array(await (await fetch(uri)).arrayBuffer());
  }
  return new ExpoFile(uri).bytes();
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function labelFromFileName(fileName?: string | null) {
  return fileName?.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function buildTags(fileName: string | null | undefined, category: MediaCategory) {
  return Array.from(new Set([category, ...(labelFromFileName(fileName)?.toLowerCase().split(/\s+/) ?? [])]));
}

function openWebDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(WEB_DATABASE_NAME, WEB_DATABASE_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(WEB_STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeWebBlob(key: string, blob: Blob) {
  const database = await openWebDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(WEB_STORE_NAME, "readwrite");
    transaction.objectStore(WEB_STORE_NAME).put(blob, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function readWebBlob(key: string) {
  const database = await openWebDatabase();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const request = database.transaction(WEB_STORE_NAME, "readonly").objectStore(WEB_STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return blob;
}

async function deleteWebBlob(key: string) {
  const database = await openWebDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(WEB_STORE_NAME, "readwrite");
    transaction.objectStore(WEB_STORE_NAME).delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
