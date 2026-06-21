import { Pressable, Text, View } from "react-native";

import { AssetVisual } from "../../components/character-sheet/AssetVisual";
import { CharacterSheetBackdrop } from "../../components/character-sheet/CharacterSheetBackdrop";
import { Character } from "../../types/game";
import { CharacterThemePreset } from "./presets";
import { styles } from "./styles";

type CharacterResumeProps = {
  character: Character;
  characterBioPreview: string;
  isPhone: boolean;
  theme: CharacterThemePreset;
  useWideHero: boolean;
  onEditIdentity: () => void;
  onToggleBio: () => void;
};

export function CharacterResume({
  character,
  characterBioPreview,
  isPhone,
  theme,
  useWideHero,
  onEditIdentity,
  onToggleBio,
}: CharacterResumeProps) {
  return (
    <View
      style={[
        styles.hero,
        useWideHero ? styles.heroTablet : styles.heroMobile,
        { backgroundColor: theme.panelBg, borderColor: theme.border },
      ]}
    >
      <View pointerEvents="none" style={[styles.heroAccentBar, { backgroundColor: theme.accent }]} />
      <View style={[styles.heroVisualCard, isPhone ? styles.heroVisualCardPhone : null]}>
        <AssetVisual
          label={character.name}
          imageUrl={character.imageUrl}
          imageModule={character.imageModule}
          icon={character.name.slice(0, 1)}
          character
          large
        />
      </View>

      <View style={styles.heroText}>
        <View style={styles.heroKickerRow}>
          <Text style={[styles.heroKicker, { color: theme.accent }]}>Fiche active</Text>
          <View style={[styles.heroSignal, { backgroundColor: theme.accent }]} />
        </View>
        <View style={[styles.heroTopRow, isPhone ? styles.heroTopRowPhone : null]}>
          <View style={styles.heroIdentity}>
            <Text style={[styles.title, isPhone ? styles.titlePhone : null, { color: theme.title }]}>
              {character.name}
            </Text>
            <Text style={[styles.description, styles.heroDescription, { color: theme.subtitle }]}>
              {character.archetype}
              {character.specialization ? ` · ${character.specialization}` : ""}
            </Text>
          </View>
          <Pressable
            onPress={onEditIdentity}
            style={[
              styles.heroEditButton,
              { backgroundColor: theme.chipBg, borderColor: theme.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Modifier l'identite du personnage"
          >
            <Text style={[styles.heroEditButtonLabel, { color: theme.title }]}>Modifier</Text>
          </Pressable>
        </View>

        <View style={styles.heroChipRow}>
          <View style={[styles.heroChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Text style={[styles.heroChipLabel, { color: theme.title }]}>Rang {character.rank ?? "5"}</Text>
          </View>
          <View style={[styles.heroChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Text style={[styles.heroChipLabel, { color: theme.title }]}>Niveau {character.level ?? 0}</Text>
          </View>
          <View style={[styles.heroChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Text style={[styles.heroChipLabel, { color: theme.title }]}>{character.spells.length} dons</Text>
          </View>
          <View style={[styles.heroChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Text style={[styles.heroChipLabel, { color: theme.title }]}>{character.inventory.length} objets</Text>
          </View>
        </View>

        {characterBioPreview ? (
          <Text style={[styles.heroBioPreview, { color: theme.subtitle }]} numberOfLines={isPhone ? 4 : 3}>
            {characterBioPreview}
          </Text>
        ) : null}

        <View style={styles.heroActionRow}>
          <Pressable
            onPress={onToggleBio}
            style={[styles.heroBioButton, { backgroundColor: theme.chipBg, borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel={character.bio ? "Afficher la bio du personnage" : "Ajouter une bio au personnage"}
          >
            <Text style={[styles.heroBioButtonLabel, { color: theme.title }]}>
              {character.bio ? "Bio complete" : "Ajouter une bio"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export { AssetVisual as CharacterResumeVisual, CharacterSheetBackdrop };
