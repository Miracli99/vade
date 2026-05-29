import { ReactNode } from "react";
import { Text, View } from "react-native";

import { Character } from "../../types/game";
import { CharacterSheetTheme } from "../../components/character-sheet/theme";
import { EquipmentSection } from "./equipment";
import { InventorySection } from "./inventory";
import { ResourcesSection } from "./ressource";
import { SpellsSection } from "./don";
import { StatsSkillsSection } from "./stats";
import { StatusSections } from "./affinity";
import { styles } from "./styles";

type CharacterPanelsProps = {
  character: Character;
  isSplitLayout: boolean;
  quickActions: ReactNode;
  theme: CharacterSheetTheme;
  onAdjustAttackBonus: (delta: number) => void;
  onAdjustResource: (resourceKey: "pv" | "psy" | "armor", delta: number) => void;
  onAdjustResourceBonus: (resourceKey: "pv" | "psy" | "armor", delta: number) => void;
  onEditEquipment: () => void;
  onEditInventory: () => void;
  onEditResistances: () => void;
  onEditResources: () => void;
  onEditSkills: () => void;
  onEditSpells: () => void;
  onEditStats: () => void;
  onToggleSpellActive: (spellId: string) => void;
};

export function CharacterPanels({
  character,
  isSplitLayout,
  quickActions,
  theme,
  onAdjustAttackBonus,
  onAdjustResource,
  onAdjustResourceBonus,
  onEditEquipment,
  onEditInventory,
  onEditResistances,
  onEditResources,
  onEditSkills,
  onEditSpells,
  onEditStats,
  onToggleSpellActive,
}: CharacterPanelsProps) {
  const resources = (
    <ResourcesSection
      character={character}
      theme={theme}
      onEdit={onEditResources}
      onAdjustResource={onAdjustResource}
      onAdjustResourceBonus={onAdjustResourceBonus}
      onAdjustAttackBonus={onAdjustAttackBonus}
    />
  );
  const stats = (
    <StatsSkillsSection
      character={character}
      theme={theme}
      onEditStats={onEditStats}
      onEditSkills={onEditSkills}
    />
  );
  const status = (
    <StatusSections
      character={character}
      theme={theme}
      onEditResistances={onEditResistances}
    />
  );
  const inventory = (
    <InventorySection character={character} theme={theme} onEdit={onEditInventory} />
  );
  const spells = (
    <SpellsSection
      character={character}
      theme={theme}
      onEdit={onEditSpells}
      onToggleSpellActive={onToggleSpellActive}
    />
  );
  const equipment = (
    <EquipmentSection character={character} theme={theme} onEdit={onEditEquipment} />
  );

  if (!isSplitLayout) {
    return (
      <>
        {resources}
        {quickActions}
        {stats}
        {status}
        {inventory}
        {spells}
        {equipment}
      </>
    );
  }

  return (
    <>
      <View style={styles.sheetZoneHeader}>
        <Text style={[styles.sheetZoneTitle, { color: theme.title }]}>Table de jeu</Text>
        <Text style={[styles.sheetZoneSubtitle, { color: theme.subtitle }]}>
          Ressources, actions rapides et lecture immediate du personnage.
        </Text>
      </View>
      <View style={styles.tacticalGrid}>
        <View style={styles.tacticalColumnWide}>
          {resources}
          {stats}
        </View>
        <View style={styles.tacticalColumn}>
          {quickActions}
          {status}
        </View>
      </View>
      <View style={styles.sheetZoneHeader}>
        <Text style={[styles.sheetZoneTitle, { color: theme.title }]}>Arsenal</Text>
        <Text style={[styles.sheetZoneSubtitle, { color: theme.subtitle }]}>
          Objets, dons et equipements disponibles pendant la session.
        </Text>
      </View>
      <View style={styles.arsenalGrid}>
        <View style={styles.arsenalColumn}>
          {inventory}
          {equipment}
        </View>
        <View style={styles.arsenalColumnWide}>{spells}</View>
      </View>
    </>
  );
}
