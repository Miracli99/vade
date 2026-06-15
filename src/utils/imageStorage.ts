import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { Character } from "../types/game";

const IMAGE_DIRECTORY_NAME = "custom-images";
const SYNC_ASSET_PREFIX = "vade-sync-asset://";
const MAX_WEB_IMAGE_DIMENSION = 1280;
const WEB_IMAGE_QUALITY = 0.78;
const MAX_COMPACT_DATA_URL_LENGTH = 1_000_000;

type ImageTransform = (
  imageUrl: string | undefined,
  slot: string,
) => Promise<string | undefined>;

export type CharacterArchiveAsset = {
  path: string;
  base64: string;
};

export type CharacterArchivePayload = {
  character: Character;
  assets: CharacterArchiveAsset[];
};

export async function persistCustomImage(
  uri: string,
  mimeType?: string | null,
  fileName?: string | null,
) {
  if (Platform.OS === "web") {
    return compressWebImage(uri);
  }

  const extension = getImageExtension(mimeType, fileName ?? uri);
  const destination = await createDurableImageUri(extension);
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

export async function materializeCharacterImages(
  character: Character,
  resolveSyncAsset?: (fileName: string) => string | null,
) {
  return transformCharacterImages(character, async (imageUrl) => {
    if (!imageUrl) {
      return undefined;
    }

    if (imageUrl.startsWith(SYNC_ASSET_PREFIX)) {
      const fileName = decodeURIComponent(imageUrl.slice(SYNC_ASSET_PREFIX.length));
      const sourceUri = resolveSyncAsset?.(fileName);

      if (!sourceUri) {
        return undefined;
      }

      if (sourceUri.startsWith("data:image/")) {
        return materializeDataImage(sourceUri);
      }

      return persistCustomImage(sourceUri, getMimeType(fileName), fileName);
    }

    if (!imageUrl.startsWith("data:image/")) {
      return imageUrl;
    }

    if (Platform.OS === "web") {
      return imageUrl.length <= MAX_COMPACT_DATA_URL_LENGTH
        ? imageUrl
        : compressWebImage(imageUrl);
    }

    return materializeDataImage(imageUrl);
  });
}

export async function makeCharacterArchivePayload(
  character: Character,
  assetRoot = "",
): Promise<CharacterArchivePayload> {
  const assets: CharacterArchiveAsset[] = [];
  const portableCharacter = await transformCharacterImages(character, async (imageUrl, slot) => {
    if (!imageUrl || isRemoteImage(imageUrl)) {
      return imageUrl;
    }

    const image = await readImageAsBase64(imageUrl);

    if (!image) {
      return undefined;
    }

    const path = `${assetRoot}images/${sanitizeArchiveSlot(slot)}.${getImageExtension(image.mimeType)}`;
    assets.push({ path, base64: image.base64 });
    return `${SYNC_ASSET_PREFIX}${encodeURIComponent(path)}`;
  });

  return { character: portableCharacter, assets };
}

export async function makeCharacterPortable(character: Character) {
  return transformCharacterImages(character, async (imageUrl) => {
    if (!imageUrl || imageUrl.startsWith("data:image/") || isRemoteImage(imageUrl)) {
      return imageUrl;
    }

    const base64 = await FileSystem.readAsStringAsync(imageUrl, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:${getMimeType(imageUrl)};base64,${base64}`;
  });
}

export function isSyncAssetUrl(value: string) {
  return value.startsWith(SYNC_ASSET_PREFIX);
}

export function getSyncAssetFileName(value: string) {
  return isSyncAssetUrl(value)
    ? decodeURIComponent(value.slice(SYNC_ASSET_PREFIX.length))
    : null;
}

async function transformCharacterImages(
  character: Character,
  transform: ImageTransform,
): Promise<Character> {
  const equipment: Character["equipment"] = [];
  const spells: Character["spells"] = [];
  const inventory: Character["inventory"] = [];

  for (let index = 0; index < character.equipment.length; index += 1) {
    const item = character.equipment[index]!;
    equipment.push({
      ...item,
      imageUrl: await transformImage(
        transform,
        item.imageUrl,
        `equipment-${item.id || index}`,
      ),
      grantedSpell: item.grantedSpell
        ? {
            ...item.grantedSpell,
            imageUrl: await transformImage(
              transform,
              item.grantedSpell.imageUrl,
              `equipment-${item.id || index}-spell-${item.grantedSpell.id}`,
            ),
          }
        : undefined,
    });
  }

  for (let index = 0; index < character.spells.length; index += 1) {
    const spell = character.spells[index]!;
    spells.push({
      ...spell,
      imageUrl: await transformImage(transform, spell.imageUrl, `spell-${spell.id || index}`),
    });
  }

  for (let index = 0; index < character.inventory.length; index += 1) {
    const item = character.inventory[index]!;
    inventory.push({
      ...item,
      imageUrl: await transformImage(
        transform,
        item.imageUrl,
        `inventory-${item.id || index}`,
      ),
    });
  }

  return {
    ...character,
    imageUrl: await transformImage(transform, character.imageUrl, "character"),
    equipment,
    spells,
    inventory,
  };
}

async function transformImage(
  transform: ImageTransform,
  imageUrl: string | undefined,
  slot: string,
) {
  try {
    return await transform(imageUrl, slot);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Image ${slot}: ${reason}`);
  }
}

async function createDurableImageUri(extension: string) {
  if (!FileSystem.documentDirectory) {
    throw new Error("Stockage local indisponible.");
  }

  const directoryUri = `${FileSystem.documentDirectory}${IMAGE_DIRECTORY_NAME}`;
  await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
  return `${directoryUri}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

async function materializeDataImage(imageUrl: string) {
  const parsed = parseImageDataUrl(imageUrl);

  if (!parsed) {
    return undefined;
  }

  if (Platform.OS === "web") {
    return imageUrl.length <= MAX_COMPACT_DATA_URL_LENGTH
      ? imageUrl
      : compressWebImage(imageUrl);
  }

  const extension = getImageExtension(parsed.mimeType);
  const destination = await createDurableImageUri(extension);
  await FileSystem.writeAsStringAsync(destination, parsed.base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return destination;
}

async function readImageAsBase64(imageUrl: string) {
  const dataImage = parseImageDataUrl(imageUrl);

  if (dataImage) {
    return dataImage;
  }

  try {
    return {
      base64: await FileSystem.readAsStringAsync(imageUrl, {
        encoding: FileSystem.EncodingType.Base64,
      }),
      mimeType: getMimeType(imageUrl),
    };
  } catch {
    return null;
  }
}

function parseImageDataUrl(value: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(value);

  return match?.[1] && match[2]
    ? {
        mimeType: match[1],
        base64: match[2],
      }
    : null;
}

function getMimeType(value: string) {
  const normalized = value.toLowerCase().split("?")[0] ?? value.toLowerCase();

  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function getImageExtension(mimeType?: string | null, value = "") {
  const normalizedMime = mimeType?.toLowerCase();

  if (normalizedMime === "image/png") return "png";
  if (normalizedMime === "image/webp") return "webp";
  if (normalizedMime === "image/gif") return "gif";

  const normalizedValue = value.toLowerCase().split("?")[0] ?? value.toLowerCase();
  const match = /\.([a-z0-9]+)$/.exec(normalizedValue);
  return match?.[1] && ["jpg", "jpeg", "png", "webp", "gif"].includes(match[1])
    ? match[1]
    : "jpg";
}

function isRemoteImage(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function sanitizeArchiveSlot(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function compressWebImage(uri: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_WEB_IMAGE_DIMENSION / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Conversion de l'image impossible."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", WEB_IMAGE_QUALITY));
    };
    image.onerror = () => reject(new Error("Image illisible."));
    image.src = uri;
  });
}
