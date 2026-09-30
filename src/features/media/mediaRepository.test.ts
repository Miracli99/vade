import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, Platform } from "react-native";
import { manipulateAsync } from "expo-image-manipulator";
import { MediaRepository } from "./mediaRepository";

jest.mock("@react-native-async-storage/async-storage", () => ({ getItem: jest.fn(), setItem: jest.fn() }));
jest.mock("expo-file-system", () => ({ File: class { async bytes() { return new Uint8Array([1, 2, 3]); } } }));
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///documents/", makeDirectoryAsync: async () => {}, copyAsync: async () => {},
  getInfoAsync: async () => ({ exists: true }),
}));
jest.mock("expo-image-manipulator", () => ({ SaveFormat: { WEBP: "webp" }, manipulateAsync: jest.fn() }));
jest.mock("expo-crypto", () => ({ CryptoDigestAlgorithm: { SHA256: "SHA-256" }, digest: async () => new Uint8Array(32).fill(1).buffer }));

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  jest.mocked(AsyncStorage.setItem).mockResolvedValue();
  jest.spyOn(Image, "getSize").mockImplementation((_uri, success) => { success?.(4000, 3000); });
  jest.mocked(manipulateAsync).mockResolvedValue({ uri: "file:///normalized.webp", width: 1600, height: 1200 });
});

describe("catalogue des médias", () => {
  it("notifie les aperçus dès que le catalogue est chargé", async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "custom-saved", fileName: "saved.webp", thumbnailFileName: "thumb.webp", origin: "custom" }]));
    const repository = new MediaRepository();
    const listener = jest.fn();
    repository.subscribe(listener);
    await repository.initialize();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(repository.resolve("custom-saved")).toEqual({ uri: "file:///documents/media/saved.webp" });
  });

  it("autorise une nouvelle tentative après un échec de chargement", async () => {
    const repository = new MediaRepository();
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error("Lecture impossible"));
    await expect(repository.initialize()).rejects.toThrow();
    await repository.initialize();
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(2);
  });

  it("publie une source durable immédiatement et déduplique le second import", async () => {
    const repository = new MediaRepository();
    await repository.initialize();
    const listener = jest.fn();
    repository.subscribe(listener);
    const asset = await repository.import({ uri: "file:///photo.jpg", category: "character" });
    expect(repository.getSnapshot()).toContain(asset);
    expect(repository.resolve(asset.id)).toEqual({ uri: asset.uri });
    expect(asset.uri).toMatch(/^file:\/\/\/documents\/media\//);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(manipulateAsync).toHaveBeenNthCalledWith(1, "file:///photo.jpg", [{ resize: { width: 1600 } }], { compress: 0.82, format: "webp" });
    expect(await repository.import({ uri: "file:///photo.jpg", category: "character" })).toBe(asset);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it("ne publie pas un import non sauvegardé et permet de réessayer", async () => {
    const repository = new MediaRepository();
    await repository.initialize();
    const before = repository.getSnapshot();
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error("Disque plein"));
    await expect(repository.import({ uri: "file:///photo.jpg", category: "character" })).rejects.toThrow("Disque plein");
    expect(repository.getSnapshot()).toBe(before);
    const asset = await repository.import({ uri: "file:///photo.jpg", category: "character" });
    expect(repository.getSnapshot()).toContain(asset);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
  });
});
