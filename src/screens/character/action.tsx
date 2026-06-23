import { Dispatch, SetStateAction } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AssetVisual } from "../../components/character-sheet/AssetVisual";
export { AdjustButton, AttackBonusCard, ResourceMeter } from "../../components/character-sheet/ResourceCards";
import { Character, EquipmentItem, Spell } from "../../types/game";
import {
  getEquipmentGrantedSpells,
  getScaledSpellCost,
  getSpellCost,
} from "../../utils/game";
import { CharacterThemePreset } from "./presets";
import { styles as sheetStyles } from "./styles";
import { DamageDraft, QuickCastDraft, RecoveryDraft } from "./types";

type CharacterActionTheme = {
  panelBg: string;
  border: string;
  subtitle: string;
  title: string;
  buttonBg: string;
  buttonText: string;
  chipBg: string;
  accent: string;
};

type CharacterAction = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: "primary" | "secondary";
  value?: string;
  onPress: () => void;
};

type CharacterActionsProps = {
  actions: CharacterAction[];
  columns: number;
  theme: CharacterActionTheme;
};

export function CharacterActions({ actions, columns, theme }: CharacterActionsProps) {
  return (
    <View
      style={[
        styles.quickActionsCard,
        { backgroundColor: theme.panelBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.quickActionsHeader}>
        <View style={styles.quickActionsHeaderText}>
          <Text style={[styles.quickActionsHint, { color: theme.subtitle }]}>
            Actions rapides
          </Text>
          <Text style={[styles.quickActionsTitle, { color: theme.title }]}>
            Raccourcis de tour
          </Text>
        </View>
        <Text style={[styles.quickActionsMeta, { color: theme.subtitle }]}>
          {columns} colonne{columns > 1 ? "s" : ""}
        </Text>
      </View>
      <View style={styles.quickActionsButtons}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            style={[
              styles.quickActionButton,
              columns === 1
                ? styles.quickActionButtonSingle
                : columns === 2
                  ? styles.quickActionButtonDouble
                  : styles.quickActionButtonTriple,
              action.tone === "primary"
                ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBg }
                : { backgroundColor: theme.chipBg, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.quickActionIconWrap,
                action.tone === "primary"
                  ? {
                      backgroundColor: "rgba(255,255,255,0.16)",
                      borderColor: "rgba(255,255,255,0.2)",
                    }
                  : {
                      backgroundColor: theme.panelBg,
                      borderColor: theme.border,
                    },
              ]}
            >
              <Text
                style={[
                  styles.quickActionIcon,
                  {
                    color:
                      action.tone === "primary" ? theme.buttonText : theme.accent,
                  },
                ]}
              >
                {action.icon}
              </Text>
            </View>
            <View style={styles.quickActionBody}>
              <Text
                style={[
                  styles.quickActionButtonLabel,
                  {
                    color:
                      action.tone === "primary" ? theme.buttonText : theme.title,
                  },
                ]}
              >
                {action.title}
              </Text>
              {action.value ? (
                <Text style={[styles.quickActionValue, { color: theme.title }]}>
                  {action.value}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.quickActionDescription,
                  {
                    color:
                      action.tone === "primary"
                        ? "rgba(255,255,255,0.86)"
                        : theme.subtitle,
                  },
                ]}
              >
                {action.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

type CharacterActionModalsProps = {
  character: Character;
  damageDraft: DamageDraft | null;
  recoveryDraft: RecoveryDraft | null;
  quickCastDraft: QuickCastDraft | null;
  quickCastVisible: boolean;
  selectedQuickCastEquipmentSpell: Spell | null;
  selectedQuickCastEquipmentSpellSource: EquipmentItem | null;
  selectedQuickCastSpell: Spell | null;
  theme: CharacterThemePreset;
  onAdjustQuickCastExtra: (delta: number) => void;
  onApplyDamage: () => void;
  onApplyRecovery: () => void;
  onCloseDamage: () => void;
  onCloseQuickCast: () => void;
  onCloseRecovery: () => void;
  onConfirmQuickCast: () => void;
  onSelectQuickCastEquipmentSpell: (equipmentId: string, spellId: string) => void;
  onSelectQuickCastSpell: (spellId: string) => void;
  setDamageDraft: Dispatch<SetStateAction<DamageDraft | null>>;
  setQuickCastDraft: Dispatch<SetStateAction<QuickCastDraft | null>>;
  setRecoveryDraft: Dispatch<SetStateAction<RecoveryDraft | null>>;
};

export function CharacterActionModals({
  character,
  damageDraft,
  recoveryDraft,
  quickCastDraft,
  quickCastVisible,
  selectedQuickCastEquipmentSpell,
  selectedQuickCastEquipmentSpellSource,
  selectedQuickCastSpell,
  theme,
  onAdjustQuickCastExtra,
  onApplyDamage,
  onApplyRecovery,
  onCloseDamage,
  onCloseQuickCast,
  onCloseRecovery,
  onConfirmQuickCast,
  onSelectQuickCastEquipmentSpell,
  onSelectQuickCastSpell,
  setDamageDraft,
  setQuickCastDraft,
  setRecoveryDraft,
}: CharacterActionModalsProps) {
  const visible = Boolean(damageDraft || recoveryDraft || quickCastVisible);

  if (!visible) {
    return null;
  }

  const close = () => {
    if (damageDraft) {
      onCloseDamage();
      return;
    }

    if (recoveryDraft) {
      onCloseRecovery();
      return;
    }

    onCloseQuickCast();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={sheetStyles.overlayBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View
          style={[
            sheetStyles.overlayCard,
            { backgroundColor: theme.panelBg, borderColor: theme.border },
          ]}
        >
          <ScrollView
            style={sheetStyles.overlayScroll}
            contentContainerStyle={sheetStyles.overlayScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {damageDraft ? (
              <DamageModalContent
                draft={damageDraft}
                theme={theme}
                onApply={onApplyDamage}
                onClose={onCloseDamage}
                setDamageDraft={setDamageDraft}
              />
            ) : null}
            {recoveryDraft ? (
              <RecoveryModalContent
                draft={recoveryDraft}
                theme={theme}
                onApply={onApplyRecovery}
                onClose={onCloseRecovery}
                setRecoveryDraft={setRecoveryDraft}
              />
            ) : null}
            {quickCastVisible ? (
              <QuickCastModalContent
                character={character}
                quickCastDraft={quickCastDraft}
                selectedEquipmentSpell={selectedQuickCastEquipmentSpell}
                selectedEquipmentSpellSource={selectedQuickCastEquipmentSpellSource}
                selectedSpell={selectedQuickCastSpell}
                theme={theme}
                onAdjustExtra={onAdjustQuickCastExtra}
                onClose={onCloseQuickCast}
                onConfirm={onConfirmQuickCast}
                onSelectEquipmentSpell={onSelectQuickCastEquipmentSpell}
                onSelectSpell={onSelectQuickCastSpell}
                setQuickCastDraft={setQuickCastDraft}
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DamageModalContent({
  draft,
  theme,
  onApply,
  onClose,
  setDamageDraft,
}: {
  draft: DamageDraft;
  theme: CharacterThemePreset;
  onApply: () => void;
  onClose: () => void;
  setDamageDraft: Dispatch<SetStateAction<DamageDraft | null>>;
}) {
  return (
    <>
      <ActionOverlayHeader
        title="Prendre des degats"
        subtitle="Le bouclier absorbe d'abord, l'armure reduit ensuite les degats, puis les PV prennent le reste."
        theme={theme}
        onClose={onClose}
      />
      <View style={sheetStyles.overlayOptionList}>
        <View
          style={[
            sheetStyles.damageEditorCard,
            { backgroundColor: theme.chipBg, borderColor: theme.border },
          ]}
        >
          <Text style={[sheetStyles.editorFieldLabel, { color: theme.subtitle }]}>
            Montant des degats
          </Text>
          <TextInput
            value={draft.amount}
            onChangeText={(amount) =>
              setDamageDraft((current) => (current ? { ...current, amount } : current))
            }
            keyboardType="numeric"
            style={[
              sheetStyles.editorInput,
              { backgroundColor: theme.chipBg, borderColor: theme.border, color: theme.title },
            ]}
            placeholder="0"
            placeholderTextColor={theme.subtitle}
          />
          <Pressable
            onPress={() =>
              setDamageDraft((current) =>
                current ? { ...current, ignoreArmor: !current.ignoreArmor } : current,
              )
            }
            style={[
              sheetStyles.damageToggle,
              {
                backgroundColor: draft.ignoreArmor ? theme.accent : theme.panelBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                sheetStyles.damageToggleLabel,
                { color: draft.ignoreArmor ? theme.pageBg : theme.title },
              ]}
            >
              {draft.ignoreArmor ? "☑" : "☐"} Ignorer l'armure
            </Text>
          </Pressable>
        </View>
      </View>
      <ActionModalButtons theme={theme} onCancel={onClose} onConfirm={onApply} confirmLabel="Appliquer" />
    </>
  );
}

function RecoveryModalContent({
  draft,
  theme,
  onApply,
  onClose,
  setRecoveryDraft,
}: {
  draft: RecoveryDraft;
  theme: CharacterThemePreset;
  onApply: () => void;
  onClose: () => void;
  setRecoveryDraft: Dispatch<SetStateAction<RecoveryDraft | null>>;
}) {
  return (
    <>
      <ActionOverlayHeader
        title="Soigner / bouclier"
        subtitle="Restaure des PV ou ajoute un bouclier temporaire."
        theme={theme}
        onClose={onClose}
      />
      <View style={sheetStyles.overlayOptionList}>
        <View
          style={[
            sheetStyles.damageEditorCard,
            { backgroundColor: theme.chipBg, borderColor: theme.border },
          ]}
        >
          <View style={sheetStyles.quickModeRow}>
            {(["heal", "shield"] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() =>
                  setRecoveryDraft((current) => (current ? { ...current, mode } : current))
                }
                style={[
                  sheetStyles.quickModeButton,
                  draft.mode === mode
                    ? { backgroundColor: theme.buttonBg }
                    : { backgroundColor: theme.panelBg, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    sheetStyles.quickModeButtonLabel,
                    { color: draft.mode === mode ? theme.buttonText : theme.title },
                  ]}
                >
                  {mode === "heal" ? "Soigner" : "Bouclier"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[sheetStyles.editorFieldLabel, { color: theme.subtitle }]}>Montant</Text>
          <TextInput
            value={draft.amount}
            onChangeText={(amount) =>
              setRecoveryDraft((current) => (current ? { ...current, amount } : current))
            }
            keyboardType="numeric"
            style={[
              sheetStyles.editorInput,
              { backgroundColor: theme.chipBg, borderColor: theme.border, color: theme.title },
            ]}
            placeholder="0"
            placeholderTextColor={theme.subtitle}
          />
        </View>
      </View>
      <ActionModalButtons theme={theme} onCancel={onClose} onConfirm={onApply} confirmLabel="Appliquer" />
    </>
  );
}

function QuickCastModalContent({
  character,
  quickCastDraft,
  selectedEquipmentSpell,
  selectedEquipmentSpellSource,
  selectedSpell,
  theme,
  onAdjustExtra,
  onClose,
  onConfirm,
  onSelectEquipmentSpell,
  onSelectSpell,
  setQuickCastDraft,
}: {
  character: Character;
  quickCastDraft: QuickCastDraft | null;
  selectedEquipmentSpell: Spell | null;
  selectedEquipmentSpellSource: EquipmentItem | null;
  selectedSpell: Spell | null;
  theme: CharacterThemePreset;
  onAdjustExtra: (delta: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  onSelectEquipmentSpell: (equipmentId: string, spellId: string) => void;
  onSelectSpell: (spellId: string) => void;
  setQuickCastDraft: Dispatch<SetStateAction<QuickCastDraft | null>>;
}) {
  return (
    <>
      <ActionOverlayHeader
        title="Dons PSY"
        subtitle="Dons du personnage et dons ajoutes aux equipements."
        theme={theme}
        onClose={onClose}
      />
      <View style={sheetStyles.overlayOptionList}>
        {character.spells.map((spell) => (
          <QuickCastSpellOption
            key={spell.id}
            active={quickCastDraft?.kind === "spell" && quickCastDraft.id === spell.id}
            spell={spell}
            stance={character.stance}
            theme={theme}
            onPress={() => onSelectSpell(spell.id)}
          />
        ))}
        {character.equipment
          .flatMap((item) => {
            return getEquipmentGrantedSpells(item).map((spell) => (
              <QuickCastSpellOption
                key={`${item.id}-${spell.id}`}
                active={
                  quickCastDraft?.kind === "equipmentSpell" &&
                  quickCastDraft.id === spell.id &&
                  quickCastDraft.sourceEquipmentId === item.id
                }
                prefix={`Don d'equipement · ${item.name}`}
                spell={spell}
                stance={character.stance}
                theme={theme}
                onPress={() => onSelectEquipmentSpell(item.id, spell.id)}
              />
            ));
          })}
      </View>
      {selectedSpell ? (
        <QuickCastSpellDetail
          character={character}
          quickCastDraft={quickCastDraft}
          spell={selectedSpell}
          theme={theme}
          title={`Reglage du sort · ${selectedSpell.name}`}
          onAdjustExtra={onAdjustExtra}
          onConfirm={onConfirm}
          onBack={() => setQuickCastDraft(null)}
        />
      ) : null}
      {selectedEquipmentSpell && selectedEquipmentSpellSource ? (
        <QuickCastSpellDetail
          character={character}
          quickCastDraft={quickCastDraft}
          spell={selectedEquipmentSpell}
          theme={theme}
          title={`Reglage du don d'equipement · ${selectedEquipmentSpell.name}`}
          subtitle={`Equipement source · ${selectedEquipmentSpellSource.name}`}
          onAdjustExtra={onAdjustExtra}
          onConfirm={onConfirm}
          onBack={() => setQuickCastDraft(null)}
        />
      ) : null}
    </>
  );
}

function QuickCastSpellOption({
  active,
  prefix,
  spell,
  stance,
  theme,
  onPress,
}: {
  active: boolean;
  prefix?: string;
  spell: Spell;
  stance: Character["stance"];
  theme: CharacterThemePreset;
  onPress: () => void;
}) {
  const cost = getSpellCost(spell, stance);
  const reduced = spell.reducible && cost < spell.basePsyCost;

  return (
    <Pressable
      onPress={onPress}
      style={[
        sheetStyles.overlayOptionCard,
        { backgroundColor: theme.chipBg, borderColor: active ? theme.accent : theme.border },
      ]}
    >
      <View style={sheetStyles.quickCastRow}>
        <AssetVisual
          label={spell.name}
          icon={spell.icon}
          imageUrl={spell.imageUrl}
          imageModule={spell.imageModule}
          small
        />
        <View style={sheetStyles.quickCastBody}>
          <View style={sheetStyles.quickCastHeader}>
            <Text style={[sheetStyles.overlayOptionTitle, { color: theme.title }]}>
              {spell.name}
            </Text>
            <Text style={[sheetStyles.quickCastCost, reduced ? sheetStyles.quickCastCostReduced : null]}>
              {cost} PSY
            </Text>
          </View>
          <Text style={[sheetStyles.overlayOptionDescription, { color: theme.subtitle }]}>
            {prefix ?? spell.description}
          </Text>
          {spell.augmentable ? (
            <Text style={[sheetStyles.quickCastScalingHint, { color: theme.subtitle }]}>
              Injection de PSY supplementaire possible
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function QuickCastSpellDetail({
  character,
  quickCastDraft,
  spell,
  subtitle,
  theme,
  title,
  onAdjustExtra,
  onBack,
  onConfirm,
}: {
  character: Character;
  quickCastDraft: QuickCastDraft | null;
  spell: Spell;
  subtitle?: string;
  theme: CharacterThemePreset;
  title: string;
  onAdjustExtra: (delta: number) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const baseCost = getSpellCost(spell, character.stance);
  const maxExtraPsy = spell.augmentable ? Math.max(0, character.psy.current - baseCost) : 0;
  const extraPsy = quickCastDraft?.extraPsy ?? 0;

  return (
    <View
      style={[
        sheetStyles.quickCastDetailCard,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
    >
      <Text style={[sheetStyles.quickCastDetailTitle, { color: theme.title }]}>{title}</Text>
      {subtitle ? (
        <Text style={[sheetStyles.quickCastDetailText, { color: theme.subtitle }]}>{subtitle}</Text>
      ) : null}
      <Text style={[sheetStyles.quickCastDetailText, { color: theme.subtitle }]}>
        Cout de base applique: {baseCost} PSY
        {spell.reducible && baseCost < spell.basePsyCost ? " (Focus deja pris en compte)" : ""}
      </Text>
      {spell.augmentable ? (
        <>
          <Text style={[sheetStyles.quickCastDetailText, { color: theme.subtitle }]}>
            PSY supplementaire disponible: {maxExtraPsy}
          </Text>
          <View style={sheetStyles.quickCastAdjustRow}>
            <QuickCastAdjustButton
              label="-1 PSY"
              disabled={!extraPsy}
              theme={theme}
              onPress={() => onAdjustExtra(-1)}
            />
            <View style={[sheetStyles.quickCastAdjustValue, { borderColor: theme.border }]}>
              <Text style={[sheetStyles.quickCastAdjustValueLabel, { color: theme.title }]}>
                +{extraPsy} PSY
              </Text>
            </View>
            <QuickCastAdjustButton
              label="+1 PSY"
              disabled={extraPsy >= maxExtraPsy}
              theme={theme}
              onPress={() => onAdjustExtra(1)}
            />
          </View>
          <Text style={[sheetStyles.quickCastDetailText, { color: theme.subtitle }]}>
            Total: {getScaledSpellCost(spell, character.stance, extraPsy)} PSY
          </Text>
          <Text style={[sheetStyles.quickCastDetailText, { color: theme.subtitle }]}>
            Injection actuelle: +{extraPsy} PSY
          </Text>
        </>
      ) : (
        <Text style={[sheetStyles.quickCastDetailText, { color: theme.subtitle }]}>
          Ce sort a un cout fixe. Aucun PSY supplementaire ne peut etre ajoute.
        </Text>
      )}
      <ActionModalButtons theme={theme} onCancel={onBack} onConfirm={onConfirm} cancelLabel="Retour" confirmLabel="Lancer" />
    </View>
  );
}

function QuickCastAdjustButton({
  disabled,
  label,
  theme,
  onPress,
}: {
  disabled: boolean;
  label: string;
  theme: CharacterThemePreset;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        sheetStyles.quickCastAdjustButton,
        { backgroundColor: theme.buttonBg, opacity: disabled ? 0.55 : 1 },
      ]}
    >
      <Text style={[sheetStyles.quickCastAdjustButtonLabel, { color: theme.buttonText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActionOverlayHeader({
  title,
  subtitle,
  theme,
  onClose,
}: {
  title: string;
  subtitle: string;
  theme: CharacterThemePreset;
  onClose: () => void;
}) {
  return (
    <View style={sheetStyles.overlayHeader}>
      <View style={sheetStyles.overlayHeaderText}>
        <Text style={[sheetStyles.overlayTitle, { color: theme.title }]}>{title}</Text>
        <Text style={[sheetStyles.overlaySubtitle, { color: theme.subtitle }]}>{subtitle}</Text>
      </View>
      <Pressable onPress={onClose} style={[sheetStyles.overlayCloseButton, { borderColor: theme.border }]}>
        <Text style={[sheetStyles.overlayCloseButtonLabel, { color: theme.title }]}>Fermer</Text>
      </Pressable>
    </View>
  );
}

function ActionModalButtons({
  cancelLabel = "Annuler",
  confirmLabel,
  theme,
  onCancel,
  onConfirm,
}: {
  cancelLabel?: string;
  confirmLabel: string;
  theme: CharacterThemePreset;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={sheetStyles.overlayActions}>
      <Pressable
        onPress={onCancel}
        style={[
          sheetStyles.overlaySecondaryButton,
          { backgroundColor: theme.chipBg, borderColor: theme.border },
        ]}
      >
        <Text style={[sheetStyles.overlaySecondaryButtonLabel, { color: theme.title }]}>
          {cancelLabel}
        </Text>
      </Pressable>
      <Pressable
        onPress={onConfirm}
        style={[sheetStyles.overlayPrimaryButton, { backgroundColor: theme.buttonBg }]}
      >
        <Text style={[sheetStyles.overlayPrimaryButtonLabel, { color: theme.buttonText }]}>
          {confirmLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsCard: {
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  quickActionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  quickActionsHeaderText: {
    flex: 1,
    gap: 4,
  },
  quickActionsHint: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  quickActionsMeta: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quickActionsButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionButton: {
    minWidth: 220,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickActionButtonSingle: {
    width: "100%",
    minWidth: 0,
  },
  quickActionButtonDouble: {
    flexGrow: 1,
    flexBasis: 260,
  },
  quickActionButtonTriple: {
    flexGrow: 1,
    flexBasis: 220,
  },
  quickActionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIcon: {
    fontSize: 16,
    fontWeight: "900",
  },
  quickActionBody: {
    flex: 1,
    gap: 4,
  },
  quickActionButtonLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  quickActionDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  quickActionValue: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
