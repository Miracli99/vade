import * as ImagePicker from "expo-image-picker";
import { mediaRepository } from "./mediaRepository";
import { MediaCategory } from "./types";

/** The system photo picker grants access to the selected file, without broad gallery permission. */
export async function pickAndImportMedia(category: MediaCategory) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });
  const picked = result.canceled ? undefined : result.assets[0];
  if (!picked?.uri) return null;
  return mediaRepository.import({
    uri: picked.uri,
    fileName: picked.fileName,
    mimeType: picked.mimeType,
    category,
  });
}
