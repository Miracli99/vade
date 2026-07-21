import type { Character } from "../../types/game";
import {
  loadCharactersFromStorage,
  persistCharactersToStorage,
} from "../../utils/persistence";

/** Point d'acces unique au stockage interne des personnages. */
export const characterRepository = {
  load: loadCharactersFromStorage,
  save(characters: Character[], selectedId: string) {
    return persistCharactersToStorage(characters, selectedId);
  },
};
