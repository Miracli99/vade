import { StyleSheet, Text, View } from "react-native";

import { CharacterSheetTheme } from "../../components/character-sheet/theme";
import { modernRadii } from "../../components/ui/design";
import { Character } from "../../types/game";
import { normalizeRollPoints } from "./rollPoints";

const counters = [
  { key: "advantagePoints", label: "Avantage" },
  { key: "disadvantagePoints", label: "Désavantage" },
] as const;

export function RollPointCounters({ character, theme }: {
  character: Character;
  theme: CharacterSheetTheme;
}) {
  return (
    <View style={[styles.section, { borderColor: theme.border }]}>
      <Text style={{ color: theme.subtitle }}>Points disponibles pour les relances</Text>
      <View style={styles.grid}>
        {counters.map(({ key, label }) => {
          const value = normalizeRollPoints(character[key]);
          return (
            <View key={key} style={[styles.card, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
              <Text style={[styles.label, { color: theme.title }]}>{label}</Text>
              <Text accessibilityLabel={`${label} : ${value} points`}
                style={[styles.value, { color: theme.accent }]}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { flexGrow: 1, flexBasis: 200, borderWidth: 1, borderRadius: modernRadii.lg, padding: 12, gap: 10 },
  label: { fontSize: 15, fontWeight: "700" },
  value: { textAlign: "center", fontSize: 24, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
