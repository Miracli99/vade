import { useRef, useState } from "react";
import { pickAndImportMedia } from "./importMedia";
import { MediaCategory } from "./types";

export function useMediaImport() {
  const lock = useRef(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importImage(category: MediaCategory) {
    if (lock.current) return null;
    lock.current = true;
    setImporting(true);
    setError(null);
    try {
      return await pickAndImportMedia(category);
    } catch (cause) {
      setError(`Import impossible. ${cause instanceof Error ? cause.message : "Réessayez avec une autre image."}`);
      return null;
    } finally {
      lock.current = false;
      setImporting(false);
    }
  }

  return { importImage, importing, error };
}
