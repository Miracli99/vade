import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type AssetVisualProps = {
  label: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  small?: boolean;
  character?: boolean;
  large?: boolean;
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
  large = false,
  onPress,
  active = false,
}: AssetVisualProps) {
  const sizeStyle = character
    ? large
      ? styles.characterVisualLarge
      : styles.characterVisual
    : small
      ? styles.assetVisualSmall
      : styles.assetVisual;
  const imageResizeMode = "contain";
  const content = imageUrl || imageModule ? (
    <View style={[sizeStyle, styles.imageFrame]}>
      <Image
        source={imageUrl ? { uri: imageUrl } : imageModule}
        style={styles.imageContent}
        resizeMode={imageResizeMode}
      />
    </View>
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
    height: 128,
    borderRadius: 24,
  },
  characterVisualLarge: {
    width: 144,
    height: 188,
    borderRadius: 28,
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
  imageFrame: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  imageContent: {
    width: "100%",
    height: "100%",
  },
});
