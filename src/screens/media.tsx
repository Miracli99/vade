import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { memo, useDeferredValue, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { modernColors, modernRadii, modernSpacing } from "../components/ui/design";
import {
  getMediaUsage,
  mediaRepository,
  useMediaAssets,
  useMediaSource,
} from "../features/media/mediaRepository";
import { MediaAsset, MediaCategory, MediaOrigin } from "../features/media/types";
import { Character } from "../types/game";
import { getResponsiveFlags } from "../utils/responsive";
import { AppNavbar } from "./navbar";

type CategoryFilter = "all" | MediaCategory;
type OriginFilter = "all" | MediaOrigin;

export type MediaLibraryScreenProps = {
  characters: Character[];
  onOpenHome: () => void;
  onOpenCharacters: () => void;
  onOpenHistory: () => void;
  onOpenCharacter: (characterId: string) => void;
};

const CATEGORY_OPTIONS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "Toutes" },
  { id: "character", label: "Personnages" },
  { id: "spell", label: "Dons" },
  { id: "equipment", label: "Équipement" },
  { id: "inventory", label: "Inventaire" },
];

const ORIGIN_OPTIONS: Array<{ id: OriginFilter; label: string }> = [
  { id: "all", label: "Toutes" },
  { id: "builtin", label: "Intégrées" },
  { id: "custom", label: "Personnelles" },
];

export function MediaLibraryScreen({
  characters,
  onOpenHome,
  onOpenCharacters,
  onOpenHistory,
  onOpenCharacter,
}: MediaLibraryScreenProps) {
  const { width } = useWindowDimensions();
  const { isPhone } = getResponsiveFlags(width);
  const allAssets = useMediaAssets();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const columns = isPhone ? 2 : width >= 1320 ? 4 : width >= 900 ? 3 : 2;

  const assets = useMemo(() => {
    const tokens = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return allAssets.filter((asset) => {
      if (category !== "all" && asset.category !== category) return false;
      if (origin !== "all" && asset.origin !== origin) return false;
      const haystack = [asset.label, asset.category, asset.origin, ...asset.tags].join(" ").toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [allAssets, category, deferredQuery, origin]);

  const selected =
    allAssets.find((asset) => asset.id === selectedId) ?? assets[0] ?? null;
  const usages = selected ? getMediaUsage(selected.id, characters) : [];

  async function importImage() {
    setMessage(null);
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMessage("Autorisez l'accès aux images pour continuer.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    const picked = result.canceled ? undefined : result.assets[0];
    if (!picked?.uri) return;
    setBusy(true);
    try {
      const imported = await mediaRepository.import({
        uri: picked.uri,
        fileName: picked.fileName,
        mimeType: picked.mimeType,
        category: category === "all" ? "character" : category,
      });
      setSelectedId(imported.id);
      setOrigin("custom");
      setMessage("Image ajoutée à la médiathèque.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    if (!selected || selected.origin !== "custom" || usages.length) return;
    setBusy(true);
    try {
      await mediaRepository.remove(selected.id, characters);
      setSelectedId(null);
      setMessage("Image supprimée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <AppNavbar
        activeRoute="media"
        compact={isPhone}
        titleColor={modernColors.text}
        subtitleColor={modernColors.muted}
        panelColor={modernColors.panel}
        borderColor={modernColors.border}
        accentColor={modernColors.accent}
        onOpenHome={onOpenHome}
        onOpenCharacter={onOpenCharacters}
        onOpenHistory={onOpenHistory}
        onOpenMedia={() => undefined}
      />
      <View style={[styles.workspace, isPhone ? styles.workspacePhone : null]}>
        <View style={styles.libraryPane}>
          <View style={[styles.headingRow, isPhone ? styles.headingRowPhone : null]}>
            <View>
              <Text accessibilityRole="header" style={styles.title}>Médiathèque</Text>
              <Text style={styles.subtitle}>{allAssets.length} images disponibles et réutilisables.</Text>
            </View>
            <Pressable
              onPress={() => void importImage()}
              disabled={busy}
              style={({ pressed }) => [styles.importButton, pressed ? styles.pressed : null, busy ? styles.disabled : null]}
              accessibilityRole="button"
              accessibilityLabel="Importer une image"
            >
              {busy ? <ActivityIndicator color={modernColors.accentText} /> : null}
              <Text style={styles.importButtonLabel}>{busy ? "Traitement..." : "Importer une image"}</Text>
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une image"
            placeholderTextColor={modernColors.faint}
            style={styles.search}
            accessibilityLabel="Rechercher une image"
          />
          <FilterRow options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />
          <FilterRow options={ORIGIN_OPTIONS} selected={origin} onSelect={setOrigin} />
          {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}

          <FlatList
            key={columns}
            data={assets}
            numColumns={columns}
            keyExtractor={(asset) => asset.id}
            renderItem={({ item }) => (
              <MediaTile
                asset={item}
                selected={item.id === selected?.id}
                usageCount={getMediaUsage(item.id, characters).length}
                onPress={() => setSelectedId(item.id)}
              />
            )}
            columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={styles.grid}
            initialNumToRender={columns * 3}
            maxToRenderPerBatch={columns * 3}
            windowSize={5}
            ListEmptyComponent={<Text style={styles.empty}>Aucune image ne correspond à ces filtres.</Text>}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {!isPhone ? (
          <MediaDetail
            asset={selected}
            usages={usages}
            busy={busy}
            onOpenCharacter={onOpenCharacter}
            onRemove={() => void removeSelected()}
          />
        ) : null}
      </View>
    </View>
  );
}

const MediaTile = memo(function MediaTile({
  asset,
  selected,
  usageCount,
  onPress,
}: {
  asset: MediaAsset;
  selected: boolean;
  usageCount: number;
  onPress: () => void;
}) {
  const source = useMediaSource(asset.id, true);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, selected ? styles.tileSelected : null, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={`${asset.label}, ${usageCount ? `${usageCount} utilisation(s)` : "non utilisée"}`}
      accessibilityState={{ selected }}
    >
      <Image source={source} style={styles.tileImage} contentFit="cover" cachePolicy="memory-disk" transition={120} />
      <View style={styles.tileBody}>
        <Text style={styles.tileTitle} numberOfLines={1}>{asset.label}</Text>
        <Text style={styles.tileMeta}>{asset.origin === "builtin" ? "Intégrée" : "Personnelle"}{usageCount ? ` · ${usageCount} usage(s)` : ""}</Text>
      </View>
    </Pressable>
  );
});

function FilterRow<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ id: T; label: string }>;
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.filters}>
      {options.map((option) => {
        const active = option.id === selected;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[styles.filter, active ? styles.filterActive : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.filterLabel, active ? styles.filterLabelActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MediaDetail({
  asset,
  usages,
  busy,
  onOpenCharacter,
  onRemove,
}: {
  asset: MediaAsset | null;
  usages: ReturnType<typeof getMediaUsage>;
  busy: boolean;
  onOpenCharacter: (characterId: string) => void;
  onRemove: () => void;
}) {
  const source = useMediaSource(asset?.id);
  if (!asset) return <View style={styles.detailPane}><Text style={styles.empty}>Sélectionnez une image.</Text></View>;
  const removable = asset.origin === "custom" && usages.length === 0;
  return (
    <View style={styles.detailPane}>
      <Text style={styles.detailTitle}>Détails de l’image</Text>
      <Image source={source} style={styles.detailImage} contentFit="contain" cachePolicy="memory-disk" />
      <Text style={styles.detailName}>{asset.label}</Text>
      <Text style={styles.detailMeta}>{asset.category} · {asset.origin === "builtin" ? "Intégrée" : "Personnelle"}</Text>
      {asset.width && asset.height ? <Text style={styles.detailMeta}>{asset.width} × {asset.height} · {asset.mimeType}</Text> : null}
      <Text style={styles.usageTitle}>Utilisée dans</Text>
      {usages.length ? usages.map((usage) => (
        <Pressable key={`${usage.characterId}-${usage.slot}`} onPress={() => onOpenCharacter(usage.characterId)} style={styles.usageRow}>
          <View style={styles.usageBody}>
            <Text style={styles.usageName}>{usage.characterName}</Text>
            <Text style={styles.usageSlot}>{usage.slot}</Text>
          </View>
          <Text style={styles.usageArrow}>›</Text>
        </Pressable>
      )) : <Text style={styles.detailMeta}>Aucune utilisation.</Text>}
      <Pressable
        onPress={onRemove}
        disabled={!removable || busy}
        style={[styles.deleteButton, !removable || busy ? styles.disabled : null]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !removable || busy }}
      >
        <Text style={styles.deleteButtonLabel}>Supprimer</Text>
      </Pressable>
      {usages.length ? <Text style={styles.deleteHint}>Cette image est utilisée et ne peut pas être supprimée.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: modernColors.page },
  workspace: { flex: 1, flexDirection: "row", minHeight: 0 },
  workspacePhone: { flexDirection: "column" },
  libraryPane: { flex: 1, minWidth: 0, padding: modernSpacing.xl, gap: modernSpacing.md },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  headingRowPhone: { alignItems: "stretch", flexDirection: "column" },
  title: { color: modernColors.text, fontSize: 32, fontWeight: "800" },
  subtitle: { color: modernColors.muted, fontSize: 14, marginTop: 4 },
  importButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 18, borderRadius: modernRadii.md, backgroundColor: modernColors.accent },
  importButtonLabel: { color: modernColors.accentText, fontWeight: "800", fontSize: 14 },
  search: { minHeight: 48, borderWidth: 1, borderColor: modernColors.border, borderRadius: modernRadii.md, backgroundColor: modernColors.panel, color: modernColors.text, paddingHorizontal: 16, fontSize: 16 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: modernColors.border, borderRadius: modernRadii.sm, backgroundColor: modernColors.panel },
  filterActive: { borderColor: modernColors.accent, backgroundColor: modernColors.accentSoft },
  filterLabel: { color: modernColors.muted, fontWeight: "700" },
  filterLabelActive: { color: modernColors.accent },
  message: { color: modernColors.textSoft, minHeight: 20 },
  grid: { paddingTop: 4, paddingBottom: 32, gap: 12 },
  gridRow: { gap: 12 },
  tile: { flex: 1, minWidth: 0, marginBottom: 12, overflow: "hidden", borderRadius: modernRadii.lg, borderWidth: 1, borderColor: modernColors.border, backgroundColor: modernColors.panel },
  tileSelected: { borderColor: modernColors.accent, borderWidth: 2 },
  tileImage: { width: "100%", aspectRatio: 1.32, backgroundColor: modernColors.shellMuted },
  tileBody: { padding: 10, gap: 3 },
  tileTitle: { color: modernColors.text, fontSize: 14, fontWeight: "800" },
  tileMeta: { color: modernColors.muted, fontSize: 12 },
  detailPane: { width: 360, padding: 20, gap: 12, borderLeftWidth: 1, borderColor: modernColors.border, backgroundColor: modernColors.shell },
  detailTitle: { color: modernColors.accent, fontSize: 18, fontWeight: "800" },
  detailImage: { width: "100%", aspectRatio: 1, borderRadius: modernRadii.lg, backgroundColor: modernColors.panel },
  detailName: { color: modernColors.text, fontSize: 21, fontWeight: "800" },
  detailMeta: { color: modernColors.muted, fontSize: 13, lineHeight: 19 },
  usageTitle: { color: modernColors.accent, fontSize: 15, fontWeight: "800", marginTop: 8 },
  usageRow: { minHeight: 52, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: modernColors.border, borderRadius: modernRadii.md, paddingHorizontal: 12 },
  usageBody: { flex: 1 },
  usageName: { color: modernColors.text, fontWeight: "700" },
  usageSlot: { color: modernColors.muted, fontSize: 12, marginTop: 2 },
  usageArrow: { color: modernColors.accent, fontSize: 24 },
  deleteButton: { minHeight: 48, marginTop: "auto", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: modernColors.crimson, borderRadius: modernRadii.md },
  deleteButtonLabel: { color: modernColors.crimson, fontWeight: "800" },
  deleteHint: { color: modernColors.faint, textAlign: "center", fontSize: 12, lineHeight: 18 },
  empty: { color: modernColors.muted, padding: 24, textAlign: "center" },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.42 },
});
