import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Character } from "../../types/game";
import { Section } from "../Section";
import { SectionEditButton } from "./SectionEditButton";
import { CharacterSheetTheme } from "./theme";

const STAT_ICONS: Record<keyof Character["stats"], string> = {
  physique: "⚔",
  mentale: "✦",
  sociale: "☉",
};

type StatsSkillsSectionProps = {
  character: Character;
  theme: CharacterSheetTheme;
  onEditStats: () => void;
  onEditSkills: () => void;
};

export function StatsSkillsSection({
  character,
  theme,
  onEditStats,
  onEditSkills,
}: StatsSkillsSectionProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 720;

  return (
    <View style={styles.dualColumns}>
      <View style={[styles.dualColumn, isCompact ? styles.dualColumnCompact : null]}>
        <View style={styles.equalHeightCard}>
          <Section
            title="Stats"
            subtitle="Valeurs de base en pourcentage."
            theme={{
              sectionBg: theme.panelBg,
              sectionBorder: theme.border,
              title: theme.title,
              subtitle: theme.subtitle,
            }}
            rightSlot={<SectionEditButton theme={theme} onPress={onEditStats} />}
          >
            <View style={styles.statsGrid}>
              {Object.entries(character.stats).map(([key, value]) => (
                <View
                  key={key}
                  style={[
                    styles.statCard,
                    { backgroundColor: theme.chipBg, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.statHeader}>
                    <View style={styles.statIconWrap}>
                      <Text style={[styles.statIcon, { color: theme.accent }]}>
                        {STAT_ICONS[key as keyof Character["stats"]]}
                      </Text>
                    </View>
                    <Text style={[styles.statLabel, { color: theme.subtitle }]}>{key}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: theme.title }]}>{value}%</Text>
                </View>
              ))}
            </View>
          </Section>
        </View>
      </View>
      <View style={[styles.dualColumn, isCompact ? styles.dualColumnCompact : null]}>
        <View style={styles.equalHeightCard}>
          <Section
            title="Competences"
            subtitle="Bonus appliques aux actions specialisees."
            theme={{
              sectionBg: theme.panelBg,
              sectionBorder: theme.border,
              title: theme.title,
              subtitle: theme.subtitle,
            }}
            rightSlot={<SectionEditButton theme={theme} onPress={onEditSkills} />}
          >
            <View style={styles.table}>
              {!isCompact ? (
                <View style={[styles.tableHeader, { backgroundColor: theme.chipBg }]}>
                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.tableNameColumn,
                      { color: theme.subtitle },
                    ]}
                  >
                    Competence
                  </Text>
                  <Text style={[styles.tableHeaderText, { color: theme.subtitle }]}>Bonus</Text>
                </View>
              ) : null}
              {character.skills.map((skill) => (
                <View
                  key={skill.id}
                  style={[
                    styles.tableRow,
                    isCompact ? styles.tableRowCompact : null,
                    { backgroundColor: theme.chipBg, borderTopColor: theme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableNameColumn,
                      isCompact ? styles.tableCellCompact : null,
                      { color: theme.title },
                    ]}
                    numberOfLines={isCompact ? 2 : 1}
                  >
                    {skill.name}
                  </Text>
                  <Text
                    style={[
                      styles.tableBonus,
                      isCompact ? styles.tableBonusCompact : null,
                      { color: theme.accent },
                    ]}
                  >
                    +{skill.value}%
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dualColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  dualColumn: {
    flexGrow: 1,
    flexBasis: 320,
    alignSelf: "stretch",
  },
  dualColumnCompact: {
    flexBasis: "100%",
  },
  equalHeightCard: { flex: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flexGrow: 1,
    flexBasis: 140,
    gap: 6,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17223c",
  },
  statIcon: { fontSize: 15, fontWeight: "800" },
  statLabel: { textTransform: "capitalize" },
  statValue: { fontSize: 22, fontWeight: "900", textAlign: "center", width: "100%" },
  table: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  tableHeader: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 12 },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  tableRowCompact: {
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 6,
  },
  tableNameColumn: { flex: 1 },
  tableCell: { color: "#f8fafc" },
  tableCellCompact: {
    minWidth: "100%",
  },
  tableBonus: { fontWeight: "900" },
  tableBonusCompact: {
    alignSelf: "flex-start",
  },
});
