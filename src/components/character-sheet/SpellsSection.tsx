import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Character } from "../../types/game";
import { getSpellCost } from "../../utils/game";
import { Section } from "../Section";
import { AssetVisual } from "./AssetVisual";
import { SectionEditButton } from "./SectionEditButton";
import { CharacterSheetTheme } from "./theme";

type SpellsSectionProps = {
  character: Character;
  theme: CharacterSheetTheme;
  onEdit: () => void;
  onToggleSpellActive: (spellId: string) => void;
};

export function SpellsSection({
  character,
  theme,
  onEdit,
  onToggleSpellActive,
}: SpellsSectionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 720;

  return (
    <Section
      title="Dons et sorts"
      subtitle="Couts recalcules selon la posture actuelle."
      theme={{
        sectionBg: theme.panelBg,
        sectionBorder: theme.border,
        title: theme.title,
        subtitle: theme.subtitle,
        cardBackgroundImage: theme.cardBackgroundImage,
      }}
      rightSlot={<SectionEditButton theme={theme} onPress={onEdit} />}
    >
      <View style={styles.grid}>
        {character.spells.length ? (
          character.spells.map((spell) => {
            const computedCost = getSpellCost(spell, character.stance);
            const reduced = spell.reducible && computedCost < spell.basePsyCost;
            const isActive = character.activeSpellIds.includes(spell.id);

            return (
              <View
                key={spell.id}
                style={[
                  styles.card,
                  isCompact ? styles.cardCompact : null,
                  {
                    backgroundColor: isActive ? theme.panelBg : theme.chipBg,
                    borderColor: isActive ? theme.accent : theme.border,
                  },
                ]}
              >
                <AssetVisual
                  label={spell.name}
                  icon={spell.icon}
                  imageUrl={spell.imageUrl}
                  imageModule={spell.imageModule}
                  onPress={() => onToggleSpellActive(spell.id)}
                  active={isActive}
                />
                <View style={styles.body}>
                  <View style={styles.header}>
                    <View style={styles.heading}>
                      <Text style={[styles.title, { color: theme.title }]} numberOfLines={isCompact ? 2 : 1}>
                        {spell.name}
                      </Text>
                      <Text style={[styles.meta, { color: theme.subtitle }]}>
                        {spell.reducible ? "Don reductible" : "Don a cout fixe"}
                      </Text>
                    </View>
                    <View style={styles.badges}>
                      {isActive ? (
                        <Text
                          style={[
                            styles.activeBadge,
                            {
                              color: theme.buttonText,
                              backgroundColor: theme.accent,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          Actif
                        </Text>
                      ) : null}
                      <Text style={[styles.costBadge, reduced ? styles.costBadgeReduced : null]}>
                        {computedCost} PSY
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.description, { color: theme.title }]}>
                    {spell.description}
                  </Text>
                  {spell.augmentable ? (
                    <Text style={[styles.effect, { color: theme.subtitle }]}>
                      Injection de PSY supplementaire possible selon la reserve disponible.
                    </Text>
                  ) : null}
                  {spell.tags.length ? (
                    <View style={styles.assetTags}>
                      {spell.tags.map((tag) => (
                        <View
                          key={`${spell.id}-${tag}`}
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
                  {spell.activeEffects.map((effect) => (
                    <Text key={effect.id} style={[styles.effect, { color: theme.subtitle }]}>
                      Actif · {effect.label} · {effect.description}
                    </Text>
                  ))}
                  {spell.passiveEffects.map((effect) => (
                    <Text key={effect.id} style={[styles.effect, { color: theme.subtitle }]}>
                      Passif · {effect.label} · {effect.description}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: theme.subtitle }]}>Aucun don renseigne.</Text>
        )}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  cardCompact: {
    flexDirection: "column",
  },
  body: { flex: 1, gap: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  heading: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: "800" },
  meta: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  badges: { alignItems: "flex-end", gap: 8 },
  costBadge: {
    color: "#082f49",
    backgroundColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  costBadgeReduced: { color: "#3f2200", backgroundColor: "#fbbf24" },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
    borderWidth: 1,
  },
  description: { lineHeight: 21 },
  effect: { lineHeight: 20 },
  assetTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  assetTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  assetTagLabel: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#7d8eab" },
});
