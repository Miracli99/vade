import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { modernColors, modernRadii } from "../../components/ui/design";
import { useMediaAssets } from "./mediaRepository";
import { MediaTile } from "./MediaTile";
import { MediaCategory, MediaId } from "./types";
import { useMediaImport } from "./useMediaImport";

export function MediaPicker({ category, title, onSelect, onClose }: {
  category: MediaCategory;
  title: string;
  onSelect: (id: MediaId | undefined) => void;
  onClose: () => void;
}) {
  const allAssets = useMediaAssets();
  const [query, setQuery] = useState("");
  const [personalOnly, setPersonalOnly] = useState(false);
  const { importing, error, importImage } = useMediaImport();
  const { width } = useWindowDimensions();
  const columns = width < 600 ? 2 : 4;
  const assets = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return allAssets.filter((asset) => {
      if (asset.origin !== "custom" && (personalOnly || asset.category !== category)) return false;
      const text = [asset.label, ...asset.tags].join(" ").toLowerCase();
      return tokens.every((token) => text.includes(token));
    });
  }, [allAssets, category, query, personalOnly]);

  async function importSelection() {
    const asset = await importImage(category);
    if (asset) onSelect(asset.id);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => { if (!importing) onClose(); }}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.hint}>Images intégrées et personnelles de la médiathèque.</Text>
          <TextInput accessibilityLabel="Rechercher une image" placeholder="Rechercher une image" placeholderTextColor={modernColors.muted}
            value={query} onChangeText={setQuery} style={styles.search} />
          <View style={styles.actions}>
            {([false, true] as const).map((personal) => (
              <Pressable key={String(personal)} accessibilityRole="button" accessibilityState={{ selected: personalOnly === personal }}
                onPress={() => setPersonalOnly(personal)} style={[styles.button, personalOnly === personal && styles.active]}>
                <Text style={styles.text}>{personal ? "Personnelles" : "Toutes"}</Text>
              </Pressable>
            ))}
          </View>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <FlatList key={columns} data={assets} numColumns={columns} keyExtractor={(asset) => asset.id}
            style={styles.list} columnWrapperStyle={styles.row} contentContainerStyle={styles.grid}
            initialNumToRender={12} windowSize={5} keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <View style={{ width: `${100 / columns}%`, paddingHorizontal: 4 }}>
              <MediaTile asset={item} selected={false} onPress={() => { if (!importing) onSelect(item.id); }} />
            </View>}
            ListEmptyComponent={<Text style={styles.hint}>Aucune image ne correspond à cette recherche.</Text>} />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={importing} onPress={() => void importSelection()} style={[styles.button, styles.active]}>
              {importing && <ActivityIndicator color={modernColors.accent} />}
              <Text style={styles.text}>{importing ? "Import en cours…" : "Importer une image"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={importing} onPress={() => onSelect(undefined)} style={styles.button}>
              <Text style={styles.text}>Retirer l’image</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={importing} onPress={onClose} style={styles.button}>
              <Text style={styles.text}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center", padding: 16 },
  panel: { width: "100%", maxWidth: 960, height: "90%", padding: 16, gap: 12, backgroundColor: modernColors.panel, borderRadius: modernRadii.xl, borderWidth: 1, borderColor: modernColors.borderStrong },
  title: { color: modernColors.text, fontSize: 20, fontWeight: "800" },
  hint: { color: modernColors.muted },
  search: { minHeight: 48, borderWidth: 1, borderColor: modernColors.border, borderRadius: modernRadii.md, paddingHorizontal: 12, color: modernColors.text },
  list: { flex: 1, minHeight: 0 },
  grid: { paddingVertical: 4 },
  row: { alignItems: "stretch" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: { minHeight: 48, paddingHorizontal: 12, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: modernColors.border, borderRadius: modernRadii.md },
  active: { borderColor: modernColors.accent, backgroundColor: modernColors.accentSoft },
  text: { color: modernColors.text, fontWeight: "700" },
  error: { color: modernColors.crimson },
});
