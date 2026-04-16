import { StyleSheet, Text, View } from "react-native";

import { Character, ResistanceType } from "../../types/game";
import { Section } from "../Section";
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
  onEditResistances: () => void;
};

export function StatusSections({
  character,
  theme,
  onEditResistances,
}: StatusSectionsProps) {
  return (
    <Section
      title="Affinites"
      subtitle="Resistances, faiblesses et immunites connues."
      theme={{
        sectionBg: theme.panelBg,
        sectionBorder: theme.border,
        title: theme.title,
        subtitle: theme.subtitle,
      }}
      rightSlot={<SectionEditButton theme={theme} onPress={onEditResistances} />}
    >
      <View style={styles.resistanceList}>
        {character.resistances.length ? (
          character.resistances.map((entry) => (
            <View
              key={entry.id}
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
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.subtitle }]}>
            Aucune affinite renseignee.
          </Text>
        )}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  resistanceList: { gap: 12 },
  resistanceCard: { gap: 8, padding: 14, borderRadius: 18, borderWidth: 1 },
  resistanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  resistanceLabel: { fontWeight: "800", fontSize: 15, flex: 1 },
  description: { lineHeight: 20 },
  resistanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  resistanceBadgeLabel: { fontWeight: "800", fontSize: 12 },
  emptyText: { color: "#7d8eab" },
});
