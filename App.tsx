import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StatusBar as NativeStatusBar,
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
import {
  exportCharacters,
  importCharacters,
  importCharactersFromDirectory,
  loadSyncDirectoryUri,
  persistSyncDirectoryUri,
  pickSyncDirectory,
  loadCharactersFromStorage,
  persistCharactersToStorage,
  syncCharactersToDirectory,
} from "./src/utils/persistence";
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

type PendingImport = {
  characters: Character[];
  conflicts: Array<{
    id: string;
    currentName: string;
    importedName: string;
  }>;
};

export default function App() {
  const androidTopInset = Platform.OS === "android" ? NativeStatusBar.currentHeight ?? 0 : 0;
  const [route, setRoute] = useState<AppRoute>("home");
  const [characters, setCharacters] = useState<Character[]>(sampleCharacters.map(normalizeCharacter));
  const [selectedId, setSelectedId] = useState(sampleCharacters[0]?.id ?? "");
  const [syncDirectoryUri, setSyncDirectoryUri] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<UpdateManifest | null>(null);
  const [homeMessage, setHomeMessage] = useState<string | null>(null);
  const [creationRequest, setCreationRequest] = useState(0);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const latestSyncCharactersRef = useRef(characters);
  const latestSyncDirectoryUriRef = useRef<string | null>(syncDirectoryUri);
  const syncInFlightRef = useRef(false);
  const syncQueuedRef = useRef(false);

  async function flushSyncDirectory() {
    if (syncInFlightRef.current) {
      syncQueuedRef.current = true;
      return false;
    }

    syncInFlightRef.current = true;
    setSyncBusy(true);

    try {
      do {
        syncQueuedRef.current = false;

        const directoryUri = latestSyncDirectoryUriRef.current;

        if (!storageReady || !directoryUri || Platform.OS !== "android") {
          return false;
        }

        await syncCharactersToDirectory(latestSyncCharactersRef.current, directoryUri);
      } while (syncQueuedRef.current);

      return true;
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      setHomeMessage(`Sync Android impossible.${reason}`);
      return false;
    } finally {
      syncInFlightRef.current = false;
      setSyncBusy(false);

      if (syncQueuedRef.current) {
        void flushSyncDirectory();
      }
    }
  }

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const stored = await loadCharactersFromStorage();
        const storedSyncDirectoryUri = await loadSyncDirectoryUri();

        if (!active) {
          return;
        }

        setSyncDirectoryUri(storedSyncDirectoryUri);

        if (stored.characters?.length) {
          const normalizedCharacters = stored.characters.map(normalizeCharacter);
          setCharacters(normalizedCharacters);
          const initialCharacterId = stored.selectedId ?? normalizedCharacters[0]!.id;
          setSelectedId(initialCharacterId);
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
    latestSyncCharactersRef.current = characters;
    latestSyncDirectoryUriRef.current = syncDirectoryUri;

    if (!storageReady || !syncDirectoryUri || Platform.OS !== "android") {
      return;
    }

    void flushSyncDirectory();
  }, [characters, storageReady, syncDirectoryUri]);

  useEffect(() => {
    if (!homeMessage) {
      return;
    }

    const timeout = setTimeout(() => setHomeMessage(null), 2000);

    return () => clearTimeout(timeout);
  }, [homeMessage]);

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
          setUpdateError(null);
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

  function openCreationFromHome() {
    setHomeMessage(null);
    setRoute("character");
    setCreationRequest((current) => current + 1);
  }

  function mergeImportedCharacters(
    currentCharacters: Character[],
    importedCharacters: Character[],
    overwriteExisting: boolean,
  ) {
    const importedById = new Map(importedCharacters.map((character) => [character.id, character]));
    const existingIds = new Set(currentCharacters.map((character) => character.id));
    const mergedCharacters = currentCharacters.map(
      (character) => (overwriteExisting ? importedById.get(character.id) ?? character : character),
    );
    const addedCharacters = importedCharacters.filter((character) => !existingIds.has(character.id));

    return {
      characters: [...mergedCharacters, ...addedCharacters],
      addedCount: addedCharacters.length,
      updatedCount: importedCharacters.length - addedCharacters.length,
    };
  }

  function applyImportedCharacters(importedCharacters: Character[], overwriteExisting: boolean) {
    const mergeResult = mergeImportedCharacters(characters, importedCharacters, overwriteExisting);
    const importedIds = new Set(importedCharacters.map((character) => character.id));
    const firstSelectableCharacter =
      mergeResult.characters.find((character) => importedIds.has(character.id)) ??
      mergeResult.characters.find((character) => character.id === selectedId) ??
      mergeResult.characters[0];

    setCharacters(mergeResult.characters);

    if (firstSelectableCharacter) {
      setSelectedId(firstSelectableCharacter.id);
    }

    setRoute("home");
    setPendingImport(null);
    setHomeMessage(
      overwriteExisting
        ? `${importedCharacters.length} importe(s): ${mergeResult.addedCount} ajoute(s), ${mergeResult.updatedCount} mis a jour.`
        : `${mergeResult.addedCount} ajoute(s), ${mergeResult.updatedCount} doublon(s) ignore(s).`,
    );
  }

  async function handleImportFromHome() {
    try {
      const importedCharacters = await importCharacters();

      if (!importedCharacters?.length) {
        return;
      }

      const normalizedImportedCharacters = importedCharacters.map(normalizeCharacter);
      const currentById = new Map(characters.map((character) => [character.id, character]));
      const conflicts = normalizedImportedCharacters.flatMap((character) => {
        const currentCharacter = currentById.get(character.id);

        return currentCharacter
          ? [
              {
                id: character.id,
                currentName: currentCharacter.name,
                importedName: character.name,
              },
            ]
          : [];
      });

      if (conflicts.length) {
        setPendingImport({
          characters: normalizedImportedCharacters,
          conflicts,
        });
        return;
      }

      applyImportedCharacters(normalizedImportedCharacters, true);
    } catch {
      setHomeMessage("Import impossible: JSON invalide.");
    }
  }

  async function handleExportFromHome(characterId: string) {
    const selectedCharacter = characters.find((character) => character.id === characterId);

    if (!selectedCharacter) {
      setHomeMessage("Aucun personnage selectionne pour l'export.");
      return;
    }

    const safeName = selectedCharacter.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    await exportCharacters([selectedCharacter], `vade-retro-${safeName || "personnage"}.json`);
    setHomeMessage(`Export JSON pret pour ${selectedCharacter.name}.`);
  }

  async function handlePickSyncDirectory() {
    const directoryUri = await pickSyncDirectory();

    if (!directoryUri) {
      setHomeMessage("Selection du dossier annulee.");
      return;
    }

    try {
      setSyncBusy(true);
      await persistSyncDirectoryUri(directoryUri);
      latestSyncCharactersRef.current = characters;
      latestSyncDirectoryUriRef.current = directoryUri;
      setSyncDirectoryUri(directoryUri);
      const synced = await flushSyncDirectory();

      if (synced) {
        setHomeMessage("Sync Android active.");
      }
    } catch {
      setHomeMessage("Impossible d'activer la sync Android sur ce dossier.");
    } finally {
      setSyncBusy(false);
    }
  }

  async function handleDisableSync() {
    await persistSyncDirectoryUri(null);
    latestSyncDirectoryUriRef.current = null;
    syncQueuedRef.current = false;
    setSyncDirectoryUri(null);
    setHomeMessage("Sync Android desactivee.");
  }

  async function handleRefreshFromSyncDirectory() {
    if (!syncDirectoryUri) {
      setHomeMessage("Aucun dossier de sync configure.");
      return;
    }

    if (syncBusy || syncInFlightRef.current) {
      setHomeMessage("Sync en cours.");
      return;
    }

    try {
      setRefreshBusy(true);
      const importResult = await importCharactersFromDirectory(syncDirectoryUri);
      const normalizedImportedCharacters = importResult.characters.map(normalizeCharacter);
      const importedIds = new Set(normalizedImportedCharacters.map((character) => character.id));
      const skippedCharacterIds = new Set(
        importResult.skippedFiles
          .map((file) => file.characterId)
          .filter((characterId): characterId is string => Boolean(characterId)),
      );
      const preservedCharacters = characters.filter(
        (character) => skippedCharacterIds.has(character.id) && !importedIds.has(character.id),
      );
      const normalizedCharacters = [...normalizedImportedCharacters, ...preservedCharacters];
      const nextSelectedId =
        normalizedCharacters.find((character) => character.id === selectedId)?.id ??
        normalizedCharacters[0]!.id;

      setCharacters(normalizedCharacters);
      setSelectedId(nextSelectedId);
      setRoute("home");
      setHomeMessage(
        importResult.skippedFiles.length
          ? `${normalizedImportedCharacters.length} recharge(s), ${importResult.skippedFiles.length} ignore(s): ${importResult.skippedFiles
              .slice(0, 3)
              .map((file) => file.fileName)
              .join(", ")}${importResult.skippedFiles.length > 3 ? "..." : ""}.`
          : `${normalizedCharacters.length} personnage(s) recharge(s) depuis le dossier Android.`,
      );
    } catch (error) {
      setHomeMessage(error instanceof Error ? `Refresh impossible. ${error.message}` : "Refresh impossible.");
    } finally {
      setRefreshBusy(false);
    }
  }

  function closeUpdateModal() {
    if (installingUpdate) {
      return;
    }

    setUpdateError(null);
    setAvailableUpdate(null);
  }

  async function openUpdateDownload() {
    if (!availableUpdate?.apkUrl) {
      return;
    }

    try {
      setUpdateError(null);
      await Linking.openURL(availableUpdate.apkUrl);
      setAvailableUpdate(null);
    } catch {
      setUpdateError(
        "Impossible d'ouvrir le telechargement Android. Verifiez le lien APK ou essayez depuis un navigateur.",
      );
    }
  }

  async function installDownloadedUpdate() {
    if (!availableUpdate?.apkUrl || installingUpdate) {
      return;
    }

    setInstallingUpdate(true);
    setUpdateError(null);

    try {
      await Linking.openURL(availableUpdate.apkUrl);
      setAvailableUpdate(null);
    } catch {
      setUpdateError(
        "Impossible d'ouvrir le telechargement Android. Verifiez le lien APK ou essayez depuis un navigateur.",
      );
    } finally {
      setInstallingUpdate(false);
    }
  }

  return (
    <SafeAreaView style={[styles.app, androidTopInset > 0 ? { paddingTop: androidTopInset } : null]}>
      <ExpoStatusBar style="light" />
      {route === "home" ? (
        <HomeScreen
          characters={characters}
          message={homeMessage}
          onCreateCharacter={openCreationFromHome}
          onImportCharacters={() => void handleImportFromHome()}
          onExportCharacter={(characterId) => void handleExportFromHome(characterId)}
          syncEnabled={Boolean(syncDirectoryUri)}
          syncBusy={syncBusy}
          refreshBusy={refreshBusy}
          onEnableSync={() => void handlePickSyncDirectory()}
          onDisableSync={() => void handleDisableSync()}
          onRefreshSync={() => void handleRefreshFromSyncDirectory()}
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
          creationRequest={creationRequest}
          onCreationRequestHandled={() => setCreationRequest(0)}
          onOpenHome={() => setRoute("home")}
        />
      ) : null}
      {route === "history" ? <HistoryScreen onOpenHome={() => setRoute("home")} /> : null}
      <Modal
        visible={Boolean(pendingImport)}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingImport(null)}
      >
        <View style={styles.updateBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setPendingImport(null)} />
          <View style={styles.updateCard}>
            <Text style={styles.updateEyebrow}>Conflit d'import</Text>
            <Text style={styles.updateTitle}>Personnage deja existant</Text>
            <Text style={styles.updateText}>
              Ces personnages existent deja dans l'application. Choisissez si le fichier importe doit
              les ecraser.
            </Text>
            <View style={styles.importConflictList}>
              {pendingImport?.conflicts.slice(0, 5).map((conflict) => (
                <View key={conflict.id} style={styles.importConflictRow}>
                  <Text style={styles.importConflictName}>{conflict.currentName}</Text>
                  {conflict.importedName !== conflict.currentName ? (
                    <Text style={styles.importConflictMeta}>
                      Import: {conflict.importedName}
                    </Text>
                  ) : null}
                </View>
              ))}
              {pendingImport && pendingImport.conflicts.length > 5 ? (
                <Text style={styles.importConflictMore}>
                  +{pendingImport.conflicts.length - 5} autre(s)
                </Text>
              ) : null}
            </View>
            <View style={styles.updateActions}>
              <Pressable onPress={() => setPendingImport(null)} style={styles.updateSecondaryButton}>
                <Text style={styles.updateSecondaryButtonLabel}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (pendingImport) {
                    applyImportedCharacters(pendingImport.characters, false);
                  }
                }}
                style={styles.updateSecondaryButton}
              >
                <Text style={styles.updateSecondaryButtonLabel}>Ne pas ecraser</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (pendingImport) {
                    applyImportedCharacters(pendingImport.characters, true);
                  }
                }}
                style={styles.updatePrimaryButton}
              >
                <Text style={styles.updatePrimaryButtonLabel}>Ecraser</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
            {updateError ? <Text style={styles.updateErrorText}>{updateError}</Text> : null}
            <View style={styles.updateActions}>
              <Pressable
                onPress={closeUpdateModal}
                style={[styles.updateSecondaryButton, installingUpdate && styles.updateButtonDisabled]}
                disabled={installingUpdate}
              >
                <Text style={styles.updateSecondaryButtonLabel}>Plus tard</Text>
              </Pressable>
              <Pressable
                onPress={() => void openUpdateDownload()}
                style={[styles.updateSecondaryButton, installingUpdate && styles.updateButtonDisabled]}
                disabled={installingUpdate}
              >
                <Text style={styles.updateSecondaryButtonLabel}>Telecharger</Text>
              </Pressable>
              <Pressable
                onPress={() => void installDownloadedUpdate()}
                style={[styles.updatePrimaryButton, installingUpdate && styles.updateButtonDisabled]}
                disabled={installingUpdate}
              >
                {installingUpdate ? (
                  <View style={styles.updateBusyContent}>
                    <ActivityIndicator color="#3f2200" size="small" />
                    <Text style={styles.updatePrimaryButtonLabel}>Ouverture...</Text>
                  </View>
                ) : (
                  <Text style={styles.updatePrimaryButtonLabel}>Ouvrir Android</Text>
                )}
              </Pressable>
            </View>
            {!installingUpdate ? null : (
              <Text style={styles.updateHintText}>
                Android va gerer le telechargement de l&apos;APK et proposer l&apos;installation.
              </Text>
            )}
            {!installingUpdate ? null : null}
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
    alignItems: "center",
    flexWrap: "wrap",
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
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateBusyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  updateHintText: {
    color: "#94a3b8",
    lineHeight: 20,
    marginTop: 6,
  },
  updateErrorText: {
    color: "#fca5a5",
    lineHeight: 20,
    marginTop: 4,
  },
  importConflictList: {
    gap: 8,
    marginTop: 4,
  },
  importConflictRow: {
    gap: 3,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#172033",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  importConflictName: {
    color: "#f8fafc",
    fontWeight: "900",
  },
  importConflictMeta: {
    color: "#94a3b8",
    lineHeight: 18,
  },
  importConflictMore: {
    color: "#cbd5e1",
    fontWeight: "800",
  },
});
