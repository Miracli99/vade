import { LOCAL_IMAGE_LIBRARY, LocalImageOption } from "../data/image-library";
import { ImageModule } from "../types/game";

const validImageModules = new Map<string, ImageModule>();
const imageLibraryOptions = new Map<string, LocalImageOption>();

Object.values(LOCAL_IMAGE_LIBRARY).forEach((options) => {
  options.forEach((option) => {
    imageLibraryOptions.set(option.id, option);
    validImageModules.set(getImageModuleKey(option.imageModule), option.imageModule);

    if (option.thumbnailModule) {
      validImageModules.set(getImageModuleKey(option.thumbnailModule), option.thumbnailModule);
    }
  });
});

export function isKnownImageModule(value: unknown): value is ImageModule {
  return Boolean(value && validImageModules.has(getImageModuleKey(value)));
}

export function normalizeImageModule(value: unknown) {
  return value ? validImageModules.get(getImageModuleKey(value)) : undefined;
}

export function isKnownImageLibraryId(value: unknown): value is string {
  return typeof value === "string" && imageLibraryOptions.has(value);
}

export function getImageLibraryOption(imageLibraryId?: string) {
  return imageLibraryId ? imageLibraryOptions.get(imageLibraryId) : undefined;
}

export function getImageLibraryIdForModule(value: unknown) {
  const moduleKey = getImageModuleKey(value);

  for (const option of imageLibraryOptions.values()) {
    if (
      getImageModuleKey(option.imageModule) === moduleKey ||
      (option.thumbnailModule && getImageModuleKey(option.thumbnailModule) === moduleKey)
    ) {
      return option.id;
    }
  }

  return undefined;
}

export function getImageModuleKey(value: unknown) {
  if (typeof value === "number" || typeof value === "string") {
    return `${typeof value}:${value}`;
  }

  try {
    return `json:${JSON.stringify(value)}`;
  } catch {
    return "invalid";
  }
}
