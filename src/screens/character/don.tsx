import { Pressable, Text, TextInput, View } from "react-native";

import { AssetVisual } from "../../components/character-sheet/AssetVisual";
import { EditorField, TagEditorField } from "../../components/character-sheet/EditorField";
import { Character, Spell } from "../../types/game";
import { EditorCollapsibleCard } from "./EditorCollapsibleCard";
import { CharacterThemePreset } from "./presets";
import { styles } from "./styles";
import { ImageLibraryTarget } from "./types";

export { SpellsSection as CharacterDon } from "../../components/character-sheet/SpellsSection";
export { SpellsSection } from "../../components/character-sheet/SpellsSection";

function compactText(value: string | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function formatEditorTags(tags: string[] = []) {
  if (!tags.length) {
    return "";
  }

  return tags.slice(0, 3).join(", ") + (tags.length > 3 ? "..." : "");
}

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
  getEditorCardId: (kind: string, id: string) => string;
  isEditorCardExpanded: (cardId: string) => boolean;
  onAddDraftSpell: () => void;
  onRemoveDraftSpell: (index: number) => void;
  onSetImageLibraryTarget: (target: ImageLibraryTarget) => void;
  onToggleEditorCard: (cardId: string) => void;
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
  getEditorCardId,
  isEditorCardExpanded,
  onAddDraftSpell,
  onRemoveDraftSpell,
  onSetImageLibraryTarget,
  onToggleEditorCard,
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
        {draftCharacter.spells.map((spell, index) => {
          const cardId = getEditorCardId("spell", spell.id);
          const expanded = isEditorCardExpanded(cardId);
          const tags = formatEditorTags(spell.tags);

          return (
          <EditorCollapsibleCard
            key={spell.id}
            title={compactText(spell.name, "Don sans nom")}
            subtitle={[
              `${spell.basePsyCost} PSY`,
              spell.armorBonus ? `Armure +${spell.armorBonus}` : null,
              spell.damageBonus ? `Degats +${spell.damageBonus}` : null,
              tags,
            ]
              .filter(Boolean)
              .join(" · ")}
            expanded={expanded}
            cardStyle={editorCardStyle}
            titleStyle={editorCardTitleStyle}
            removeButtonStyle={getEditorRemoveButtonStyle()}
            removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
            onRemove={() => onRemoveDraftSpell(index)}
            onToggle={() => onToggleEditorCard(cardId)}
          >
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
          </EditorCollapsibleCard>
          );
        })}
      </View>
    </View>
  );
}
