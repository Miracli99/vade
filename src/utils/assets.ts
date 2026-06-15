import { LOCAL_IMAGE_LIBRARY } from "../data/image-library";
import { ImageModule } from "../types/game";

const validImageModules = new Map<string, ImageModule>();

Object.values(LOCAL_IMAGE_LIBRARY).forEach((options) => {
  options.forEach((option) => {
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
