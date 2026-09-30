import * as FileSystem from "expo-file-system/legacy";
import { startActivityAsync } from "expo-intent-launcher";

const APK_MIME_TYPE = "application/vnd.android.package-archive";
const FLAG_GRANT_READ_URI_PERMISSION = 1;

export async function installAndroidUpdate(apkUrl: string, version: string): Promise<void> {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Le stockage temporaire est indisponible.");
  }
  const fileName = `vade-retro-${version.replace(/[^a-zA-Z0-9.-]+/g, "-")}.apk`;
  const download = await FileSystem.downloadAsync(apkUrl, `${FileSystem.cacheDirectory}${fileName}`);
  if (download.status < 200 || download.status >= 300) {
    throw new Error(`Téléchargement refusé (${download.status}).`);
  }

  // The installer runs outside our app: give it a content URI and temporary read access.
  const contentUri = await FileSystem.getContentUriAsync(download.uri);
  await startActivityAsync("android.intent.action.VIEW", {
    data: contentUri,
    type: APK_MIME_TYPE,
    flags: FLAG_GRANT_READ_URI_PERMISSION,
  });
}
