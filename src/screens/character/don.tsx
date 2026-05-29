import { Pressable, Text, TextInput, View } from "react-native";

import { AssetVisual } from "../../components/character-sheet/AssetVisual";
import { EditorField, TagEditorField } from "../../components/character-sheet/EditorField";
import { Character, Spell } from "../../types/game";
import { CharacterThemePreset } from "./presets";
import { styles } from "./styles";
import { ImageLibraryTarget } from "./types";

export { SpellsSection as CharacterDon } from "../../components/character-sheet/SpellsSection";
export { SpellsSection } from "../../components/character-sheet/SpellsSection";

type DonEditorSectionProps = {
  draftCharacter: Character;
  editorAddButtonLabelStyle: object;
  editorAddButtonStyle: object;
  editorCardStyle: object;
  editorCardTitleStyle: object;
  editorInlineLabelStyle: object;
  editorSectionTitleStyle: object;
  editorUploadButtonLabelStyle: object;
  editorUploadButtonStyle: object;
  getEditorRemoveButtonLabelStyle: () => object;
  getEditorRemoveButtonStyle: () => object;
  getEditorToggleButtonLabelStyle: (isActive: boolean) => object;
  getEditorToggleButtonStyle: (isActive: boolean) => object;
  onAddDraftSpell: () => void;
  onRemoveDraftSpell: (index: number) => void;
  onSetImageLibraryTarget: (target: ImageLibraryTarget) => void;
  onUpdateDraftSpell: (index: number, patch: Partial<Spell>) => void;
  theme: CharacterThemePreset;
};

export function DonEditorSection({
  draftCharacter,
  editorAddButtonLabelStyle,
  editorAddButtonStyle,
  editorCardStyle,
  editorCardTitleStyle,
  editorInlineLabelStyle,
  editorSectionTitleStyle,
  editorUploadButtonLabelStyle,
  editorUploadButtonStyle,
  getEditorRemoveButtonLabelStyle,
  getEditorRemoveButtonStyle,
  getEditorToggleButtonLabelStyle,
  getEditorToggleButtonStyle,
  onAddDraftSpell,
  onRemoveDraftSpell,
  onSetImageLibraryTarget,
  onUpdateDraftSpell,
  theme,
}: DonEditorSectionProps) {
  return (
    <View style={styles.editorGroup}>
      <View style={styles.editorGroupHeader}>
        <Text style={editorSectionTitleStyle}>Dons</Text>
        <Pressable onPress={onAddDraftSpell} style={editorAddButtonStyle}>
          <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
        </Pressable>
      </View>
      <View style={styles.editorList}>
        {draftCharacter.spells.map((spell, index) => (
          <View key={spell.id} style={editorCardStyle}>
            <View style={styles.editorCardHeader}>
              <Text style={editorCardTitleStyle}>Don</Text>
              <Pressable onPress={() => onRemoveDraftSpell(index)} style={getEditorRemoveButtonStyle()}>
                <Text style={getEditorRemoveButtonLabelStyle()}>Supprimer</Text>
              </Pressable>
            </View>
            <View style={styles.editorGrid}>
              <EditorField
                label="Nom"
                value={spell.name}
                onChangeText={(value) => onUpdateDraftSpell(index, { name: value })}
              />
              <TagEditorField
                tags={spell.tags}
                onChangeTags={(tags) => onUpdateDraftSpell(index, { tags })}
              />
              <EditorField
                label="Cout PSY"
                value={String(spell.basePsyCost)}
                keyboardType="numeric"
                onChangeText={(value) =>
                  onUpdateDraftSpell(index, {
                    basePsyCost: Math.max(0, Number.parseInt(value || "0", 10) || 0),
                  })
                }
              />
              <EditorField
                label="Bonus d'armure (actif)"
                value={String(spell.armorBonus ?? 0)}
                keyboardType="numeric"
                onChangeText={(value) =>
                  onUpdateDraftSpell(index, {
                    armorBonus: Math.max(0, Number.parseInt(value || "0", 10) || 0),
                  })
                }
              />
              <EditorField
                label="Bonus de degats (actif)"
                value={String(spell.damageBonus ?? 0)}
                keyboardType="numeric"
                onChangeText={(value) =>
                  onUpdateDraftSpell(index, {
                    damageBonus: Math.max(0, Number.parseInt(value || "0", 10) || 0),
                  })
                }
              />
            </View>
            <View style={styles.editorMediaRow}>
              <AssetVisual
                label={spell.name}
                icon={spell.icon}
                imageUrl={spell.imageUrl}
                imageModule={spell.imageModule}
              />
              <Pressable
                onPress={() => onSetImageLibraryTarget({ kind: "spell", index })}
                style={editorUploadButtonStyle}
              >
                <Text style={editorUploadButtonLabelStyle}>Choisir une image</Text>
              </Pressable>
            </View>
            <View style={styles.editorToggleRow}>
              <Text style={editorInlineLabelStyle}>Reducible en Focus</Text>
              <Pressable
                onPress={() => onUpdateDraftSpell(index, { reducible: !spell.reducible })}
                style={getEditorToggleButtonStyle(spell.reducible)}
              >
                <Text style={getEditorToggleButtonLabelStyle(spell.reducible)}>
                  {spell.reducible ? "Oui" : "Non"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.editorToggleRow}>
              <Text style={editorInlineLabelStyle}>Augmentable</Text>
              <Pressable
                onPress={() =>
                  onUpdateDraftSpell(index, { augmentable: !(spell.augmentable ?? false) })
                }
                style={getEditorToggleButtonStyle(Boolean(spell.augmentable))}
              >
                <Text style={getEditorToggleButtonLabelStyle(Boolean(spell.augmentable))}>
                  {spell.augmentable ? "Oui" : "Non"}
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={spell.description}
              onChangeText={(value) => onUpdateDraftSpell(index, { description: value })}
              style={[
                styles.editorInput,
                styles.editorTextArea,
                {
                  backgroundColor: theme.chipBg,
                  borderColor: theme.border,
                  color: theme.title,
                },
              ]}
              multiline
              placeholder="Description du don"
              placeholderTextColor={theme.subtitle}
            />
            <Text style={[styles.editorHint, { color: theme.subtitle, marginTop: 0 }]}>
              Si un don est augmentable, l'action rapide permettra d'injecter du PSY
              supplementaire selon la reserve restante du personnage.
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
