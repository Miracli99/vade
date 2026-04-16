import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type AssetVisualProps = {
  label: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  small?: boolean;
  character?: boolean;
  onPress?: () => void;
  active?: boolean;
};

export function AssetVisual({
  label,
  icon,
  imageUrl,
  imageModule,
  small = false,
  character = false,
  onPress,
  active = false,
}: AssetVisualProps) {
  const sizeStyle = character
    ? styles.characterVisual
    : small
      ? styles.assetVisualSmall
      : styles.assetVisual;
  const content = imageUrl || imageModule ? (
    <Image
      source={imageUrl ? { uri: imageUrl } : imageModule}
      style={sizeStyle}
      resizeMode="cover"
    />
  ) : (
    <View style={[sizeStyle, styles.assetFallback, active ? styles.assetFallbackActive : null]}>
      <Text style={small ? styles.assetFallbackSmallText : styles.assetFallbackText}>
        {icon ?? label.slice(0, 1)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.assetVisualButton}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  assetVisual: {
    width: 84,
    height: 84,
    borderRadius: 20,
  },
  characterVisual: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  assetVisualButton: {
    borderRadius: 20,
  },
  assetVisualSmall: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  assetFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17223c",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  assetFallbackActive: {
    backgroundColor: "#2a3557",
    borderColor: "rgba(251, 191, 36, 0.35)",
  },
  assetFallbackText: {
    fontSize: 34,
  },
  assetFallbackSmallText: {
    fontSize: 18,
  },
});
