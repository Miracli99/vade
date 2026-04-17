import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { sampleCharacters } from "./src/data/sampleCharacters";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CharacterSheetScreen } from "./src/screens/CharacterSheetScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { Character } from "./src/types/game";
import { normalizeCharacter } from "./src/utils/characters";
import { loadCharactersFromStorage, persistCharactersToStorage } from "./src/utils/persistence";
import { fetchUpdateManifest, isRemoteVersionNewer, UpdateManifest } from "./src/utils/updates";

const APP_CONFIG = require("./app.json") as {
  expo?: {
    version?: string;
    extra?: {
      updateManifestUrl?: string;
    };
  };
};
const APP_VERSION = APP_CONFIG.expo?.version ?? "0.0.0";
const UPDATE_MANIFEST_URL = APP_CONFIG.expo?.extra?.updateManifestUrl ?? "";

type AppRoute = "home" | "character" | "history";

export default function App() {
  const [route, setRoute] = useState<AppRoute>("home");
  const [characters, setCharacters] = useState<Character[]>(sampleCharacters.map(normalizeCharacter));
  const [selectedId, setSelectedId] = useState(sampleCharacters[0]?.id ?? "");
  const [storageReady, setStorageReady] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<UpdateManifest | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const stored = await loadCharactersFromStorage();

        if (!active) {
          return;
        }

        if (stored.characters?.length) {
          const normalizedCharacters = stored.characters.map(normalizeCharacter);
          setCharacters(normalizedCharacters);
          setSelectedId(stored.selectedId ?? normalizedCharacters[0]!.id);
        }
      } finally {
        if (active) {
          setStorageReady(true);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady || !characters.length) {
      return;
    }

    const hasSelectedCharacter = characters.some((character) => character.id === selectedId);
    const safeSelectedId = hasSelectedCharacter ? selectedId : characters[0]!.id;

    if (safeSelectedId !== selectedId) {
      setSelectedId(safeSelectedId);
      return;
    }

    void persistCharactersToStorage(characters, safeSelectedId);
  }, [characters, selectedId, storageReady]);

  useEffect(() => {
    let active = true;

    async function checkForUpdate() {
      if (Platform.OS !== "android" || !UPDATE_MANIFEST_URL) {
        return;
      }

      try {
        const manifest = await fetchUpdateManifest(UPDATE_MANIFEST_URL);

        if (!active || !manifest) {
          return;
        }

        if (isRemoteVersionNewer(APP_VERSION, manifest.version)) {
          setAvailableUpdate(manifest);
        }
      } catch {
        // Silent by design: update check should not block app startup.
      }
    }

    void checkForUpdate();

    return () => {
      active = false;
    };
  }, []);

  function openCharacter(characterId: string) {
    setSelectedId(characterId);
    setRoute("character");
  }

  function closeUpdateModal() {
    setAvailableUpdate(null);
  }

  async function openUpdateDownload() {
    if (!availableUpdate?.apkUrl) {
      return;
    }

    try {
      await Linking.openURL(availableUpdate.apkUrl);
    } finally {
      setAvailableUpdate(null);
    }
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />
      {route === "home" ? (
        <HomeScreen
          characters={characters}
          selectedId={selectedId}
          onOpenCharacter={openCharacter}
          onOpenHistory={() => setRoute("history")}
        />
      ) : null}
      {route === "character" ? (
        <CharacterSheetScreen
          characters={characters}
          setCharacters={setCharacters}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onOpenHome={() => setRoute("home")}
        />
      ) : null}
      {route === "history" ? <HistoryScreen onOpenHome={() => setRoute("home")} /> : null}
      <Modal
        visible={Boolean(availableUpdate)}
        transparent
        animationType="fade"
        onRequestClose={closeUpdateModal}
      >
        <View style={styles.updateBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeUpdateModal} />
          <View style={styles.updateCard}>
            <Text style={styles.updateEyebrow}>Mise a jour disponible</Text>
            <Text style={styles.updateTitle}>Version {availableUpdate?.version}</Text>
            <Text style={styles.updateText}>
              Une version plus recente de l&apos;application est disponible au telechargement.
            </Text>
            {availableUpdate?.notes ? (
              <View style={styles.updateNotesBox}>
                <Text style={styles.updateNotesLabel}>Notes</Text>
                <Text style={styles.updateNotesText}>{availableUpdate.notes}</Text>
              </View>
            ) : null}
            <View style={styles.updateActions}>
              <Pressable onPress={closeUpdateModal} style={styles.updateSecondaryButton}>
                <Text style={styles.updateSecondaryButtonLabel}>Plus tard</Text>
              </Pressable>
              <Pressable onPress={() => void openUpdateDownload()} style={styles.updatePrimaryButton}>
                <Text style={styles.updatePrimaryButtonLabel}>Telecharger</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  updateBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.76)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  updateCard: {
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    gap: 10,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#101827",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.24)",
  },
  updateEyebrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  updateTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "900",
  },
  updateText: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  updateNotesBox: {
    gap: 6,
    marginTop: 4,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#172033",
  },
  updateNotesLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  updateNotesText: {
    color: "#cbd5e1",
    lineHeight: 20,
  },
  updateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  updateSecondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#172033",
  },
  updateSecondaryButtonLabel: {
    color: "#cbd5e1",
    fontWeight: "800",
  },
  updatePrimaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fbbf24",
  },
  updatePrimaryButtonLabel: {
    color: "#3f2200",
    fontWeight: "900",
  },
});
