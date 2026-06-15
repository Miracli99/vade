import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { LOCAL_IMAGE_LIBRARY } from "../../data/image-library";
import { ImageModule } from "../../types/game";
import { getImageModuleKey, isKnownImageModule } from "../../utils/assets";
import { modernColors, modernRadii } from "../ui/design";

type AssetVisualProps = {
  label: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: ImageModule;
  thumbnailModule?: ImageModule;
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
  const safeLabel = typeof label === "string" && label.trim() ? label : "Visuel";
  const sizeStyle = character
    ? large
      ? styles.characterVisualLarge
      : styles.characterVisual
    : small
      ? styles.assetVisualSmall
      : styles.assetVisual;
  const imageResizeMode = character ? "cover" : "contain";
  const safeImageModule = isKnownImageModule(imageModule) ? imageModule : undefined;
  const safeThumbnailModule = isKnownImageModule(thumbnailModule) ? thumbnailModule : undefined;
  const resolvedThumbnailModule =
    safeThumbnailModule ?? (large ? undefined : getThumbnailModuleForImage(safeImageModule));
  const resolvedImageModule =
    resolvedThumbnailModule ??
    safeImageModule ??
    (character ? getFallbackCharacterImageModule(safeLabel) : undefined);
  const imageKey = `${imageUrl ?? "local"}-${getImageModuleKey(resolvedImageModule)}`;
  const content = imageUrl || resolvedImageModule ? (
    <View style={[sizeStyle, styles.imageFrame]}>
      <Image
        key={imageKey}
        source={imageUrl ? { uri: imageUrl } : resolvedImageModule}
        style={styles.imageContent}
        resizeMode={imageResizeMode}
        resizeMethod={imageUrl ? "resize" : "auto"}
      />
    </View>
  ) : (
    <View style={[sizeStyle, styles.assetFallback, active ? styles.assetFallbackActive : null]}>
      <Text style={small ? styles.assetFallbackSmallText : styles.assetFallbackText}>
        {icon ?? safeLabel.slice(0, 1)}
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

const thumbnailByImageModule = new Map<string, ImageModule>();
const fallbackCharacterImageByName = new Map<string, ImageModule>();

Object.values(LOCAL_IMAGE_LIBRARY).forEach((options) => {
  options.forEach((option) => {
    if (option.thumbnailModule) {
      thumbnailByImageModule.set(getImageModuleKey(option.imageModule), option.thumbnailModule);
    }
  });
});

LOCAL_IMAGE_LIBRARY.character.forEach((option) => {
  if (option.id === "char-humaine-occultiste") {
    fallbackCharacterImageByName.set("soeur agnes", option.thumbnailModule ?? option.imageModule);
  }

  if (option.id === "char-cleric-hunter") {
    fallbackCharacterImageByName.set("marco vale", option.thumbnailModule ?? option.imageModule);
  }
});

function getThumbnailModuleForImage(imageModule?: ImageModule) {
  return imageModule
    ? thumbnailByImageModule.get(getImageModuleKey(imageModule))
    : undefined;
}

function getFallbackCharacterImageModule(label: string) {
  return fallbackCharacterImageByName.get(label.toLowerCase().trim());
}

const styles = StyleSheet.create({
  assetVisual: {
    width: 84,
    height: 84,
    borderRadius: modernRadii.lg,
  },
  characterVisual: {
    width: 96,
    height: 128,
    borderRadius: modernRadii.lg,
  },
  characterVisualLarge: {
    width: "100%",
    maxWidth: 220,
    aspectRatio: 0.72,
    alignSelf: "center",
    borderRadius: modernRadii.lg,
  },
  assetVisualButton: {
    borderRadius: modernRadii.lg,
  },
  assetVisualSmall: {
    width: 42,
    height: 42,
    borderRadius: modernRadii.md,
  },
  assetFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  assetFallbackActive: {
    backgroundColor: modernColors.accentSoft,
    borderColor: modernColors.borderStrong,
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
