import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as FileSystem from "expo-file-system/legacy";
import { startActivityAsync } from "expo-intent-launcher";
import { installAndroidUpdate } from "./installUpdate";

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  downloadAsync: jest.fn(),
  getContentUriAsync: jest.fn(),
}));
jest.mock("expo-intent-launcher", () => ({ startActivityAsync: jest.fn() }));

const apkUrl = "https://example.com/update.apk";
const fileUri = "file:///cache/vade-retro-0.2.14.apk";

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(FileSystem.downloadAsync).mockResolvedValue({ uri: fileUri, status: 200, headers: {}, mimeType: "application/vnd.android.package-archive" });
  jest.mocked(FileSystem.getContentUriAsync).mockResolvedValue("content://app.provider/update.apk");
  jest.mocked(startActivityAsync).mockResolvedValue({ resultCode: 0 });
});

describe("installation Android", () => {
  it("ouvre l’APK avec une URI partageable et un droit de lecture pour l’installateur", async () => {
    await installAndroidUpdate(apkUrl, "0.2.14");
    expect(FileSystem.downloadAsync).toHaveBeenCalledWith(apkUrl, fileUri);
    expect(FileSystem.getContentUriAsync).toHaveBeenCalledWith(fileUri);
    expect(startActivityAsync).toHaveBeenCalledWith("android.intent.action.VIEW", {
      data: "content://app.provider/update.apk",
      type: "application/vnd.android.package-archive",
      flags: 1,
    });
  });

  it("n’ouvre pas un téléchargement refusé", async () => {
    jest.mocked(FileSystem.downloadAsync).mockResolvedValue({ uri: fileUri, status: 404, headers: {}, mimeType: "text/html" });
    await expect(installAndroidUpdate(apkUrl, "0.2.14")).rejects.toThrow("404");
    expect(FileSystem.getContentUriAsync).not.toHaveBeenCalled();
    expect(startActivityAsync).not.toHaveBeenCalled();
  });

  it("remonte une panne réseau sans lancer l’installateur", async () => {
    jest.mocked(FileSystem.downloadAsync).mockRejectedValue(new Error("Réseau indisponible"));
    await expect(installAndroidUpdate(apkUrl, "0.2.14")).rejects.toThrow("Réseau indisponible");
    expect(startActivityAsync).not.toHaveBeenCalled();
  });

  it("n’ouvre pas une URI privée si la création de l’URI partagée échoue", async () => {
    jest.mocked(FileSystem.getContentUriAsync).mockRejectedValue(new Error("URI indisponible"));
    await expect(installAndroidUpdate(apkUrl, "0.2.14")).rejects.toThrow("URI indisponible");
    expect(startActivityAsync).not.toHaveBeenCalled();
  });

  it("permet une nouvelle tentative après un refus de lancement ou une annulation", async () => {
    jest.mocked(startActivityAsync).mockRejectedValueOnce(new Error("Installation refusée"));
    await expect(installAndroidUpdate(apkUrl, "0.2.14")).rejects.toThrow("Installation refusée");
    await expect(installAndroidUpdate(apkUrl, "0.2.14")).resolves.toBeUndefined();
    await expect(installAndroidUpdate(apkUrl, "0.2.14")).resolves.toBeUndefined();
    expect(startActivityAsync).toHaveBeenCalledTimes(3);
  });
});
