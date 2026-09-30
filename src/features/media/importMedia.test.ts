import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as ImagePicker from "expo-image-picker";
import { mediaRepository } from "./mediaRepository";
import { pickAndImportMedia } from "./importMedia";

jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock("./mediaRepository", () => ({ mediaRepository: { import: jest.fn() } }));

const picker = jest.mocked(ImagePicker.launchImageLibraryAsync);
const importImage = jest.mocked(mediaRepository.import);

beforeEach(() => { jest.clearAllMocks(); });

describe("import commun des images", () => {
  it("ouvre directement le sélecteur sans permission globale ni recadrage", async () => {
    picker.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///photo.jpg", width: 4000, height: 3000, fileName: "photo.jpg", mimeType: "image/jpeg" }] });
    await pickAndImportMedia("equipment");
    expect(picker).toHaveBeenCalledWith({ mediaTypes: ["images"], allowsEditing: false, quality: 1 });
    expect(importImage).toHaveBeenCalledWith({ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", category: "equipment" });
  });

  it("ne crée aucun média après annulation", async () => {
    picker.mockResolvedValue({ canceled: true, assets: null });
    expect(await pickAndImportMedia("character")).toBeNull();
    expect(importImage).not.toHaveBeenCalled();
  });

  it("remonte aussi les échecs d'ouverture du sélecteur", async () => {
    picker.mockRejectedValue(new Error("Sélecteur indisponible"));
    await expect(pickAndImportMedia("character")).rejects.toThrow("Sélecteur indisponible");
    expect(importImage).not.toHaveBeenCalled();
  });
});
