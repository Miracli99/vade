import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { Character } from "../types/game";

const STORAGE_KEY = "vade-retro.characters.v1";
const SELECTION_KEY = "vade-retro.selected-character.v1";

export async function loadCharactersFromStorage() {
  const rawCharacters = await AsyncStorage.getItem(STORAGE_KEY);
  const rawSelectedId = await AsyncStorage.getItem(SELECTION_KEY);

  return {
    characters: rawCharacters ? (JSON.parse(rawCharacters) as Character[]) : null,
    selectedId: rawSelectedId,
  };
}

export async function persistCharactersToStorage(
  characters: Character[],
  selectedId: string,
) {
  await AsyncStorage.multiSet([
    [STORAGE_KEY, JSON.stringify(characters)],
    [SELECTION_KEY, selectedId],
  ]);
}

export async function exportCharacters(characters: Character[], fileName = "vade-retro-characters.json") {
  const payload = JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      characters,
    },
    null,
    2,
  );

  if (Platform.OS === "web") {
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, payload, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

export async function importCharacters(): Promise<Character[] | null> {
  if (Platform.OS === "web") {
    const file = await pickWebFile();

    if (!file) {
      return null;
    }

    const text = await file.text();
    return parseImportedCharacters(text);
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const text = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return parseImportedCharacters(text);
}

function parseImportedCharacters(text: string) {
  const parsed = JSON.parse(text) as
    | Character[]
    | { characters?: Character[] };

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.characters)) {
    return parsed.characters;
  }

  throw new Error("Format JSON invalide.");
}

function pickWebFile() {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}
