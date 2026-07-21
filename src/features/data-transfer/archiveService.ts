import type { Character } from "../../types/game";
import {
  exportCharacters,
  importCharacters,
  importLegacyCharactersFromDirectory,
} from "../../utils/persistence";

/** Les ZIP sont limites a cette frontiere d'import/export ponctuelle. */
export const archiveService = {
  import: importCharacters,
  export(characters: Character[], fileName?: string) {
    return exportCharacters(characters, fileName);
  },
  migrateLegacyDirectory: importLegacyCharactersFromDirectory,
};
