import type { ImageSourcePropType } from "react-native";

export type MediaId = string;
export type MediaCategory = "character" | "spell" | "equipment" | "inventory";
export type MediaOrigin = "builtin" | "custom";

export type MediaAsset = {
  id: MediaId;
  label: string;
  category: MediaCategory;
  origin: MediaOrigin;
  tags: string[];
  mimeType: string;
  width?: number;
  height?: number;
  byteSize?: number;
  createdAt?: string;
  originalFileName?: string;
  contentHash?: string;
  uri?: string;
  thumbnailUri?: string;
  imageModule?: ImageSourcePropType;
  thumbnailModule?: ImageSourcePropType;
};

export type MediaImportInput = {
  uri: string;
  category: MediaCategory;
  label?: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type MediaUsage = {
  characterId: string;
  characterName: string;
  slot: string;
};
