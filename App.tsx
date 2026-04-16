import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { sampleCharacters } from "./src/data/sampleCharacters";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CharacterSheetScreen } from "./src/screens/CharacterSheetScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { Character } from "./src/types/game";
import { normalizeCharacter } from "./src/utils/characters";
import { loadCharactersFromStorage, persistCharactersToStorage } from "./src/utils/persistence";

type AppRoute = "home" | "character" | "history";

export default function App() {
  const [route, setRoute] = useState<AppRoute>("home");
  const [characters, setCharacters] = useState<Character[]>(sampleCharacters.map(normalizeCharacter));
  const [selectedId, setSelectedId] = useState(sampleCharacters[0]?.id ?? "");
  const [storageReady, setStorageReady] = useState(false);

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

  function openCharacter(characterId: string) {
    setSelectedId(characterId);
    setRoute("character");
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
});
