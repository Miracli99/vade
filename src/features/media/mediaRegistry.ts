import { LOCAL_IMAGE_LIBRARY } from "../../data/image-library";
import { getImageModuleKey } from "../../utils/assets";
import { MediaAsset, MediaCategory, MediaId } from "./types";

export const BUILTIN_MEDIA_ASSETS: MediaAsset[] = Object.entries(LOCAL_IMAGE_LIBRARY).flatMap(
  ([category, options]) =>
    options.map((option) => ({
      id: option.id,
      label: option.label,
      category: category as MediaCategory,
      origin: "builtin" as const,
      tags: option.tags,
      mimeType: "image/png",
      imageModule: option.imageModule,
      thumbnailModule: option.thumbnailModule,
    })),
);

const builtInById = new Map(BUILTIN_MEDIA_ASSETS.map((asset) => [asset.id, asset]));
const builtInIdByModule = new Map<MediaId, MediaId>();

for (const asset of BUILTIN_MEDIA_ASSETS) {
  if (asset.imageModule) {
    builtInIdByModule.set(getImageModuleKey(asset.imageModule), asset.id);
  }
  if (asset.thumbnailModule) {
    builtInIdByModule.set(getImageModuleKey(asset.thumbnailModule), asset.id);
  }
}

export function getBuiltInMediaAsset(id: MediaId | undefined) {
  return id ? builtInById.get(id) : undefined;
}

export function getBuiltInMediaIdForModule(value: unknown) {
  return value ? builtInIdByModule.get(getImageModuleKey(value)) : undefined;
}
