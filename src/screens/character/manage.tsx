import { Pressable, StyleSheet, Text, View } from "react-native";

import { Character } from "../../types/game";
import { CharacterThemePreset } from "./presets";
import { EditorSection } from "./types";

export type CharacterMode = "play" | "manage";

export function CharacterModeSwitcher({
  mode,
  theme,
  onChange,
}: {
  mode: CharacterMode;
  theme: CharacterThemePreset;
  onChange: (mode: CharacterMode) => void;
}) {
  return (
    <View style={[styles.modeSwitch, { borderColor: theme.border, backgroundColor: theme.panelBg }]}> 
      {(["play", "manage"] as const).map((value) => {
        const active = value === mode;
        const label = value === "play" ? "Jouer" : "Gérer";
        return (
          <Pressable
            key={value}
            onPress={() => onChange(value)}
            style={[styles.modeButton, active ? { backgroundColor: theme.buttonBg } : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${label} avec ce personnage`}
          >
            <Text style={[styles.modeLabel, { color: active ? theme.buttonText : theme.title }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CharacterManageHub({
  character,
  theme,
  onOpenSection,
}: {
  character: Character;
  theme: CharacterThemePreset;
  onOpenSection: (section: EditorSection) => void;
}) {
  const sections: Array<{ id: EditorSection; title: string; description: string; count?: number }> = [
    { id: "identity", title: "Identité et apparence", description: "Nom, archétype, spécialisation, thème, bio et portrait." },
    { id: "resources", title: "Ressources", description: "PV, PSY, armure et bonus d'attaque." },
    { id: "stats", title: "Statistiques", description: "Physique, mentale et sociale." },
    { id: "skills", title: "Compétences", description: "Valeurs et notes de compétences.", count: character.skills.length },
    { id: "spells", title: "Dons", description: "Coûts, effets et visuels des dons.", count: character.spells.length },
    { id: "equipment", title: "Équipement", description: "Objets équipés et dons associés.", count: character.equipment.length },
    { id: "inventory", title: "Inventaire", description: "Objets transportés et quantités.", count: character.inventory.length },
    { id: "effects", title: "Effets", description: "États actifs, passifs et durées.", count: character.statusEffects.length },
    { id: "resistances", title: "Résistances", description: "Résistances, faiblesses et immunités.", count: character.resistances.length },
  ];

  return (
    <View style={[styles.manageSurface, { backgroundColor: theme.panelBg, borderColor: theme.border }]}> 
      <View style={styles.manageHeader}>
        <Text style={[styles.manageTitle, { color: theme.title }]}>Gérer la fiche</Text>
        <Text style={[styles.manageSubtitle, { color: theme.subtitle }]}>Chaque domaine peut être modifié indépendamment sans encombrer le mode Jeu.</Text>
      </View>
      <View style={styles.manageGrid}>
        {sections.map((section) => (
          <Pressable
            key={section.id}
            onPress={() => onOpenSection(section.id)}
            style={({ pressed }) => [
              styles.manageRow,
              { backgroundColor: theme.chipBg, borderColor: theme.border },
              pressed ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Modifier ${section.title}`}
          >
            <View style={styles.manageRowBody}>
              <Text style={[styles.manageRowTitle, { color: theme.title }]}>{section.title}</Text>
              <Text style={[styles.manageRowDescription, { color: theme.subtitle }]}>{section.description}</Text>
            </View>
            {section.count !== undefined ? <Text style={[styles.manageCount, { color: theme.accent, borderColor: theme.border }]}>{section.count}</Text> : null}
            <Text style={[styles.manageArrow, { color: theme.accent }]}>›</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => onOpenSection("all")} style={[styles.manageAllButton, { borderColor: theme.accent }]}> 
        <Text style={[styles.manageAllLabel, { color: theme.accent }]}>Modifier toute la fiche</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  modeSwitch: { flexDirection: "row", minHeight: 52, borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  modeButton: { flex: 1, minHeight: 50, alignItems: "center", justifyContent: "center" },
  modeLabel: { fontSize: 16, fontWeight: "900" },
  manageSurface: { padding: 20, gap: 20, borderWidth: 1, borderRadius: 14 },
  manageHeader: { gap: 5 },
  manageTitle: { fontSize: 23, fontWeight: "900" },
  manageSubtitle: { fontSize: 14, lineHeight: 21, maxWidth: 720 },
  manageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  manageRow: { flexGrow: 1, flexBasis: 310, minHeight: 88, flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderWidth: 1, borderRadius: 10 },
  manageRowBody: { flex: 1, gap: 5 },
  manageRowTitle: { fontSize: 16, fontWeight: "900" },
  manageRowDescription: { fontSize: 13, lineHeight: 19 },
  manageCount: { minWidth: 32, height: 32, textAlign: "center", textAlignVertical: "center", borderWidth: 1, borderRadius: 16, overflow: "hidden", fontWeight: "900", lineHeight: 30 },
  manageArrow: { fontSize: 28, lineHeight: 30 },
  manageAllButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 10 },
  manageAllLabel: { fontSize: 14, fontWeight: "900" },
  pressed: { opacity: 0.76 },
});
