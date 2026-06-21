import { StyleSheet, Text, View } from "react-native";

import { Character, ResistanceType, StatusEffect } from "../../types/game";
import { Section } from "../Section";
import { MasonryList } from "./MasonryList";
import { SectionEditButton } from "./SectionEditButton";
import { CharacterSheetTheme } from "./theme";

const RESISTANCE_LABELS: Record<ResistanceType, string> = {
  resistance: "Resistance",
  faiblesse: "Faiblesse",
  immunite: "Immunite",
};

type StatusSectionsProps = {
  character: Character;
  theme: CharacterSheetTheme;
  onEditEffects: () => void;
  onEditResistances: () => void;
};

export function StatusSections({
  character,
  theme,
  onEditEffects,
  onEditResistances,
}: StatusSectionsProps) {
  const activeEffects = character.statusEffects.filter((effect) => effect.active);

  return (
    <View style={styles.sections}>
      <Section
        title="Buffs / Debuffs"
        subtitle="Effets actifs avec bonus de stats pris en compte."
        theme={{
          sectionBg: theme.panelBg,
          sectionBorder: theme.border,
          title: theme.title,
          subtitle: theme.subtitle,
          cardBackgroundImage: theme.cardBackgroundImage,
        }}
        rightSlot={
          <SectionEditButton
            theme={theme}
            onPress={onEditEffects}
            accessibilityLabel="Modifier les buffs et debuffs"
          />
        }
      >
        <View style={styles.resistanceList}>
          {character.statusEffects.length ? (
            <MasonryList
              items={character.statusEffects}
              minColumnWidth={280}
              maxColumns={2}
              getKey={(effect) => effect.id}
              renderItem={(effect) => (
                <View
                  style={[
                    styles.resistanceCard,
                    !effect.active ? styles.inactiveCard : null,
                    { backgroundColor: theme.chipBg, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.resistanceHeader}>
                    <Text style={[styles.resistanceLabel, { color: theme.title }]}>
                      {effect.name}
                    </Text>
                    <View
                      style={[
                        styles.resistanceBadge,
                        {
                          backgroundColor: effect.active ? theme.accent : theme.panelBg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.resistanceBadgeLabel,
                          { color: effect.active ? theme.pageBg : theme.title },
                        ]}
                      >
                        {getEffectCategoryLabel(effect)}
                      </Text>
                    </View>
                  </View>
                  {effect.description ? (
                    <Text style={[styles.description, { color: theme.subtitle }]}>
                      {effect.description}
                    </Text>
                  ) : null}
                  <EffectBonusList effect={effect} theme={theme} />
                  {effect.source || effect.durationTurns !== null ? (
                    <Text style={[styles.effectMeta, { color: theme.subtitle }]}>
                      {[
                        effect.source ? `Source: ${effect.source}` : null,
                        effect.durationTurns !== null ? `${effect.durationTurns} tour(s)` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  ) : null}
                </View>
              )}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.subtitle }]}>
              Aucun buff ou debuff renseigne.
            </Text>
          )}
          {character.statusEffects.length && !activeEffects.length ? (
            <Text style={[styles.emptyText, { color: theme.subtitle }]}>
              Tous les effets sont inactifs.
            </Text>
          ) : null}
        </View>
      </Section>

      <Section
        title="Affinites"
        subtitle="Resistances, faiblesses et immunites connues."
        theme={{
          sectionBg: theme.panelBg,
          sectionBorder: theme.border,
          title: theme.title,
          subtitle: theme.subtitle,
          cardBackgroundImage: theme.cardBackgroundImage,
        }}
        rightSlot={<SectionEditButton theme={theme} onPress={onEditResistances} accessibilityLabel="Modifier les affinites" />}
      >
        <View style={styles.resistanceList}>
          {character.resistances.length ? (
            <MasonryList
              items={character.resistances}
              minColumnWidth={280}
              maxColumns={2}
              getKey={(entry) => entry.id}
              renderItem={(entry) => (
              <View
                style={[
                  styles.resistanceCard,
                  { backgroundColor: theme.chipBg, borderColor: theme.border },
                ]}
              >
                <View style={styles.resistanceHeader}>
                  <Text style={[styles.resistanceLabel, { color: theme.title }]}>
                    {entry.label}
                  </Text>
                  <View
                    style={[
                      styles.resistanceBadge,
                      {
                        backgroundColor:
                          entry.type === "immunite" ? theme.accent : theme.panelBg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.resistanceBadgeLabel,
                        {
                          color: entry.type === "immunite" ? theme.pageBg : theme.title,
                        },
                      ]}
                    >
                      {RESISTANCE_LABELS[entry.type]}
                    </Text>
                  </View>
                </View>
                {entry.notes ? (
                  <Text style={[styles.description, { color: theme.subtitle }]}>{entry.notes}</Text>
                ) : null}
              </View>
            )}
            />
          ) : (
            <Text style={[styles.emptyText, { color: theme.subtitle }]}>
              Aucune affinite renseignee.
            </Text>
          )}
        </View>
      </Section>
    </View>
  );
}

function getEffectCategoryLabel(effect: StatusEffect) {
  if (!effect.active) {
    return "Inactif";
  }

  switch (effect.category) {
    case "buff":
      return "Buff";
    case "debuff":
      return "Debuff";
    default:
      return "Effet";
  }
}

function EffectBonusList({
  effect,
  theme,
}: {
  effect: StatusEffect;
  theme: CharacterSheetTheme;
}) {
  const bonuses = [
    ["Attaque", effect.bonuses?.attackBonus ?? 0],
    ["Armure", effect.bonuses?.armorBonus ?? 0],
    ["PV", effect.bonuses?.pvBonus ?? 0],
    ["Bouclier", effect.bonuses?.shieldBonus ?? 0],
  ].filter(([, value]) => value !== 0) as Array<[string, number]>;

  if (!bonuses.length) {
    return null;
  }

  return (
    <View style={styles.bonusRow}>
      {bonuses.map(([label, value]) => (
        <View
          key={label}
          style={[styles.bonusBadge, { backgroundColor: theme.panelBg, borderColor: theme.border }]}
        >
          <Text style={[styles.bonusBadgeText, { color: theme.title }]}>
            {label} {value > 0 ? "+" : ""}{value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 18 },
  resistanceList: { gap: 12 },
  resistanceCard: { gap: 8, padding: 14, borderRadius: 18, borderWidth: 1 },
  inactiveCard: { opacity: 0.62 },
  resistanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  resistanceLabel: { fontWeight: "800", fontSize: 15, flex: 1 },
  description: { lineHeight: 20 },
  effectMeta: { fontSize: 12, fontWeight: "700" },
  bonusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bonusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  bonusBadgeText: { fontSize: 12, fontWeight: "800" },
  resistanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  resistanceBadgeLabel: { fontWeight: "800", fontSize: 12 },
  emptyText: { color: "#7d8eab" },
});
