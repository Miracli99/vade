import { Pressable, StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";

import { EditorField, TagEditorField } from "../../components/character-sheet/EditorField";
import { ResistanceProfile, ResistanceType, Skill, StatusEffect } from "../../types/game";
import { EditorCollapsibleCard } from "./EditorCollapsibleCard";
import {
  compactText,
  getStatusEffectKindLabel,
  getStatusEffectSummary,
} from "./editorHelpers";
import { CharacterThemePreset, RESISTANCE_LABELS } from "./presets";
import { styles } from "./styles";

type StatusEffectBonusKey = keyof NonNullable<StatusEffect["bonuses"]>;

type SharedEditorSectionProps = {
  editorAddButtonLabelStyle: StyleProp<TextStyle>;
  editorAddButtonStyle: StyleProp<ViewStyle>;
  editorCardStyle: StyleProp<ViewStyle>;
  editorCardTitleStyle: StyleProp<TextStyle>;
  editorSectionTitleStyle: StyleProp<TextStyle>;
  getEditorCardId: (kind: string, id: string) => string;
  getEditorRemoveButtonLabelStyle: () => StyleProp<TextStyle>;
  getEditorRemoveButtonStyle: () => StyleProp<ViewStyle>;
  isEditorCardExpanded: (cardId: string) => boolean;
  onToggleEditorCard: (cardId: string) => void;
  theme: CharacterThemePreset;
};

type StatusEffectsEditorSectionProps = SharedEditorSectionProps & {
  editorHintStyle: StyleProp<TextStyle>;
  editorInlineLabelStyle: StyleProp<TextStyle>;
  getEditorToggleButtonLabelStyle: (isActive: boolean) => StyleProp<TextStyle>;
  getEditorToggleButtonStyle: (isActive: boolean) => StyleProp<ViewStyle>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<StatusEffect>) => void;
  onUpdateBonus: (index: number, key: StatusEffectBonusKey, value: string) => void;
  statusEffects: StatusEffect[];
};

type ResistancesEditorSectionProps = SharedEditorSectionProps & {
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<ResistanceProfile>) => void;
  resistances: ResistanceProfile[];
};

type SkillsEditorSectionProps = SharedEditorSectionProps & {
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<Skill>) => void;
  skills: Skill[];
};

export function StatusEffectsEditorSection({
  editorAddButtonLabelStyle,
  editorAddButtonStyle,
  editorCardStyle,
  editorCardTitleStyle,
  editorHintStyle,
  editorInlineLabelStyle,
  editorSectionTitleStyle,
  getEditorCardId,
  getEditorRemoveButtonLabelStyle,
  getEditorRemoveButtonStyle,
  getEditorToggleButtonLabelStyle,
  getEditorToggleButtonStyle,
  isEditorCardExpanded,
  onAdd,
  onRemove,
  onToggleEditorCard,
  onUpdate,
  onUpdateBonus,
  statusEffects,
  theme,
}: StatusEffectsEditorSectionProps) {
  return (
    <View style={styles.editorGroup}>
      <View style={styles.editorGroupHeader}>
        <Text style={editorSectionTitleStyle}>Effets persistants</Text>
        <Pressable onPress={onAdd} style={editorAddButtonStyle}>
          <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
        </Pressable>
      </View>
      <View style={styles.editorList}>
        {statusEffects.map((effect, index) => {
          const cardId = getEditorCardId("effect", effect.id);
          const expanded = isEditorCardExpanded(cardId);

          return (
            <EditorCollapsibleCard
              key={effect.id}
              title={`${getStatusEffectKindLabel(effect)} · ${compactText(effect.name, "Sans nom")}`}
              subtitle={getStatusEffectSummary(effect)}
              expanded={expanded}
              cardStyle={editorCardStyle}
              titleStyle={editorCardTitleStyle}
              removeButtonStyle={getEditorRemoveButtonStyle()}
              removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
              onRemove={() => onRemove(index)}
              onToggle={() => onToggleEditorCard(cardId)}
            >
              <View style={styles.editorGrid}>
                <EditorField
                  label="Nom"
                  value={effect.name}
                  onChangeText={(value) => onUpdate(index, { name: value })}
                />
                <EditorField
                  label="Source"
                  value={effect.source ?? ""}
                  onChangeText={(value) => onUpdate(index, { source: value })}
                />
                <EditorField
                  label="Tours"
                  value={effect.durationTurns === null ? "" : String(effect.durationTurns)}
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    onUpdate(index, {
                      durationTurns: value.trim() === ""
                        ? null
                        : Math.max(0, Number.parseInt(value || "0", 10) || 0),
                    })
                  }
                />
                <TagEditorField
                  tags={effect.tags}
                  onChangeTags={(tags) => onUpdate(index, { tags })}
                />
              </View>
              <View style={styles.editorToggleRow}>
                <Text style={editorInlineLabelStyle}>Type</Text>
                <View style={styles.editorToggleGroup}>
                  {(["buff", "debuff", "neutral"] as const).map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => onUpdate(index, { category })}
                      style={getEditorToggleButtonStyle(
                        (effect.category ?? "neutral") === category,
                      )}
                    >
                      <Text
                        style={getEditorToggleButtonLabelStyle(
                          (effect.category ?? "neutral") === category,
                        )}
                      >
                        {category === "buff" ? "Buff" : category === "debuff" ? "Debuff" : "Effet"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.editorToggleRow}>
                <Text style={editorInlineLabelStyle}>Effet actif</Text>
                <Pressable
                  onPress={() => onUpdate(index, { active: !effect.active })}
                  style={getEditorToggleButtonStyle(effect.active)}
                >
                  <Text style={getEditorToggleButtonLabelStyle(effect.active)}>
                    {effect.active ? "Actif" : "Inactif"}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.editorResourceBlock}>
                <Text style={[styles.editorResourceTitle, { color: theme.accent }]}>
                  Bonus de stats
                </Text>
                <View style={styles.editorGrid}>
                  <EditorField
                    label="Attaque bonus"
                    value={String(effect.bonuses?.attackBonus ?? 0)}
                    onChangeText={(value) => onUpdateBonus(index, "attackBonus", value)}
                  />
                  <EditorField
                    label="Armure"
                    value={String(effect.bonuses?.armorBonus ?? 0)}
                    onChangeText={(value) => onUpdateBonus(index, "armorBonus", value)}
                  />
                  <EditorField
                    label="PV"
                    value={String(effect.bonuses?.pvBonus ?? 0)}
                    onChangeText={(value) => onUpdateBonus(index, "pvBonus", value)}
                  />
                  <EditorField
                    label="Bouclier"
                    value={String(effect.bonuses?.shieldBonus ?? 0)}
                    onChangeText={(value) => onUpdateBonus(index, "shieldBonus", value)}
                  />
                </View>
                <Text style={editorHintStyle}>
                  PV modifie le maximum; bouclier ajoute une protection active. Utilise des
                  valeurs negatives pour un debuff.
                </Text>
              </View>
              <TextInput
                value={effect.description}
                onChangeText={(value) => onUpdate(index, { description: value })}
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
                placeholder="Description de l'effet"
                placeholderTextColor={theme.subtitle}
              />
            </EditorCollapsibleCard>
          );
        })}
      </View>
    </View>
  );
}

export function ResistancesEditorSection({
  editorAddButtonLabelStyle,
  editorAddButtonStyle,
  editorCardStyle,
  editorCardTitleStyle,
  editorSectionTitleStyle,
  getEditorCardId,
  getEditorRemoveButtonLabelStyle,
  getEditorRemoveButtonStyle,
  isEditorCardExpanded,
  onAdd,
  onRemove,
  onToggleEditorCard,
  onUpdate,
  resistances,
  theme,
}: ResistancesEditorSectionProps) {
  return (
    <View style={styles.editorGroup}>
      <View style={styles.editorGroupHeader}>
        <Text style={editorSectionTitleStyle}>Affinites</Text>
        <Pressable onPress={onAdd} style={editorAddButtonStyle}>
          <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
        </Pressable>
      </View>
      <View style={styles.editorList}>
        {resistances.map((entry, index) => {
          const cardId = getEditorCardId("resistance", entry.id);
          const expanded = isEditorCardExpanded(cardId);

          return (
            <EditorCollapsibleCard
              key={entry.id}
              title={compactText(entry.label, "Affinite sans nom")}
              subtitle={[RESISTANCE_LABELS[entry.type], compactText(entry.notes, "")]
                .filter(Boolean)
                .join(" · ")}
              expanded={expanded}
              cardStyle={editorCardStyle}
              titleStyle={editorCardTitleStyle}
              removeButtonStyle={getEditorRemoveButtonStyle()}
              removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
              onRemove={() => onRemove(index)}
              onToggle={() => onToggleEditorCard(cardId)}
            >
              <View style={styles.editorGrid}>
                <EditorField
                  label="Libelle"
                  value={entry.label}
                  onChangeText={(value) => onUpdate(index, { label: value })}
                />
                <View style={styles.editorField}>
                  <Text style={[styles.editorFieldLabel, { color: theme.subtitle }]}>Type</Text>
                  <View style={styles.themePicker}>
                    {(Object.keys(RESISTANCE_LABELS) as ResistanceType[]).map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => onUpdate(index, { type })}
                        style={[
                          styles.themeOption,
                          {
                            backgroundColor:
                              entry.type === type ? theme.chipBg : "rgba(15, 23, 42, 0.78)",
                            borderColor: entry.type === type ? theme.accent : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.themeOptionLabel,
                            { color: entry.type === type ? theme.title : theme.subtitle },
                          ]}
                        >
                          {RESISTANCE_LABELS[type]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
              <TextInput
                value={entry.notes ?? ""}
                onChangeText={(value) => onUpdate(index, { notes: value })}
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
                placeholder="Notes sur l'affinite"
                placeholderTextColor={theme.subtitle}
              />
            </EditorCollapsibleCard>
          );
        })}
      </View>
    </View>
  );
}

export function SkillsEditorSection({
  editorAddButtonLabelStyle,
  editorAddButtonStyle,
  editorCardStyle,
  editorCardTitleStyle,
  editorSectionTitleStyle,
  getEditorCardId,
  getEditorRemoveButtonLabelStyle,
  getEditorRemoveButtonStyle,
  isEditorCardExpanded,
  onAdd,
  onRemove,
  onToggleEditorCard,
  onUpdate,
  skills,
}: SkillsEditorSectionProps) {
  return (
    <View style={styles.editorGroup}>
      <View style={styles.editorGroupHeader}>
        <Text style={editorSectionTitleStyle}>Competences</Text>
        <Pressable onPress={onAdd} style={editorAddButtonStyle}>
          <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
        </Pressable>
      </View>
      <View style={styles.editorList}>
        {skills.map((skill, index) => {
          const cardId = getEditorCardId("skill", skill.id);
          const expanded = isEditorCardExpanded(cardId);

          return (
            <EditorCollapsibleCard
              key={skill.id}
              title={compactText(skill.name, "Competence sans nom")}
              subtitle={`Bonus +${skill.value}%`}
              expanded={expanded}
              cardStyle={editorCardStyle}
              titleStyle={editorCardTitleStyle}
              removeButtonStyle={getEditorRemoveButtonStyle()}
              removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
              onRemove={() => onRemove(index)}
              onToggle={() => onToggleEditorCard(cardId)}
            >
              <View style={styles.editorGrid}>
                <EditorField
                  label="Nom"
                  value={skill.name}
                  onChangeText={(value) => onUpdate(index, { name: value })}
                />
                <EditorField
                  label="Bonus %"
                  value={String(skill.value)}
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    onUpdate(index, {
                      value: Math.max(0, Number.parseInt(value || "0", 10) || 0),
                    })
                  }
                />
              </View>
            </EditorCollapsibleCard>
          );
        })}
      </View>
    </View>
  );
}
