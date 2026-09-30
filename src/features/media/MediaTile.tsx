import { memo } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { modernColors, modernRadii } from "../../components/ui/design";
import { useMediaSource } from "./mediaRepository";
import { MediaAsset } from "./types";

export const MediaTile = memo(function MediaTile({
  asset,
  selected,
  usageCount,
  onPress,
}: {
  asset: MediaAsset;
  selected: boolean;
  usageCount?: number;
  onPress: () => void;
}) {
  const source = useMediaSource(asset.id, true);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, selected ? styles.tileSelected : null, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={usageCount === undefined ? asset.label : `${asset.label}, ${usageCount ? `${usageCount} utilisation(s)` : "non utilisée"}`}
      accessibilityState={{ selected }}
    >
      <Image recyclingKey={asset.id} source={source} style={styles.tileImage} contentFit="cover" cachePolicy="memory-disk" transition={120} />
      <View style={styles.tileBody}>
        <Text style={styles.tileTitle} numberOfLines={1}>{asset.label}</Text>
        <Text style={styles.tileMeta}>{asset.origin === "builtin" ? "Intégrée" : "Personnelle"}{usageCount ? ` · ${usageCount} usage(s)` : ""}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: 0, marginBottom: 12, overflow: "hidden", borderRadius: modernRadii.lg, borderWidth: 1, borderColor: modernColors.border, backgroundColor: modernColors.panel },
  tileSelected: { borderColor: modernColors.accent, borderWidth: 2 },
  tileImage: { width: "100%", aspectRatio: 1.32, backgroundColor: modernColors.shellMuted },
  tileBody: { padding: 10, gap: 3 },
  tileTitle: { color: modernColors.text, fontSize: 14, fontWeight: "800" },
  tileMeta: { color: modernColors.muted, fontSize: 12 },
  pressed: { opacity: 0.78 },
});
