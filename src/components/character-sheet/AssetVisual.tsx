import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { LOCAL_IMAGE_LIBRARY } from "../../data/image-library";

type AssetVisualProps = {
  label: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  thumbnailModule?: number;
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
  thumbnailModule,
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
  const imageResizeMode = character ? "cover" : "contain";
  const resolvedThumbnailModule =
    thumbnailModule ?? (large ? undefined : getThumbnailModuleForImage(imageModule));
  const resolvedImageModule = resolvedThumbnailModule ?? imageModule;
  const content = imageUrl || resolvedImageModule ? (
    <View style={[sizeStyle, styles.imageFrame]}>
      <Image
        source={imageUrl ? { uri: imageUrl } : resolvedImageModule}
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

const thumbnailByImageModule = new Map<number, number>();

Object.values(LOCAL_IMAGE_LIBRARY).forEach((options) => {
  options.forEach((option) => {
    if (option.thumbnailModule) {
      thumbnailByImageModule.set(option.imageModule, option.thumbnailModule);
    }
  });
});

function getThumbnailModuleForImage(imageModule?: number) {
  return imageModule ? thumbnailByImageModule.get(imageModule) : undefined;
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
    width: "100%",
    aspectRatio: 0.76,
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
