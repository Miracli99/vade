import { StyleSheet, Text, View } from "react-native";

import { modernColors, modernRadii } from "../../components/ui/design";
import { HistoryContentBlock } from "../../data/historyContent";

type HistoryClassEntryBlockProps = {
  block: Extract<HistoryContentBlock, { type: "classEntry" }>;
  isPhone: boolean;
};

export function HistoryClassEntryBlock({ block, isPhone }: HistoryClassEntryBlockProps) {
  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{block.title}</Text>
        {block.subtitle ? <Text style={styles.entrySubtitle}>{block.subtitle}</Text> : null}
      </View>
      <Text style={styles.paragraph}>{block.text}</Text>
      <View style={[styles.subclassGrid, isPhone ? styles.subclassGridPhone : null]}>
        {block.subclasses.map((subclass) => (
          <View
            key={`${block.title}-${subclass.name}`}
            style={[
              styles.subclassCard,
              subclass.accent === "gold" ? styles.subclassCardGold : null,
              subclass.accent === "crimson" ? styles.subclassCardCrimson : null,
              subclass.accent === "azure" ? styles.subclassCardAzure : null,
              subclass.accent === "emerald" ? styles.subclassCardEmerald : null,
              subclass.accent === "violet" ? styles.subclassCardViolet : null,
            ]}
          >
            <Text
              style={[
                styles.subclassName,
                subclass.accent === "gold" ? styles.subclassNameGold : null,
                subclass.accent === "crimson" ? styles.subclassNameCrimson : null,
                subclass.accent === "azure" ? styles.subclassNameAzure : null,
                subclass.accent === "emerald" ? styles.subclassNameEmerald : null,
                subclass.accent === "violet" ? styles.subclassNameViolet : null,
              ]}
            >
              {subclass.name}
            </Text>
            <Text style={styles.subclassText}>{subclass.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  subclassGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  subclassGridPhone: {
    flexDirection: "column",
  },
  subclassCard: {
    flexGrow: 1,
    flexBasis: 220,
    gap: 6,
    padding: 12,
    borderRadius: modernRadii.md,
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  subclassCardGold: {
    borderColor: modernColors.borderStrong,
  },
  subclassCardCrimson: {
    borderColor: "rgba(217, 93, 86, 0.34)",
  },
  subclassCardAzure: {
    borderColor: "rgba(93, 157, 255, 0.34)",
  },
  subclassCardEmerald: {
    borderColor: "rgba(98, 184, 123, 0.34)",
  },
  subclassCardViolet: {
    borderColor: "rgba(168, 85, 247, 0.34)",
  },
  subclassName: {
    color: modernColors.text,
    fontWeight: "900",
  },
  subclassNameGold: {
    color: modernColors.accent,
  },
  subclassNameCrimson: {
    color: modernColors.crimson,
  },
  subclassNameAzure: {
    color: modernColors.azure,
  },
  subclassNameEmerald: {
    color: modernColors.emerald,
  },
  subclassNameViolet: {
    color: "#d8b4fe",
  },
  subclassText: {
    color: modernColors.textSoft,
    lineHeight: 20,
    fontSize: 13,
  },
});

