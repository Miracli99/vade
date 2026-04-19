import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Character } from "../../types/game";
import { Section } from "../Section";
import { AssetVisual } from "./AssetVisual";
import { SectionEditButton } from "./SectionEditButton";
import { CharacterSheetTheme } from "./theme";

type InventorySectionProps = {
  character: Character;
  theme: CharacterSheetTheme;
  onEdit: () => void;
};

export function InventorySection({ character, theme, onEdit }: InventorySectionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 720;

  return (
    <Section
      title="Inventaire"
      subtitle="Objets emportes par le personnage."
      theme={{
        sectionBg: theme.panelBg,
        sectionBorder: theme.border,
        title: theme.title,
        subtitle: theme.subtitle,
      }}
      rightSlot={<SectionEditButton theme={theme} onPress={onEdit} />}
    >
      <View style={styles.list}>
        {character.inventory.map((item) => (
          <View
            key={item.id}
              style={[
                styles.item,
                isCompact ? styles.itemCompact : null,
                { backgroundColor: theme.chipBg, borderColor: theme.border },
              ]}
          >
            <AssetVisual
              label={item.name}
              icon={item.icon}
              imageUrl={item.imageUrl}
              imageModule={item.imageModule}
              small
            />
            <View style={styles.body}>
              <Text style={[styles.name, { color: theme.title }]}>{item.name}</Text>
              {item.tags.length ? (
                <View style={styles.assetTags}>
                  {item.tags.map((tag) => (
                    <View
                      key={`${item.id}-${tag}`}
                      style={[
                        styles.assetTag,
                        { backgroundColor: theme.panelBg, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.assetTagLabel, { color: theme.title }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {item.notes ? (
                <Text style={[styles.notes, { color: theme.subtitle }]}>{item.notes}</Text>
              ) : null}
            </View>
              <Text style={[styles.qty, isCompact ? styles.qtyCompact : null, { color: theme.accent }]}>
                x{item.quantity}
              </Text>
            </View>
          ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  itemCompact: {
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  body: { flex: 1, gap: 3 },
  name: { fontWeight: "700" },
  notes: { fontSize: 12 },
  qty: { fontWeight: "900" },
  qtyCompact: { width: "100%" },
  assetTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  assetTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  assetTagLabel: { fontSize: 12, fontWeight: "700" },
});
