import { StyleSheet, Text, View } from "react-native";

import { modernColors, modernRadii } from "../../components/ui/design";
import { HistoryContentBlock } from "../../data/historyContent";
import { HistoryClassEntryBlock } from "./class";
import { HistoryImageBlock } from "./howto";

type HistoryBlockProps = {
  block: HistoryContentBlock;
  isPhone: boolean;
};

export function HistoryBlock({ block, isPhone }: HistoryBlockProps) {
  if (block.type === "paragraph") {
    return <Text style={styles.paragraph}>{block.text}</Text>;
  }

  if (block.type === "quote") {
    return <Text style={styles.quote}>“{block.text}”</Text>;
  }

  if (block.type === "entry") {
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{block.title}</Text>
          {block.subtitle ? <Text style={styles.entrySubtitle}>{block.subtitle}</Text> : null}
        </View>
        <Text style={styles.paragraph}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === "classEntry") {
    return <HistoryClassEntryBlock block={block} isPhone={isPhone} />;
  }

  return <HistoryImageBlock block={block} isPhone={isPhone} />;
}

const styles = StyleSheet.create({
  quote: {
    color: modernColors.accent,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  paragraph: {
    color: modernColors.textSoft,
    lineHeight: 25,
    fontSize: 15,
  },
  entryCard: {
    gap: 10,
    padding: 16,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  entryHeader: {
    gap: 3,
  },
  entryTitle: {
    color: modernColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  entrySubtitle: {
    color: modernColors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});

