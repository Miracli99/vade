import { LOCAL_IMAGE_LIBRARY } from "../data/image-library";

const validImageModules = new Set<number>();

Object.values(LOCAL_IMAGE_LIBRARY).forEach((options) => {
  options.forEach((option) => {
    validImageModules.add(option.imageModule);

    if (option.thumbnailModule) {
      validImageModules.add(option.thumbnailModule);
    }
  });
});

export function isKnownImageModule(value: unknown): value is number {
  if (typeof value !== "number") {
    return Boolean(value);
  }

  return validImageModules.has(value);
}

export function normalizeImageModule(value: unknown) {
  return typeof value === "number" && isKnownImageModule(value) ? value : undefined;
}
