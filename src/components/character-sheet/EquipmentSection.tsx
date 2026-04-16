import { StyleSheet, Text, View } from "react-native";

import { Character } from "../../types/game";
import { getReducibleCost, getSpellCost } from "../../utils/game";
import { Section } from "../Section";
import { AssetVisual } from "./AssetVisual";
import { SectionEditButton } from "./SectionEditButton";
import { CharacterSheetTheme } from "./theme";

type EquipmentSectionProps = {
  character: Character;
  theme: CharacterSheetTheme;
  onEdit: () => void;
};

export function EquipmentSection({ character, theme, onEdit }: EquipmentSectionProps) {
  return (
    <Section
      title="Equipement"
      subtitle="L'equipement occupe l'espace principal de la feuille."
      theme={{
        sectionBg: theme.panelBg,
        sectionBorder: theme.border,
        title: theme.title,
        subtitle: theme.subtitle,
      }}
      rightSlot={<SectionEditButton theme={theme} onPress={onEdit} />}
    >
      <View style={styles.list}>
        {character.equipment.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: theme.chipBg, borderColor: theme.border },
            ]}
          >
            <AssetVisual
              label={item.name}
              icon={item.icon}
              imageUrl={item.imageUrl}
              imageModule={item.imageModule}
            />
            <View style={styles.body}>
              <View style={styles.header}>
                <View style={styles.heading}>
                  <Text style={[styles.title, { color: theme.title }]}>{item.name}</Text>
                  <Text style={[styles.meta, { color: theme.subtitle }]}>{item.category}</Text>
                </View>
                {item.usePsyCost ? (
                  <View style={styles.badges}>
                    <Text
                      style={[
                        styles.useBadge,
                        item.reducible &&
                        getReducibleCost(item.usePsyCost, true, character.stance) < item.usePsyCost
                          ? styles.useBadgeReduced
                          : null,
                      ]}
                    >
                      {getReducibleCost(item.usePsyCost, item.reducible ?? false, character.stance)} PSY
                    </Text>
                  </View>
                ) : null}
              </View>
              {item.notes ? (
                <Text style={[styles.description, { color: theme.title }]}>{item.notes}</Text>
              ) : null}
              {item.usePsyCost ? (
                <Text style={[styles.effect, { color: theme.subtitle }]}>
                  Utilisable · {item.usableLabel ?? "Activation"} ·
                  {item.reducible ? " cout reductible en Focus" : " cout fixe"}
                </Text>
              ) : null}
              {item.grantedSpell ? (
                <View
                  style={[
                    styles.grantedSpellCard,
                    { backgroundColor: theme.panelBg, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.header}>
                    <View style={styles.heading}>
                      <Text style={[styles.title, { color: theme.title }]}>
                        Don associe · {item.grantedSpell.name}
                      </Text>
                      <Text style={[styles.meta, { color: theme.subtitle }]}>
                        {item.grantedSpell.augmentable
                          ? "Augmentable"
                          : item.grantedSpell.reducible
                            ? "Reductible"
                            : "Cout fixe"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.useBadge,
                        item.grantedSpell.reducible &&
                        getSpellCost(item.grantedSpell, character.stance) <
                          item.grantedSpell.basePsyCost
                          ? styles.useBadgeReduced
                          : null,
                      ]}
                    >
                      {getSpellCost(item.grantedSpell, character.stance)} PSY
                    </Text>
                  </View>
                  <Text style={[styles.description, { color: theme.title }]}>
                    {item.grantedSpell.description}
                  </Text>
                  {item.grantedSpell.tags.length ? (
                    <View style={styles.assetTags}>
                      {item.grantedSpell.tags.map((tag) => (
                        <View
                          key={`${item.id}-${item.grantedSpell?.id}-${tag}`}
                          style={[
                            styles.assetTag,
                            { backgroundColor: theme.chipBg, borderColor: theme.border },
                          ]}
                        >
                          <Text style={[styles.assetTagLabel, { color: theme.title }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
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
              {item.activeEffects.map((effect) => (
                <Text key={effect.id} style={[styles.effect, { color: theme.subtitle }]}>
                  Actif · {effect.label} · {effect.description}
                </Text>
              ))}
              {item.passiveEffects.map((effect) => (
                <Text key={effect.id} style={[styles.effect, { color: theme.subtitle }]}>
                  Passif · {effect.label} · {effect.description}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  card: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  body: { flex: 1, gap: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  heading: { flex: 1, gap: 3 },
  badges: { alignItems: "flex-end", gap: 8 },
  useBadge: {
    color: "#082f49",
    backgroundColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  useBadgeReduced: { color: "#3f2200", backgroundColor: "#fbbf24" },
  title: { fontSize: 17, fontWeight: "800" },
  meta: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  description: { lineHeight: 21 },
  effect: { lineHeight: 20 },
  grantedSpellCard: {
    gap: 8,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  assetTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  assetTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  assetTagLabel: { fontSize: 12, fontWeight: "700" },
});
