import { Image, StyleSheet, Text, View } from "react-native";

import { modernColors, modernRadii } from "../../components/ui/design";
import { HistoryContentBlock } from "../../data/historyContent";

type HistoryImageBlockProps = {
  block: Extract<HistoryContentBlock, { type: "image" | "imageText" }>;
  isPhone: boolean;
};

export function HistoryImageBlock({ block, isPhone }: HistoryImageBlockProps) {
  if (!block.imageModule && !block.imageUrl) {
    return null;
  }

  if (block.type === "imageText") {
    return (
      <View style={[styles.imageTextBlock, isPhone ? styles.imageTextBlockPhone : null]}>
        <Image
          source={block.imageModule ? block.imageModule : { uri: block.imageUrl }}
          style={[styles.imageTextImage, isPhone ? styles.imageTextImagePhone : null]}
          resizeMode="contain"
        />
        <View style={styles.imageTextBody}>
          {block.title ? <Text style={styles.imageTextTitle}>{block.title}</Text> : null}
          <Text style={styles.paragraph}>{block.text}</Text>
          {block.caption ? <Text style={styles.imageCaption}>{block.caption}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.imageBlock}>
      <Image
        source={block.imageModule ? block.imageModule : { uri: block.imageUrl }}
        style={[
          styles.image,
          block.compact ? styles.imageCompact : null,
          isPhone ? styles.imagePhone : null,
          isPhone && block.compact ? styles.imageCompactPhone : null,
        ]}
        resizeMode="contain"
      />
      {block.caption ? <Text style={styles.imageCaption}>{block.caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    color: modernColors.textSoft,
    lineHeight: 25,
    fontSize: 15,
  },
  imageBlock: {
    gap: 8,
    alignItems: "center",
  },
  image: {
    width: "100%",
    maxWidth: 620,
    height: 340,
    borderRadius: modernRadii.md,
    backgroundColor: "transparent",
  },
  imageCompact: {
    width: 260,
    height: 360,
    alignSelf: "flex-start",
  },
  imagePhone: {
    height: 240,
  },
  imageCompactPhone: {
    width: 190,
    height: 260,
  },
  imageCaption: {
    color: modernColors.muted,
    fontSize: 12,
    fontStyle: "italic",
  },
  imageTextBlock: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  imageTextBlockPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  imageTextImage: {
    width: 240,
    height: 280,
    borderRadius: modernRadii.md,
    backgroundColor: "transparent",
  },
  imageTextImagePhone: {
    width: "100%",
    height: 260,
  },
  imageTextBody: {
    flex: 1,
    gap: 8,
  },
  imageTextTitle: {
    color: modernColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
});
