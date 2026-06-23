import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { AssetVisual } from "../../components/character-sheet/AssetVisual";
import { CharacterSheetBackdrop } from "../../components/character-sheet/CharacterSheetBackdrop";
import {
  EditorField,
  EditorFieldThemeProvider,
  TagEditorField,
} from "../../components/character-sheet/EditorField";
import {
  AdjustButton,
  AttackBonusCard,
  CharacterActions,
  CharacterActionModals,
  ResourceMeter,
} from "./action";
import { CharacterResume } from "./resume";
import { CharacterPanels } from "./sheet";
import { DonEditorSection } from "./don";
import {
  ResistancesEditorSection,
  SkillsEditorSection,
  StatusEffectsEditorSection,
} from "./SimpleEditorSections";
import {
  ArchetypeId,
  Character,
  CharacterRank,
  CombatStance,
  CharacterTheme,
  EquipmentItem,
  ImageModule,
  InventoryItem,
  ResistanceProfile,
  ResourcePool,
  Skill,
  Spell,
  StatusEffect,
} from "../../types/game";
import {
  clampValue,
  getActiveStatusEffectBonuses,
  getEffectiveArmorResource,
  getEquipmentGrantedSpells,
  getScaledSpellCost,
  getSpellCost,
  stanceDescriptions,
  stanceLabels,
} from "../../utils/game";
import { normalizeCharacter } from "../../utils/characters";
import { persistCustomImage } from "../../utils/imageStorage";
import { getResponsiveFlags } from "../../utils/responsive";
import {
  LOCAL_IMAGE_LIBRARY,
  ImageLibraryCategory,
  LocalImageOption,
} from "../../data/image-library";
import { AppNavbar } from "../navbar";
import { EditorCollapsibleCard } from "./EditorCollapsibleCard";
import { EditorModal } from "./EditorModal";
import {
  compactText,
  formatEditorTags,
} from "./editorHelpers";
import {
  ARCHETYPE_OPTIONS,
  STANCES,
  THEME_DESCRIPTIONS,
  THEME_LABELS,
  THEME_PRESETS,
  cloneTemplate,
  createTemplateCharacter,
  makeId,
} from "./presets";
import { styles } from "./styles";
import {
  CreationDraft,
  DamageDraft,
  EditorSection,
  ImageLibraryTarget,
  OverlayMenu,
  QuickCastDraft,
  RecoveryDraft,
} from "./types";

const EDITOR_REOPEN_SUPPRESSION_MS = Platform.OS === "android" ? 1200 : 450;
const ROSTER_MESSAGE_DISPLAY_MS = 2500;
const ROSTER_ERROR_MESSAGE_DISPLAY_MS = 8000;
type StatusEffectBonusKey = keyof NonNullable<StatusEffect["bonuses"]>;
const CHARACTER_RANKS: CharacterRank[] = ["5", "4", "3", "2", "1", "S"];

function getRosterMessageDisplayDuration(message: string) {
  return /\b(impossible|insuffisante|aucun|failed|erreur|error)\b/i.test(message)
    ? ROSTER_ERROR_MESSAGE_DISPLAY_MS
    : ROSTER_MESSAGE_DISPLAY_MS;
}

export type CharacterSheetScreenProps = {
  characters: Character[];
  setCharacters: Dispatch<SetStateAction<Character[]>>;
  selectedId: string;
  setSelectedId: Dispatch<SetStateAction<string>>;
  creationRequest?: number;
  onCreationRequestHandled?: () => void;
  onOpenHome?: () => void;
  onOpenHistory?: () => void;
};

export function CharacterSheetScreen({
  characters,
  setCharacters,
  selectedId,
  setSelectedId,
  creationRequest = 0,
  onCreationRequestHandled,
  onOpenHome,
  onOpenHistory,
}: CharacterSheetScreenProps) {
  const { width } = useWindowDimensions();
  const [activeOverlayMenu, setActiveOverlayMenu] = useState<OverlayMenu | null>(null);
  const [creationDraft, setCreationDraft] = useState<CreationDraft | null>(null);
  const [damageDraft, setDamageDraft] = useState<DamageDraft | null>(null);
  const [recoveryDraft, setRecoveryDraft] = useState<RecoveryDraft | null>(null);
  const [quickCastDraft, setQuickCastDraft] = useState<QuickCastDraft | null>(null);
  const [draftCharacter, setDraftCharacter] = useState<Character | null>(null);
  const [expandedEditorCardIds, setExpandedEditorCardIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [editorSection, setEditorSection] = useState<EditorSection>("all");
  const [rosterMessage, setRosterMessage] = useState<string | null>(null);
  const [deleteCharacterConfirm, setDeleteCharacterConfirm] = useState(false);
  const [imageLibraryTarget, setImageLibraryTarget] = useState<ImageLibraryTarget | null>(null);
  const [imageLibraryQuery, setImageLibraryQuery] = useState("");
  const suppressEditorOpenUntilRef = useRef(0);

  const selectedCharacter =
    characters.find((character) => character.id === selectedId) ?? characters[0];

  if (!selectedCharacter) {
    return null;
  }
  const activeTheme = THEME_PRESETS[selectedCharacter.theme ?? "humain"];
  const cardBackgroundsEnabled = selectedCharacter.cardBackgroundsEnabled ?? true;
  const draftCardBackgroundsEnabled = draftCharacter?.cardBackgroundsEnabled ?? true;
  const sectionTheme = cardBackgroundsEnabled
    ? activeTheme
    : { ...activeTheme, cardBackgroundImage: undefined };
  const selectedQuickCastSpell =
    quickCastDraft?.kind === "spell"
      ? selectedCharacter.spells.find((spell) => spell.id === quickCastDraft.id) ?? null
      : null;
  const selectedQuickCastEquipmentSpellSource =
    quickCastDraft?.kind === "equipmentSpell"
      ? selectedCharacter.equipment.find((item) => item.id === quickCastDraft.sourceEquipmentId) ??
        null
      : null;
  const selectedQuickCastEquipmentSpell =
    quickCastDraft?.kind === "equipmentSpell"
      ? selectedQuickCastEquipmentSpellSource
        ? getEquipmentGrantedSpells(selectedQuickCastEquipmentSpellSource).find(
            (spell) => spell.id === quickCastDraft.id,
          ) ?? null
        : null
      : null;
  const selectedArchetypeOption =
    (draftCharacter
      ? ARCHETYPE_OPTIONS.find((option) => option.id === draftCharacter.archetypeId)
      : undefined) ?? ARCHETYPE_OPTIONS[ARCHETYPE_OPTIONS.length - 1]!;
  const creationArchetypeOption =
    (creationDraft
      ? ARCHETYPE_OPTIONS.find((option) => option.id === creationDraft.archetypeId)
      : undefined) ?? ARCHETYPE_OPTIONS[ARCHETYPE_OPTIONS.length - 1]!;
  const editingAll = editorSection === "all";
  const {
    isPhone,
    isDesktop,
    isSplit: useSplitLayout,
  } = getResponsiveFlags(width);
  const useWideHero = !isPhone;
  const useQuickActionsColumns = isDesktop ? 4 : !isPhone ? 2 : 1;
  const normalizedBio = selectedCharacter.bio?.replace(/\s+/g, " ").trim() ?? "";
  const characterBioPreview =
    normalizedBio.length > 180 ? `${normalizedBio.slice(0, 180).trimEnd()}...` : normalizedBio;
  const imageLibraryOptions = imageLibraryTarget
    ? LOCAL_IMAGE_LIBRARY[getImageLibraryCategory(imageLibraryTarget)]
    : [];
  const imageLibraryQueryTokens = imageLibraryQuery
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const filteredImageLibraryOptions = imageLibraryQueryTokens.length
    ? imageLibraryOptions.filter((option) => {
        const haystack = [option.id, option.label, ...option.tags].join(" ").toLowerCase();
        return imageLibraryQueryTokens.every((token) => haystack.includes(token));
      })
    : imageLibraryOptions;
  const showOverlay =
    (activeOverlayMenu !== null && activeOverlayMenu !== "quickCast") ||
    creationDraft !== null;

  useEffect(() => {
    if (creationRequest <= 0) {
      return;
    }

    openCreationWizard();
    onCreationRequestHandled?.();
  }, [creationRequest, onCreationRequestHandled]);

  useEffect(() => {
    setImageLibraryQuery("");
  }, [imageLibraryTarget]);

  useEffect(() => {
    if (!rosterMessage) {
      return;
    }

    const timeout = setTimeout(
      () => setRosterMessage(null),
      getRosterMessageDisplayDuration(rosterMessage),
    );

    return () => clearTimeout(timeout);
  }, [rosterMessage]);

  function toggleCardBackgrounds() {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            cardBackgroundsEnabled: !(current.cardBackgroundsEnabled ?? true),
          }
        : current,
    );
  }
  const editorSectionTitleStyle = [styles.editorGroupTitle, { color: activeTheme.title }];
  const editorHintStyle = [styles.editorHint, { color: activeTheme.subtitle }];
  const editorCardStyle = [
    styles.editorCard,
    { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
  ];
  const editorCardTitleStyle = [styles.editorCardTitle, { color: activeTheme.title }];
  const editorInlineLabelStyle = [styles.editorInlineLabel, { color: activeTheme.title }];
  const editorAddButtonStyle = [
    styles.editorAddButton,
    { backgroundColor: activeTheme.buttonBg, borderColor: activeTheme.border },
  ];
  const editorAddButtonLabelStyle = [
    styles.editorAddButtonLabel,
    { color: activeTheme.buttonText },
  ];
  const editorUploadButtonStyle = [
    styles.editorUploadButton,
    { backgroundColor: activeTheme.buttonBg, borderColor: activeTheme.border },
  ];
  const editorUploadButtonLabelStyle = [
    styles.editorUploadButtonLabel,
    { color: activeTheme.buttonText },
  ];
  const editorGhostButtonStyle = [
    styles.editorGhostButton,
    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
  ];
  const editorGhostButtonLabelStyle = [
    styles.editorGhostButtonLabel,
    { color: activeTheme.title },
  ];
  const editorPrimaryButtonStyle = [
    styles.editorPrimaryButton,
    { backgroundColor: activeTheme.buttonBg, borderColor: activeTheme.border },
  ];
  const editorPrimaryButtonLabelStyle = [
    styles.editorPrimaryButtonLabel,
    { color: activeTheme.buttonText },
  ];
  const editorDangerButtonStyle = [
    styles.editorDangerButton,
    {
      backgroundColor: activeTheme.panelBg,
      borderColor: activeTheme.accent,
    },
  ];
  const editorDangerButtonLabelStyle = [
    styles.editorDangerButtonLabel,
    { color: activeTheme.title },
  ];

  function getEditorRemoveButtonStyle() {
    return [
      styles.editorRemoveButton,
      { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
    ];
  }

  function getEditorRemoveButtonLabelStyle() {
    return [
      styles.editorRemoveButtonLabel,
      { color: activeTheme.title },
    ];
  }

  function getEditorToggleButtonStyle(isActive: boolean) {
    return [
      styles.editorToggleButton,
      {
        backgroundColor: isActive ? activeTheme.buttonBg : activeTheme.chipBg,
        borderColor: isActive ? activeTheme.accent : activeTheme.border,
      },
    ];
  }

  function getEditorToggleButtonLabelStyle(isActive: boolean) {
    return [
      styles.editorToggleButtonLabel,
      { color: isActive ? activeTheme.buttonText : activeTheme.title },
    ];
  }

  function getEditorCardId(kind: string, id: string) {
    return `${kind}:${id}`;
  }

  function isEditorCardExpanded(cardId: string) {
    return expandedEditorCardIds.has(cardId);
  }

  function toggleEditorCard(cardId: string) {
    setExpandedEditorCardIds((current) => {
      const next = new Set(current);

      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }

      return next;
    });
  }

  function expandEditorCard(cardId: string) {
    setExpandedEditorCardIds((current) => {
      const next = new Set(current);
      next.add(cardId);
      return next;
    });
  }

  function updateCharacter(
    characterId: string,
    updater: (character: Character) => Character,
  ) {
    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === characterId ? updater(character) : character,
      ),
    );
  }

  function updateResource(
    characterId: string,
    resourceKey: "pv" | "psy" | "armor",
    delta: number,
  ) {
    updateCharacter(characterId, (character) => {
      const resource = character[resourceKey] as ResourcePool;
      const nextValue = clampValue(resource.current + delta, resource.max);

      return {
        ...character,
        [resourceKey]: {
          ...resource,
          current: nextValue,
        },
      };
    });
  }

  function updateResourceBonus(
    characterId: string,
    resourceKey: "pv" | "psy" | "armor",
    delta: number,
  ) {
    if (resourceKey === "psy") {
      return;
    }

    updateCharacter(characterId, (character) => {
      const resource = character[resourceKey] as ResourcePool;

      return {
        ...character,
        [resourceKey]: {
          ...resource,
          bonus: Math.max(0, resource.bonus + delta),
        },
      };
    });
  }

  function updateAttackBonus(characterId: string, delta: number) {
    updateCharacter(characterId, (character) => ({
      ...character,
      attackBonus: Math.max(0, character.attackBonus + delta),
    }));
  }

  function setStance(characterId: string, stance: CombatStance) {
    updateCharacter(characterId, (character) => ({
      ...character,
      stance,
    }));
    setActiveOverlayMenu(null);
  }

  function setCharacterTheme(characterId: string, theme: CharacterTheme) {
    updateCharacter(characterId, (character) => ({
      ...character,
      theme,
    }));
    setDraftCharacter((current) =>
      current && current.id === characterId ? { ...current, theme } : current,
    );
    setActiveOverlayMenu(null);
  }

  function openCreationWizard() {
    const defaultArchetype = ARCHETYPE_OPTIONS[0]!;
    setCreationDraft({
      archetypeId: defaultArchetype.id,
      specialization: defaultArchetype.specializations[0] ?? "",
      step: 1,
    });
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function updateCreationArchetype(archetypeId: ArchetypeId) {
    const archetypeOption = ARCHETYPE_OPTIONS.find((option) => option.id === archetypeId);

    if (!archetypeOption) {
      return;
    }

    setCreationDraft({
      archetypeId,
      specialization: archetypeOption.specializations[0] ?? "",
      step: 2,
    });
    setActiveOverlayMenu(null);
  }

  function createCharacter() {
    if (!creationDraft) {
      return;
    }

    const newCharacter = createTemplateCharacter(
      creationDraft.archetypeId,
      creationDraft.specialization,
    );

    setCharacters((currentCharacters) => [...currentCharacters, newCharacter]);
    setSelectedId(newCharacter.id);
    setDraftCharacter(cloneTemplate(newCharacter));
    setEditorSection("identity");
    setCreationDraft(null);
    setQuickCastDraft(null);
    setRosterMessage("Nouveau personnage cree depuis un template.");
  }

  function openDamageDialog() {
    setActiveOverlayMenu(null);
    setCreationDraft(null);
    setRecoveryDraft(null);
    setQuickCastDraft(null);
    setDamageDraft({ amount: "", ignoreArmor: false });
  }

  function openQuickCastDialog() {
    setCreationDraft(null);
    setDamageDraft(null);
    setRecoveryDraft(null);
    setQuickCastDraft(null);
    setActiveOverlayMenu("quickCast");
  }

  function openRecoveryDialog() {
    setActiveOverlayMenu(null);
    setCreationDraft(null);
    setDamageDraft(null);
    setQuickCastDraft(null);
    setRecoveryDraft({ amount: "", mode: "heal" });
  }

  function applyDamage() {
    if (!damageDraft || !selectedCharacter) {
      return;
    }

    const amount = Math.max(0, Number.parseInt(damageDraft.amount || "0", 10) || 0);

    if (amount <= 0) {
      setDamageDraft(null);
      return;
    }

    updateCharacter(selectedCharacter.id, (character) => {
      let remaining = amount;
      let shieldAbsorbed = 0;
      let armorReduced = 0;
      let pvAbsorbed = 0;

      const nextPv = { ...character.pv };
      const statusShieldBonus = Math.max(
        0,
        getActiveStatusEffectBonuses(character).shieldBonus,
      );

      if (remaining > 0) {
        shieldAbsorbed = Math.min(nextPv.bonus + statusShieldBonus, remaining);
        nextPv.bonus = Math.max(0, nextPv.bonus - shieldAbsorbed);
        remaining -= shieldAbsorbed;
      }

      if (!damageDraft.ignoreArmor && remaining > 0) {
        armorReduced = Math.min(getEffectiveArmorResource(character).current, remaining);
        remaining -= armorReduced;
      }

      if (remaining > 0) {
        pvAbsorbed = Math.min(nextPv.current, remaining);
        nextPv.current -= pvAbsorbed;
        remaining -= pvAbsorbed;
      }

      const messageParts = [
        `${amount} degats recus`,
        shieldAbsorbed > 0 ? `${shieldAbsorbed} absorbes par le bouclier` : null,
        armorReduced > 0 ? `${armorReduced} reduits par l'armure` : null,
        pvAbsorbed > 0 ? `${pvAbsorbed} retires aux PV` : null,
        remaining > 0 ? `${remaining} non absorbes` : null,
      ].filter(Boolean);

      setRosterMessage(messageParts.join(" · "));

      return {
        ...character,
        pv: nextPv,
      };
    });

    setDamageDraft(null);
  }

  function selectQuickCastSpell(spellId: string) {
    setQuickCastDraft({ kind: "spell", id: spellId, extraPsy: 0 });
  }

  function selectQuickCastEquipmentSpell(equipmentId: string, spellId: string) {
    setQuickCastDraft({
      kind: "equipmentSpell",
      id: spellId,
      sourceEquipmentId: equipmentId,
      extraPsy: 0,
    });
  }

  function adjustQuickCastExtra(delta: number) {
    if (
      !quickCastDraft ||
      (quickCastDraft.kind !== "spell" && quickCastDraft.kind !== "equipmentSpell") ||
      !selectedCharacter
    ) {
      return;
    }

    const activeSpell =
      quickCastDraft.kind === "spell"
        ? selectedQuickCastSpell
        : selectedQuickCastEquipmentSpell;

    if (!activeSpell) {
      return;
    }

    const baseCost = getSpellCost(activeSpell, selectedCharacter.stance);
    const maxExtraPsy = activeSpell.augmentable
      ? Math.max(0, selectedCharacter.psy.current - baseCost)
      : 0;

    setQuickCastDraft({
      ...quickCastDraft,
      extraPsy: clampValue(quickCastDraft.extraPsy + delta, maxExtraPsy),
    });
  }

  const quickActions = [
    {
      id: "damage",
      title: "Prendre des degats",
      description: "Le bouclier absorbe, l'armure reduit, puis les PV encaissent le reste.",
      icon: "✦",
      tone: "primary" as const,
      onPress: openDamageDialog,
    },
    {
      id: "cast",
      title: "Lancer un don",
      description: "Choisit un don du personnage ou un don ajoute a un equipement.",
      icon: "◌",
      tone: "secondary" as const,
      onPress: openQuickCastDialog,
    },
    {
      id: "recovery",
      title: "Soigner / bouclier",
      description: "Rend des PV ou ajoute un bouclier temporaire rapidement.",
      icon: "+",
      tone: "secondary" as const,
      onPress: openRecoveryDialog,
    },
    {
      id: "stance",
      title: "Position actuelle",
      description: stanceDescriptions[selectedCharacter.stance],
      icon: "◎",
      tone: "secondary" as const,
      value: stanceLabels[selectedCharacter.stance],
      onPress: () =>
        setActiveOverlayMenu((current) => (current === "stance" ? null : "stance")),
    },
  ];

  function renderQuickActions() {
    return (
      <CharacterActions
        actions={quickActions}
        columns={useQuickActionsColumns}
        theme={activeTheme}
      />
    );
  }

  function confirmQuickCast() {
    if (!quickCastDraft || !selectedCharacter) {
      return;
    }

    updateCharacter(selectedCharacter.id, (character) => {
      if (quickCastDraft.kind === "spell" || quickCastDraft.kind === "equipmentSpell") {
        const sourceEquipment =
          quickCastDraft.kind === "equipmentSpell"
            ? character.equipment.find((entry) => entry.id === quickCastDraft.sourceEquipmentId)
            : null;
        const spell =
          quickCastDraft.kind === "spell"
            ? character.spells.find((entry) => entry.id === quickCastDraft.id)
            : sourceEquipment
              ? getEquipmentGrantedSpells(sourceEquipment).find(
                  (entry) => entry.id === quickCastDraft.id,
                )
              : undefined;

        if (!spell) {
          return character;
        }

        const maxExtraPsy = spell.augmentable
          ? Math.max(0, character.psy.current - getSpellCost(spell, character.stance))
          : 0;
        const extraPsy = clampValue(quickCastDraft.extraPsy, maxExtraPsy);
        const cost = getScaledSpellCost(spell, character.stance, extraPsy);

        if (character.psy.current < cost) {
          setRosterMessage(`PSY insuffisante pour ${spell.name}.`);
          return character;
        }

        setRosterMessage(
          extraPsy > 0
            ? `${
                quickCastDraft.kind === "equipmentSpell" && quickCastDraft.sourceEquipmentId
                  ? `${spell.name} lance via equipement`
                  : `${spell.name} lance`
              } · -${cost} PSY · +${extraPsy} PSY injecte.`
            : `${
                quickCastDraft.kind === "equipmentSpell" && quickCastDraft.sourceEquipmentId
                  ? `${spell.name} lance via equipement`
                  : `${spell.name} lance`
              } · -${cost} PSY.`,
        );

        return {
          ...character,
          psy: {
            ...character.psy,
            current: character.psy.current - cost,
          },
          activeSpellIds: character.activeSpellIds.includes(spell.id)
            ? character.activeSpellIds
            : [...character.activeSpellIds, spell.id],
        };
      }

      return character;
    });

    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function applyRecovery() {
    if (!recoveryDraft || !selectedCharacter) {
      return;
    }

    const amount = Math.max(0, Number.parseInt(recoveryDraft.amount || "0", 10) || 0);

    if (amount <= 0) {
      setRecoveryDraft(null);
      return;
    }

    updateCharacter(selectedCharacter.id, (character) => {
      if (recoveryDraft.mode === "heal") {
        const nextPv = clampValue(character.pv.current + amount, character.pv.max);
        const healed = nextPv - character.pv.current;
        setRosterMessage(`Soin applique · +${healed} PV.`);

        return {
          ...character,
          pv: {
            ...character.pv,
            current: nextPv,
          },
        };
      }

      setRosterMessage(`Bouclier ajoute · +${amount}.`);
      return {
        ...character,
        pv: {
          ...character.pv,
          bonus: character.pv.bonus + amount,
        },
      };
    });

    setRecoveryDraft(null);
  }

  function toggleSpellActive(characterId: string, spellId: string) {
    updateCharacter(characterId, (character) => {
      const isActive = character.activeSpellIds.includes(spellId);

      return {
        ...character,
        activeSpellIds: isActive
          ? character.activeSpellIds.filter((id) => id !== spellId)
          : [...character.activeSpellIds, spellId],
      };
    });
  }

  function openEditor() {
    if (Date.now() < suppressEditorOpenUntilRef.current || draftCharacter) {
      return;
    }

    setEditorSection("all");
    setExpandedEditorCardIds(new Set());
    setDraftCharacter(cloneTemplate(selectedCharacter!));
    setDeleteCharacterConfirm(false);
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function openSectionEditor(section: EditorSection) {
    if (Date.now() < suppressEditorOpenUntilRef.current || draftCharacter) {
      return;
    }

    setEditorSection(section);
    setExpandedEditorCardIds(new Set());
    setDraftCharacter(cloneTemplate(selectedCharacter!));
    setDeleteCharacterConfirm(false);
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function suppressEditorReopen() {
    suppressEditorOpenUntilRef.current = Date.now() + EDITOR_REOPEN_SUPPRESSION_MS;
  }

  function closeEditor() {
    suppressEditorReopen();
    setActiveOverlayMenu(null);
    setEditorSection("all");
    setExpandedEditorCardIds(new Set());
    setDraftCharacter(null);
    setDeleteCharacterConfirm(false);
    setImageLibraryTarget(null);
    setImageLibraryQuery("");
    setDamageDraft(null);
    setRecoveryDraft(null);
    setQuickCastDraft(null);
  }

  function saveEditor() {
    if (!draftCharacter) {
      return;
    }

    const savedCharacter = normalizeCharacter(cloneTemplate(draftCharacter));

    suppressEditorReopen();
    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === savedCharacter.id ? savedCharacter : character,
      ),
    );
    setActiveOverlayMenu(null);
    setEditorSection("all");
    setExpandedEditorCardIds(new Set());
    setDraftCharacter(null);
    setDeleteCharacterConfirm(false);
    setImageLibraryTarget(null);
    setImageLibraryQuery("");
    setQuickCastDraft(null);
  }

  function deleteDraftCharacter() {
    if (!draftCharacter) {
      return;
    }

    if (characters.length <= 1) {
      setRosterMessage("Impossible de supprimer le dernier personnage.");
      return;
    }

    const remainingCharacters = characters.filter(
      (character) => character.id !== draftCharacter.id,
    );

    setCharacters(remainingCharacters);
    setSelectedId(remainingCharacters[0]!.id);
    suppressEditorReopen();
    setDraftCharacter(null);
    setDeleteCharacterConfirm(false);
    setImageLibraryTarget(null);
    setImageLibraryQuery("");
    setActiveOverlayMenu(null);
    setEditorSection("all");
    setExpandedEditorCardIds(new Set());
    setQuickCastDraft(null);
    setRosterMessage(`${draftCharacter.name} a ete supprime.`);
  }

  function getImageLibraryCategory(target: ImageLibraryTarget): ImageLibraryCategory {
    switch (target.kind) {
      case "character":
        return "character";
      case "spell":
      case "equipmentSpell":
        return "spell";
      case "equipment":
        return "equipment";
      case "inventory":
        return "inventory";
    }
  }

  function getImageLibraryTitle(target: ImageLibraryTarget) {
    switch (target.kind) {
      case "character":
        return "Choisir une image de personnage";
      case "spell":
        return "Choisir une image de don";
      case "equipmentSpell":
        return "Choisir une image de don associe";
      case "equipment":
        return "Choisir une image d'equipement";
      case "inventory":
        return "Choisir une image d'inventaire";
    }
  }

  function updateDraftImage(
    target: ImageLibraryTarget,
    image: { imageModule?: ImageModule; imageUrl?: string },
  ) {
    setDraftCharacter((current) => {
      if (!current) {
        return current;
      }

      const imagePatch = {
        imageModule: image.imageModule,
        imageUrl: image.imageUrl,
      };

      switch (target.kind) {
        case "character":
          return { ...current, ...imagePatch };
        case "spell":
          return {
            ...current,
            spells: current.spells.map((spell, index) =>
              index === target.index ? { ...spell, ...imagePatch } : spell,
            ),
          };
        case "equipment":
          return {
            ...current,
            equipment: current.equipment.map((item, index) =>
              index === target.index ? { ...item, ...imagePatch } : item,
            ),
          };
        case "equipmentSpell":
          return {
            ...current,
            equipment: current.equipment.map((item, index) =>
              index === target.index && item.grantedSpells?.[target.spellIndex]
                ? {
                    ...item,
                    grantedSpells: item.grantedSpells.map((spell, spellIndex) =>
                      spellIndex === target.spellIndex ? { ...spell, ...imagePatch } : spell,
                    ),
                  }
                : item,
            ),
          };
        case "inventory":
          return {
            ...current,
            inventory: current.inventory.map((item, index) =>
              index === target.index ? { ...item, ...imagePatch } : item,
            ),
          };
      }
    });
  }

  function applyLocalImage(target: ImageLibraryTarget, option: LocalImageOption) {
    updateDraftImage(target, { imageModule: option.imageModule, imageUrl: undefined });

    setImageLibraryTarget(null);
    setImageLibraryQuery("");
  }

  function clearImageSelection(target: ImageLibraryTarget) {
    updateDraftImage(target, { imageModule: undefined, imageUrl: undefined });

    setImageLibraryTarget(null);
    setImageLibraryQuery("");
  }

  function updateDraftField<Key extends keyof Character>(
    key: Key,
    value: Character[Key],
  ) {
    setDraftCharacter((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateDraftResource(
    key: "pv" | "psy" | "armor",
    field: keyof ResourcePool,
    rawValue: string,
  ) {
    const nextValue = Math.max(0, Number.parseInt(rawValue || "0", 10) || 0);

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            [key]: {
              ...current[key],
              [field]: key === "psy" && field === "bonus" ? 0 : nextValue,
            },
          }
        : current,
    );
  }

  function updateDraftStat(statKey: keyof Character["stats"], rawValue: string) {
    const nextValue = Math.max(0, Number.parseInt(rawValue || "0", 10) || 0);

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            stats: {
              ...current.stats,
              [statKey]: nextValue,
            },
          }
        : current,
    );
  }

  function updateDraftAttackBonus(rawValue: string) {
    const nextValue = Math.max(0, Number.parseInt(rawValue || "0", 10) || 0);

    updateDraftField("attackBonus", nextValue);
  }

  function parseSignedDraftNumber(rawValue: string) {
    return Number.parseInt(rawValue || "0", 10) || 0;
  }

  function updateDraftSkill(index: number, patch: Partial<Skill>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            skills: current.skills.map((skill, skillIndex) =>
              skillIndex === index ? { ...skill, ...patch } : skill,
            ),
          }
        : current,
    );
  }

  function addDraftSkill() {
    const id = makeId("skill");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            skills: [
              ...current.skills,
              { id, name: "Nouvelle competence", value: 0 },
            ],
          }
        : current,
    );
    expandEditorCard(getEditorCardId("skill", id));
  }

  function removeDraftSkill(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            skills: current.skills.filter((_, skillIndex) => skillIndex !== index),
          }
        : current,
    );
  }

  function applyArchetypeTemplate(archetypeId: ArchetypeId) {
    const archetypeOption = ARCHETYPE_OPTIONS.find((option) => option.id === archetypeId);

    if (!archetypeOption) {
      return;
    }

    setDraftCharacter((current) =>
      current
        ? (() => {
            const specialization = archetypeOption.specializations.includes(
              current.specialization ?? "",
            )
              ? current.specialization
              : archetypeOption.specializations[0] ?? "";

            return {
              ...current,
              archetypeId: archetypeOption.id,
              archetype: archetypeOption.label,
              specialization,
            };
          })()
        : current,
    );
    setActiveOverlayMenu(null);
  }

  function updateDraftSpecialization(value: string) {
    updateDraftField("specialization", value);
    setActiveOverlayMenu(null);
  }

  function updateDraftSpell(index: number, patch: Partial<Spell>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            spells: current.spells.map((spell, spellIndex) =>
              spellIndex === index ? { ...spell, ...patch } : spell,
            ),
          }
        : current,
    );
  }

  function addDraftSpell() {
    const id = makeId("spell");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            spells: [
              {
                id,
                name: "Nouveau don",
                icon: "✦",
                basePsyCost: 0,
                armorBonus: 0,
                damageBonus: 0,
                reducible: true,
                augmentable: false,
                description: "",
                tags: [],
                activeEffects: [],
                passiveEffects: [],
              },
              ...current.spells,
            ],
          }
        : current,
    );
    expandEditorCard(getEditorCardId("spell", id));
  }

  function removeDraftSpell(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            spells: current.spells.filter((_, spellIndex) => spellIndex !== index),
          }
        : current,
    );
  }

  function updateDraftStatusEffect(index: number, patch: Partial<StatusEffect>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            statusEffects: current.statusEffects.map((effect, effectIndex) =>
              effectIndex === index ? { ...effect, ...patch } : effect,
            ),
          }
        : current,
    );
  }

  function updateDraftStatusEffectBonus(
    index: number,
    bonusKey: StatusEffectBonusKey,
    rawValue: string,
  ) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            statusEffects: current.statusEffects.map((effect, effectIndex) =>
              effectIndex === index
                ? {
                    ...effect,
                    bonuses: {
                      attackBonus: 0,
                      armorBonus: 0,
                      pvBonus: 0,
                      shieldBonus: 0,
                      ...effect.bonuses,
                      [bonusKey]: parseSignedDraftNumber(rawValue),
                    },
                  }
                : effect,
            ),
          }
        : current,
    );
  }

  function addDraftStatusEffect() {
    const id = makeId("status");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            statusEffects: [
              ...current.statusEffects,
              {
                id,
                name: "Nouveau buff",
                description: "",
                category: "buff",
                source: "",
                durationTurns: 1,
                active: true,
                tags: [],
                bonuses: {
                  attackBonus: 0,
                  armorBonus: 0,
                  pvBonus: 0,
                  shieldBonus: 0,
                },
              },
            ],
          }
        : current,
    );
    expandEditorCard(getEditorCardId("effect", id));
  }

  function removeDraftStatusEffect(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            statusEffects: current.statusEffects.filter((_, effectIndex) => effectIndex !== index),
          }
        : current,
    );
  }

  function updateDraftResistance(index: number, patch: Partial<ResistanceProfile>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            resistances: current.resistances.map((entry, entryIndex) =>
              entryIndex === index ? { ...entry, ...patch } : entry,
            ),
          }
        : current,
    );
  }

  function addDraftResistance() {
    const id = makeId("resistance");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            resistances: [
              ...current.resistances,
              {
                id,
                label: "Nouvelle affinite",
                type: "resistance",
                notes: "",
              },
            ],
          }
        : current,
    );
    expandEditorCard(getEditorCardId("resistance", id));
  }

  function removeDraftResistance(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            resistances: current.resistances.filter((_, entryIndex) => entryIndex !== index),
          }
        : current,
    );
  }

  function updateDraftInventory(index: number, patch: Partial<InventoryItem>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            inventory: current.inventory.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  }

  function addDraftInventoryItem() {
    const id = makeId("item");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            inventory: [
              {
                id,
                name: "Nouvel item",
                icon: "📦",
                quantity: 1,
                notes: "",
                tags: [],
              },
              ...current.inventory,
            ],
          }
        : current,
    );
    expandEditorCard(getEditorCardId("inventory", id));
  }

  function removeDraftInventoryItem(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            inventory: current.inventory.filter((_, itemIndex) => itemIndex !== index),
          }
        : current,
    );
  }

  function updateDraftEquipment(index: number, patch: Partial<EquipmentItem>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.map((item, itemIndex) =>
              itemIndex === index ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
  }

  function updateDraftEquipmentGrantedSpell(
    index: number,
    spellIndex: number,
    patch: Partial<Spell>,
  ) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.map((item, itemIndex) => {
              if (itemIndex !== index) {
                return item;
              }

              return {
                ...item,
                grantedSpells: (item.grantedSpells ?? []).map((spell, currentSpellIndex) =>
                  currentSpellIndex === spellIndex ? { ...spell, ...patch } : spell,
                ),
              };
            }),
          }
        : current,
    );
  }

  function addDraftEquipmentGrantedSpell(index: number) {
    const id = makeId("equipment-spell");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.map((item, itemIndex) => {
              if (itemIndex !== index) {
                return item;
              }

              return {
                ...item,
                grantedSpells: [
                  {
                    id,
                    name: `Don de ${item.name}`,
                    basePsyCost: 0,
                    armorBonus: 0,
                    damageBonus: 0,
                    reducible: true,
                    augmentable: false,
                    description: "",
                    tags: [],
                    activeEffects: [],
                    passiveEffects: [],
                  },
                  ...(item.grantedSpells ?? []),
                ],
              };
            }),
          }
        : current,
    );
    expandEditorCard(getEditorCardId("equipmentSpell", id));
  }

  function removeDraftEquipmentGrantedSpell(index: number, spellIndex: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    grantedSpells: (item.grantedSpells ?? []).filter(
                      (_, currentSpellIndex) => currentSpellIndex !== spellIndex,
                    ),
                  }
                : item,
            ),
          }
        : current,
    );
  }

  function addDraftEquipment() {
    const id = makeId("equipment");

    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: [
              {
                id,
                name: "Nouvel equipement",
                category: "Objet",
                icon: "🧰",
                notes: "",
                armorBonus: 0,
                tags: [],
                activeEffects: [],
                passiveEffects: [],
                grantedSpells: [],
              },
              ...current.equipment,
            ],
          }
        : current,
    );
    expandEditorCard(getEditorCardId("equipment", id));
  }

  function removeDraftEquipment(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.filter((_, itemIndex) => itemIndex !== index),
          }
        : current,
    );
  }

  async function pickImageUri() {
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];

    return asset?.uri
      ? {
          uri: asset.uri,
          mimeType: asset.mimeType,
          fileName: asset.fileName,
        }
      : null;
  }

  async function uploadCustomImage(target: ImageLibraryTarget) {
    const selectedImage = await pickImageUri();

    if (!selectedImage) {
      return;
    }

    let uri: string;

    try {
      uri = await persistCustomImage(
        selectedImage.uri,
        selectedImage.mimeType,
        selectedImage.fileName,
      );
    } catch {
      setRosterMessage("Impossible de copier cette image dans le stockage de l'app.");
      return;
    }

    updateDraftImage(target, { imageUrl: uri, imageModule: undefined });

    setImageLibraryTarget(null);
    setImageLibraryQuery("");
  }

  function stepStatusDuration(characterId: string, statusId: string, delta: number) {
    updateCharacter(characterId, (character) => ({
      ...character,
      statusEffects: character.statusEffects.map((effect) => {
        if (effect.id !== statusId || effect.durationTurns === null) {
          return effect;
        }

        const nextDuration = Math.max(0, effect.durationTurns + delta);
        return {
          ...effect,
          durationTurns: nextDuration,
          active: nextDuration > 0 ? effect.active : false,
        };
      }),
    }));
  }

  function toggleStatusActive(characterId: string, statusId: string) {
    updateCharacter(characterId, (character) => ({
      ...character,
      statusEffects: character.statusEffects.map((effect) =>
        effect.id === statusId ? { ...effect, active: !effect.active } : effect,
      ),
    }));
  }

  return (
    <View style={[styles.root, { backgroundColor: activeTheme.pageBg }]}>
    <AppNavbar
      activeRoute="character"
      compact={isPhone}
      titleColor={activeTheme.title}
      subtitleColor={activeTheme.subtitle}
      panelColor={activeTheme.panelBg}
      borderColor={activeTheme.border}
      accentColor={activeTheme.accent}
      onOpenHome={onOpenHome}
      onOpenHistory={onOpenHistory}
      onOpenCharacter={() => undefined}
    />
    <ScrollView
      style={[styles.scroll, { backgroundColor: activeTheme.pageBg }]}
      contentContainerStyle={[
        styles.content,
        isPhone ? styles.contentPhone : isDesktop ? styles.contentLaptop : styles.contentTablet,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <CharacterSheetBackdrop theme={activeTheme} />

      <CharacterResume
        character={selectedCharacter}
        characterBioPreview={characterBioPreview}
        isPhone={isPhone}
        theme={activeTheme}
        useWideHero={useWideHero}
        onEditIdentity={() => openSectionEditor("identity")}
        onToggleBio={() =>
          setActiveOverlayMenu((current) => (current === "bioView" ? null : "bioView"))
        }
      />

      {draftCharacter ? (
        <EditorModal
          characterName={draftCharacter.name}
          editorSection={editorSection}
          ghostButtonLabelStyle={editorGhostButtonLabelStyle}
          ghostButtonStyle={editorGhostButtonStyle}
          primaryButtonLabelStyle={editorPrimaryButtonLabelStyle}
          primaryButtonStyle={editorPrimaryButtonStyle}
          theme={activeTheme}
          onCancel={closeEditor}
          onRequestClose={closeEditor}
          onSave={saveEditor}
          onSuppressReopen={suppressEditorReopen}
        >
        <EditorFieldThemeProvider
          value={{
            label: activeTheme.subtitle,
            inputBg: activeTheme.chipBg,
            inputBorder: activeTheme.border,
            inputText: activeTheme.title,
            placeholder: activeTheme.subtitle,
          }}
        >
        <View style={styles.editorFormSurface}>
          {editingAll || editorSection === "identity" ? (
          <>
          <View style={styles.editorGrid}>
            <EditorField
              label="Nom"
              value={draftCharacter.name}
              onChangeText={(value) => updateDraftField("name", value)}
            />
            <View style={[styles.editorField, styles.editorFieldOverlayTop]}>
              <Text style={[styles.editorFieldLabel, { color: activeTheme.subtitle }]}>
                Archetype
              </Text>
              <View style={styles.editorDropdownWrap}>
                <Pressable
                  onPress={() =>
                    setActiveOverlayMenu((current) =>
                      current === "editorArchetype" ? null : "editorArchetype",
                    )
                  }
                  style={[
                    styles.editorSelectButton,
                    {
                      backgroundColor: activeTheme.chipBg,
                      borderColor: activeTheme.border,
                    },
                  ]}
                >
                  <Text style={[styles.editorSelectValue, { color: activeTheme.title }]}>
                    {selectedArchetypeOption.label}
                  </Text>
                  <Text style={[styles.editorSelectChevron, { color: activeTheme.title }]}>
                    ▾
                  </Text>
                </Pressable>
              </View>
              <Text style={editorHintStyle}>
                {selectedArchetypeOption.description}
              </Text>
            </View>
            <View style={[styles.editorField, styles.editorFieldOverlayMid]}>
              <Text style={[styles.editorFieldLabel, { color: activeTheme.subtitle }]}>
                Specialisation
              </Text>
              <View style={styles.editorDropdownWrap}>
                <Pressable
                  onPress={() =>
                    setActiveOverlayMenu((current) =>
                      current === "editorSpecialization" ? null : "editorSpecialization",
                    )
                  }
                  style={[
                    styles.editorSelectButton,
                    {
                      backgroundColor: activeTheme.chipBg,
                      borderColor: activeTheme.border,
                    },
                  ]}
                >
                  <Text style={[styles.editorSelectValue, { color: activeTheme.title }]}>
                    {draftCharacter.specialization || "Choisir"}
                  </Text>
                  <Text style={[styles.editorSelectChevron, { color: activeTheme.title }]}>
                    ▾
                  </Text>
                </Pressable>
              </View>
            </View>
            <EditorField
              label="Niveau"
              value={String(draftCharacter.level ?? 0)}
              keyboardType="numeric"
              onChangeText={(value) =>
                updateDraftField("level", Number.parseInt(value || "0", 10) || 0)
              }
            />
          </View>
          <View style={styles.editorGroup}>
            <View style={styles.editorToggleRow}>
              <Text style={editorSectionTitleStyle}>Rang</Text>
              <View style={styles.editorToggleGroup}>
                {CHARACTER_RANKS.map((rank) => {
                  const active = (draftCharacter.rank ?? "5") === rank;

                  return (
                    <Pressable
                      key={rank}
                      onPress={() => updateDraftField("rank", rank)}
                      style={getEditorToggleButtonStyle(active)}
                    >
                      <Text style={getEditorToggleButtonLabelStyle(active)}>
                        {rank}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Text style={editorHintStyle}>
              Le rang 5 est le plus bas; S est au-dessus du rang 1.
            </Text>
          </View>
          <View style={styles.editorGroup}>
            <Text style={editorSectionTitleStyle}>Theme</Text>
            <View style={styles.editorThemeControlRow}>
              <View style={[styles.editorDropdownWrap, styles.editorThemeDropdownWrap]}>
                <Pressable
                  onPress={() =>
                    setActiveOverlayMenu((current) =>
                      current === "editorTheme" ? null : "editorTheme",
                    )
                  }
                  style={[
                    styles.editorSelectButton,
                    {
                      backgroundColor: activeTheme.chipBg,
                      borderColor: activeTheme.border,
                    },
                  ]}
                >
                  <Text style={[styles.editorSelectValue, { color: activeTheme.title }]}>
                    {THEME_LABELS[draftCharacter.theme]}
                  </Text>
                  <Text style={[styles.editorSelectChevron, { color: activeTheme.title }]}>▾</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={toggleCardBackgrounds}
                style={[
                  styles.cardBackgroundToggle,
                  styles.editorCardBackgroundToggle,
                  {
                    backgroundColor: draftCardBackgroundsEnabled ? activeTheme.buttonBg : activeTheme.chipBg,
                    borderColor: draftCardBackgroundsEnabled ? activeTheme.accent : activeTheme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardBackgroundToggleLabel,
                    { color: draftCardBackgroundsEnabled ? activeTheme.buttonText : activeTheme.title },
                  ]}
                  numberOfLines={2}
                >
                  {draftCardBackgroundsEnabled ? "Fonds cards actifs" : "Fonds cards inactifs"}
                </Text>
              </Pressable>
            </View>
            <Text style={editorHintStyle}>{THEME_DESCRIPTIONS[draftCharacter.theme]}</Text>
          </View>
          <Pressable
            onPress={() =>
              setActiveOverlayMenu((current) => (current === "bioEdit" ? null : "bioEdit"))
            }
            style={[
              styles.editorBioButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.editorBioButtonLabel, { color: activeTheme.title }]}>
              {draftCharacter.bio ? "Editer la bio" : "Ajouter une bio"}
            </Text>
            <Text style={[styles.editorBioButtonHint, { color: activeTheme.subtitle }]}>
              Ouvre un dialog dedie pour les biographies longues.
            </Text>
          </Pressable>
          <View style={styles.editorMediaRow}>
            <AssetVisual
              label={draftCharacter.name}
              imageUrl={draftCharacter.imageUrl}
              imageModule={draftCharacter.imageModule}
              icon={draftCharacter.name.slice(0, 1)}
              character
            />
            <Pressable
              onPress={() => {
                setImageLibraryTarget({ kind: "character" });
              }}
              style={editorUploadButtonStyle}
            >
              <Text style={editorUploadButtonLabelStyle}>Choisir une image</Text>
            </Pressable>
          </View>
          <View
            style={[
              styles.editorDeletePanel,
              {
                backgroundColor: activeTheme.panelBg,
                borderColor: deleteCharacterConfirm ? activeTheme.accent : activeTheme.border,
              },
            ]}
          >
            <Text style={[styles.editorDeleteTitle, { color: activeTheme.title }]}>
              Supprimer le personnage
            </Text>
            <Text style={[styles.editorDeleteHint, { color: activeTheme.subtitle }]}>
              Cette action retire definitivement la fiche active.
            </Text>
            {deleteCharacterConfirm ? (
              <View style={styles.editorDeleteActions}>
                <Pressable
                  onPress={() => setDeleteCharacterConfirm(false)}
                  style={editorGhostButtonStyle}
                >
                  <Text style={editorGhostButtonLabelStyle}>Annuler</Text>
                </Pressable>
                <Pressable
                  onPress={deleteDraftCharacter}
                  style={editorDangerButtonStyle}
                >
                  <Text style={editorDangerButtonLabelStyle}>Confirmer la suppression</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setDeleteCharacterConfirm(true)}
                style={editorDangerButtonStyle}
              >
                <Text style={editorDangerButtonLabelStyle}>Supprimer le personnage</Text>
              </Pressable>
            )}
          </View>
          </>
          ) : null}

          {editingAll || editorSection === "resources" ? (
          <View style={styles.editorGroup}>
            <Text style={editorSectionTitleStyle}>Ressources</Text>
            {([
              ["pv", "PV"],
              ["psy", "PSY"],
              ["armor", "Armure"],
            ] as const).map(([key, label]) => (
              <View key={key} style={styles.editorResourceBlock}>
                <Text style={[styles.editorResourceTitle, { color: activeTheme.accent }]}>{label}</Text>
                <View style={styles.editorGrid}>
                  <EditorField
                    label="Actuel"
                    value={String(draftCharacter[key].current)}
                    keyboardType="numeric"
                    onChangeText={(value) => updateDraftResource(key, "current", value)}
                  />
                  <EditorField
                    label="Max"
                    value={String(draftCharacter[key].max)}
                    keyboardType="numeric"
                    onChangeText={(value) => updateDraftResource(key, "max", value)}
                  />
                  {key !== "psy" ? (
                    <EditorField
                      label={key === "pv" ? "Bouclier" : "Bonus"}
                      value={String(draftCharacter[key].bonus)}
                      keyboardType="numeric"
                      onChangeText={(value) => updateDraftResource(key, "bonus", value)}
                    />
                  ) : null}
                </View>
              </View>
            ))}
            <View style={styles.editorResourceBlock}>
              <Text style={[styles.editorResourceTitle, { color: activeTheme.accent }]}>
                Attaque
              </Text>
              <View style={styles.editorGrid}>
                <EditorField
                  label="Bonus d'attaque"
                  value={String(draftCharacter.attackBonus)}
                  keyboardType="numeric"
                  onChangeText={updateDraftAttackBonus}
                />
              </View>
            </View>
          </View>
          ) : null}

          {editingAll || editorSection === "stats" ? (
          <View style={styles.editorGroup}>
            <Text style={editorSectionTitleStyle}>Stats</Text>
            <View style={styles.editorGrid}>
              {(Object.entries(draftCharacter.stats) as Array<
                [keyof Character["stats"], number]
              >).map(([statKey, value]) => (
                <EditorField
                  key={statKey}
                  label={statKey}
                  value={String(value)}
                  keyboardType="numeric"
                  onChangeText={(nextValue) => updateDraftStat(statKey, nextValue)}
                />
              ))}
            </View>
          </View>
          ) : null}

          {editingAll || editorSection === "effects" ? (
            <StatusEffectsEditorSection
              statusEffects={draftCharacter.statusEffects}
              editorAddButtonLabelStyle={editorAddButtonLabelStyle}
              editorAddButtonStyle={editorAddButtonStyle}
              editorCardStyle={editorCardStyle}
              editorCardTitleStyle={editorCardTitleStyle}
              editorHintStyle={editorHintStyle}
              editorInlineLabelStyle={editorInlineLabelStyle}
              editorSectionTitleStyle={editorSectionTitleStyle}
              getEditorCardId={getEditorCardId}
              getEditorRemoveButtonLabelStyle={getEditorRemoveButtonLabelStyle}
              getEditorRemoveButtonStyle={getEditorRemoveButtonStyle}
              getEditorToggleButtonLabelStyle={getEditorToggleButtonLabelStyle}
              getEditorToggleButtonStyle={getEditorToggleButtonStyle}
              isEditorCardExpanded={isEditorCardExpanded}
              onAdd={addDraftStatusEffect}
              onRemove={removeDraftStatusEffect}
              onToggleEditorCard={toggleEditorCard}
              onUpdate={updateDraftStatusEffect}
              onUpdateBonus={updateDraftStatusEffectBonus}
              theme={activeTheme}
            />
          ) : null}

          {editingAll || editorSection === "resistances" ? (
            <ResistancesEditorSection
              resistances={draftCharacter.resistances}
              editorAddButtonLabelStyle={editorAddButtonLabelStyle}
              editorAddButtonStyle={editorAddButtonStyle}
              editorCardStyle={editorCardStyle}
              editorCardTitleStyle={editorCardTitleStyle}
              editorSectionTitleStyle={editorSectionTitleStyle}
              getEditorCardId={getEditorCardId}
              getEditorRemoveButtonLabelStyle={getEditorRemoveButtonLabelStyle}
              getEditorRemoveButtonStyle={getEditorRemoveButtonStyle}
              isEditorCardExpanded={isEditorCardExpanded}
              onAdd={addDraftResistance}
              onRemove={removeDraftResistance}
              onToggleEditorCard={toggleEditorCard}
              onUpdate={updateDraftResistance}
              theme={activeTheme}
            />
          ) : null}

          {editingAll || editorSection === "skills" ? (
            <SkillsEditorSection
              skills={draftCharacter.skills}
              editorAddButtonLabelStyle={editorAddButtonLabelStyle}
              editorAddButtonStyle={editorAddButtonStyle}
              editorCardStyle={editorCardStyle}
              editorCardTitleStyle={editorCardTitleStyle}
              editorSectionTitleStyle={editorSectionTitleStyle}
              getEditorCardId={getEditorCardId}
              getEditorRemoveButtonLabelStyle={getEditorRemoveButtonLabelStyle}
              getEditorRemoveButtonStyle={getEditorRemoveButtonStyle}
              isEditorCardExpanded={isEditorCardExpanded}
              onAdd={addDraftSkill}
              onRemove={removeDraftSkill}
              onToggleEditorCard={toggleEditorCard}
              onUpdate={updateDraftSkill}
              theme={activeTheme}
            />
          ) : null}

          {editingAll || editorSection === "spells" ? (
            <DonEditorSection
              draftCharacter={draftCharacter}
              editorAddButtonLabelStyle={editorAddButtonLabelStyle}
              editorAddButtonStyle={editorAddButtonStyle}
              editorCardStyle={editorCardStyle}
              editorCardTitleStyle={editorCardTitleStyle}
              editorInlineLabelStyle={editorInlineLabelStyle}
              editorSectionTitleStyle={editorSectionTitleStyle}
              editorUploadButtonLabelStyle={editorUploadButtonLabelStyle}
              editorUploadButtonStyle={editorUploadButtonStyle}
              getEditorRemoveButtonLabelStyle={getEditorRemoveButtonLabelStyle}
              getEditorRemoveButtonStyle={getEditorRemoveButtonStyle}
              getEditorToggleButtonLabelStyle={getEditorToggleButtonLabelStyle}
              getEditorToggleButtonStyle={getEditorToggleButtonStyle}
              getEditorCardId={getEditorCardId}
              isEditorCardExpanded={isEditorCardExpanded}
              onAddDraftSpell={addDraftSpell}
              onRemoveDraftSpell={removeDraftSpell}
              onSetImageLibraryTarget={setImageLibraryTarget}
              onToggleEditorCard={toggleEditorCard}
              onUpdateDraftSpell={updateDraftSpell}
              theme={activeTheme}
            />
          ) : null}

          {editingAll || editorSection === "equipment" ? (
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={editorSectionTitleStyle}>Equipements</Text>
              <Pressable onPress={addDraftEquipment} style={editorAddButtonStyle}>
                <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.equipment.map((item, index) => {
                const cardId = getEditorCardId("equipment", item.id);
                const expanded = isEditorCardExpanded(cardId);
                const tags = formatEditorTags(item.tags);
                const equipmentGrantedSpells = item.grantedSpells ?? [];

                return (
                <EditorCollapsibleCard
                  key={item.id}
                  title={compactText(item.name, "Equipement sans nom")}
                  subtitle={[
                    compactText(item.category, "Objet"),
                    item.armorBonus ? `Armure +${item.armorBonus}` : null,
                    equipmentGrantedSpells.length
                      ? `Dons: ${equipmentGrantedSpells
                          .slice(0, 2)
                          .map((spell) => compactText(spell.name, "Sans nom"))
                          .join(", ")}${equipmentGrantedSpells.length > 2 ? "..." : ""}`
                      : null,
                    tags,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  expanded={expanded}
                  cardStyle={editorCardStyle}
                  titleStyle={editorCardTitleStyle}
                  removeButtonStyle={getEditorRemoveButtonStyle()}
                  removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
                  onRemove={() => removeDraftEquipment(index)}
                  onToggle={() => toggleEditorCard(cardId)}
                >
                  <View style={styles.editorGrid}>
                    <EditorField
                      label="Nom"
                      value={item.name}
                      onChangeText={(value) =>
                        updateDraftEquipment(index, { name: value })
                      }
                    />
                    <EditorField
                      label="Categorie"
                      value={item.category}
                      onChangeText={(value) =>
                        updateDraftEquipment(index, { category: value })
                      }
                    />
                    <TagEditorField
                      tags={item.tags}
                      onChangeTags={(tags) => updateDraftEquipment(index, { tags })}
                    />
                    <EditorField
                      label="Bonus armure"
                      value={String(item.armorBonus ?? 0)}
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        updateDraftEquipment(index, {
                          armorBonus: Math.max(0, Number.parseInt(value || "0", 10) || 0),
                        })
                      }
                    />
                  </View>
                  <View style={styles.editorMediaRow}>
                    <AssetVisual
                      label={item.name}
                      icon={item.icon}
                      imageUrl={item.imageUrl}
                      imageModule={item.imageModule}
                    />
                    <Pressable
                      onPress={() => {
                        setImageLibraryTarget({ kind: "equipment", index });
                      }}
                      style={editorUploadButtonStyle}
                    >
                      <Text style={editorUploadButtonLabelStyle}>
                        Choisir une image
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorResourceBlock}>
                    <View style={styles.editorGroupHeader}>
                      <Text style={[styles.editorResourceTitle, { color: activeTheme.accent }]}>
                        Dons associes
                      </Text>
                      <Pressable
                        onPress={() => addDraftEquipmentGrantedSpell(index)}
                        style={editorAddButtonStyle}
                      >
                        <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
                      </Pressable>
                    </View>
                    {equipmentGrantedSpells.map((spell, spellIndex) => {
                      const spellCardId = getEditorCardId("equipmentSpell", spell.id);
                      const spellTags = formatEditorTags(spell.tags);

                      return (
                      <EditorCollapsibleCard
                        key={spell.id}
                        title={compactText(spell.name, `Don ${spellIndex + 1}`)}
                        subtitle={[
                          `${spell.basePsyCost} PSY`,
                          spell.armorBonus ? `Armure +${spell.armorBonus}` : null,
                          spell.damageBonus ? `Degats +${spell.damageBonus}` : null,
                          spell.reducible ? "Reductible" : null,
                          spell.augmentable ? "Augmentable" : null,
                          spellTags,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        expanded={isEditorCardExpanded(spellCardId)}
                        cardStyle={[
                          styles.editorCard,
                          {
                            backgroundColor: activeTheme.panelBg,
                            borderColor: activeTheme.border,
                          },
                        ]}
                        titleStyle={editorCardTitleStyle}
                        removeButtonStyle={getEditorRemoveButtonStyle()}
                        removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
                        onRemove={() => removeDraftEquipmentGrantedSpell(index, spellIndex)}
                        onToggle={() => toggleEditorCard(spellCardId)}
                      >
                      <View style={styles.editorGrid}>
                        <EditorField
                          label="Nom"
                          value={spell.name}
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, { name: value })
                          }
                        />
                        <TagEditorField
                          tags={spell.tags}
                          onChangeTags={(tags) =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, { tags })
                          }
                        />
                        <EditorField
                          label="Cout PSY"
                          value={String(spell.basePsyCost)}
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, {
                              basePsyCost: Math.max(
                                0,
                                Number.parseInt(value || "0", 10) || 0,
                              ),
                            })
                          }
                        />
                        <EditorField
                          label="Bonus d'armure (actif)"
                          value={String(spell.armorBonus ?? 0)}
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, {
                              armorBonus: Math.max(
                                0,
                                Number.parseInt(value || "0", 10) || 0,
                              ),
                            })
                          }
                        />
                        <EditorField
                          label="Bonus de degats (actif)"
                          value={String(spell.damageBonus ?? 0)}
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, {
                              damageBonus: Math.max(
                                0,
                                Number.parseInt(value || "0", 10) || 0,
                              ),
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
                          onPress={() => {
                            setImageLibraryTarget({ kind: "equipmentSpell", index, spellIndex });
                          }}
                          style={editorUploadButtonStyle}
                        >
                          <Text style={editorUploadButtonLabelStyle}>
                            Choisir une image
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.editorToggleRow}>
                        <Text style={editorInlineLabelStyle}>Reductible en Focus</Text>
                        <Pressable
                          onPress={() =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, {
                              reducible: !spell.reducible,
                            })
                          }
                          style={getEditorToggleButtonStyle(Boolean(spell.reducible))}
                        >
                          <Text
                            style={getEditorToggleButtonLabelStyle(
                              Boolean(spell.reducible),
                            )}
                          >
                            {spell.reducible ? "Oui" : "Non"}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.editorToggleRow}>
                        <Text style={editorInlineLabelStyle}>Augmentable</Text>
                        <Pressable
                          onPress={() =>
                            updateDraftEquipmentGrantedSpell(index, spellIndex, {
                              augmentable: !(spell.augmentable ?? false),
                            })
                          }
                          style={getEditorToggleButtonStyle(Boolean(spell.augmentable))}
                        >
                          <Text
                            style={getEditorToggleButtonLabelStyle(
                              Boolean(spell.augmentable),
                            )}
                          >
                            {spell.augmentable ? "Oui" : "Non"}
                          </Text>
                        </Pressable>
                      </View>
                      <TextInput
                        value={spell.description}
                        onChangeText={(value) =>
                          updateDraftEquipmentGrantedSpell(index, spellIndex, { description: value })
                        }
                        style={[
                          styles.editorInput,
                          styles.editorTextArea,
                          {
                            backgroundColor: activeTheme.chipBg,
                            borderColor: activeTheme.border,
                            color: activeTheme.title,
                          },
                        ]}
                        multiline
                        placeholder="Description du don associe"
                        placeholderTextColor={activeTheme.subtitle}
                      />
                      </EditorCollapsibleCard>
                      );
                    })}
                  </View>
                  <TextInput
                    value={item.notes ?? ""}
                    onChangeText={(value) =>
                      updateDraftEquipment(index, { notes: value })
                    }
                    style={[
                      styles.editorInput,
                      styles.editorTextArea,
                      {
                        backgroundColor: activeTheme.chipBg,
                        borderColor: activeTheme.border,
                        color: activeTheme.title,
                      },
                    ]}
                    multiline
                    placeholder="Notes de l'equipement"
                    placeholderTextColor={activeTheme.subtitle}
                  />
                </EditorCollapsibleCard>
                );
              })}
            </View>
          </View>
          ) : null}

          {editingAll || editorSection === "inventory" ? (
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={editorSectionTitleStyle}>Inventaire</Text>
              <Pressable onPress={addDraftInventoryItem} style={editorAddButtonStyle}>
                <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.inventory.map((item, index) => {
                const cardId = getEditorCardId("inventory", item.id);
                const expanded = isEditorCardExpanded(cardId);
                const tags = formatEditorTags(item.tags);

                return (
                <EditorCollapsibleCard
                  key={item.id}
                  title={compactText(item.name, "Item sans nom")}
                  subtitle={[`Quantite ${item.quantity}`, tags].filter(Boolean).join(" · ")}
                  expanded={expanded}
                  cardStyle={editorCardStyle}
                  titleStyle={editorCardTitleStyle}
                  removeButtonStyle={getEditorRemoveButtonStyle()}
                  removeButtonLabelStyle={getEditorRemoveButtonLabelStyle()}
                  onRemove={() => removeDraftInventoryItem(index)}
                  onToggle={() => toggleEditorCard(cardId)}
                >
                  <View style={styles.editorGrid}>
                    <EditorField
                      label="Nom"
                      value={item.name}
                      onChangeText={(value) => updateDraftInventory(index, { name: value })}
                    />
                    <EditorField
                      label="Quantite"
                      value={String(item.quantity)}
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        updateDraftInventory(index, {
                          quantity: Math.max(
                            0,
                            Number.parseInt(value || "0", 10) || 0,
                          ),
                        })
                      }
                    />
                    <TagEditorField
                      tags={item.tags}
                      onChangeTags={(tags) => updateDraftInventory(index, { tags })}
                    />
                  </View>
                  <View style={styles.editorMediaRow}>
                    <AssetVisual
                      label={item.name}
                      icon={item.icon}
                      imageUrl={item.imageUrl}
                      imageModule={item.imageModule}
                      small
                    />
                    <Pressable
                      onPress={() => {
                        setImageLibraryTarget({ kind: "inventory", index });
                      }}
                      style={editorUploadButtonStyle}
                    >
                      <Text style={editorUploadButtonLabelStyle}>
                        Choisir une image
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    value={item.notes ?? ""}
                    onChangeText={(value) => updateDraftInventory(index, { notes: value })}
                    style={[
                      styles.editorInput,
                      styles.editorTextArea,
                      {
                        backgroundColor: activeTheme.chipBg,
                        borderColor: activeTheme.border,
                        color: activeTheme.title,
                      },
                    ]}
                    multiline
                    placeholder="Commentaire d'inventaire"
                    placeholderTextColor={activeTheme.subtitle}
                  />
                </EditorCollapsibleCard>
                );
              })}
            </View>
          </View>
          ) : null}
        </View>
        </EditorFieldThemeProvider>
        </EditorModal>
      ) : null}

      {imageLibraryTarget ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => {
            setImageLibraryTarget(null);
            setImageLibraryQuery("");
          }}
        >
          <View style={styles.overlayBackdrop}>
            <View
              style={[
                styles.overlayCard,
                styles.imageLibraryModal,
                { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
              ]}
            >
              <View style={styles.overlayHeader}>
                <View style={styles.overlayHeaderText}>
                  <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                    {getImageLibraryTitle(imageLibraryTarget)}
                  </Text>
                  <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                    Choisis une image locale ou importe un visuel personnalise.
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setImageLibraryTarget(null);
                    setImageLibraryQuery("");
                  }}
                  style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                >
                  <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                    Fermer
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.overlayScroll}
                contentContainerStyle={styles.overlayScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.imageLibrarySearchWrap,
                    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                  ]}
                >
                  <TextInput
                    value={imageLibraryQuery}
                    onChangeText={setImageLibraryQuery}
                    placeholder="Rechercher par nom ou tag"
                    placeholderTextColor={activeTheme.subtitle}
                    style={[styles.imageLibrarySearchInput, { color: activeTheme.title }]}
                  />
                  <Text style={[styles.imageLibrarySearchHint, { color: activeTheme.subtitle }]}>
                    Exemples: `bleu`, `kevlar`, `demoniste`, `spell`
                  </Text>
                </View>
                <View style={styles.imageLibraryGrid}>
                  {filteredImageLibraryOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      onPress={() => applyLocalImage(imageLibraryTarget, option)}
                      style={[
                        styles.imageLibraryCard,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <AssetVisual
                        label={option.label}
                        imageModule={option.imageModule}
                        character={getImageLibraryCategory(imageLibraryTarget) === "character"}
                        small={getImageLibraryCategory(imageLibraryTarget) === "inventory"}
                      />
                      <Text style={[styles.imageLibraryCardLabel, { color: activeTheme.title }]}>
                        {option.label}
                      </Text>
                      <Text
                        style={[styles.imageLibraryCardTags, { color: activeTheme.subtitle }]}
                        numberOfLines={3}
                      >
                        {option.tags.join(" · ")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {!filteredImageLibraryOptions.length ? (
                  <View
                    style={[
                      styles.overlayOptionCard,
                      { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                    ]}
                  >
                    <Text style={[styles.emptyText, { color: activeTheme.subtitle }]}>
                      Aucun visuel ne correspond a cette recherche.
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.overlayActions}>
                <Pressable
                  onPress={() => clearImageSelection(imageLibraryTarget)}
                  style={[
                    styles.overlaySecondaryButton,
                    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                  ]}
                >
                  <Text style={[styles.overlaySecondaryButtonLabel, { color: activeTheme.title }]}>
                    Retirer l'image
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void uploadCustomImage(imageLibraryTarget);
                  }}
                  style={[
                    styles.overlayPrimaryButton,
                    { backgroundColor: activeTheme.buttonBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.overlayPrimaryButtonLabel,
                      { color: activeTheme.buttonText },
                    ]}
                  >
                    Importer une image
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      <CharacterActionModals
        character={selectedCharacter}
        damageDraft={damageDraft}
        recoveryDraft={recoveryDraft}
        quickCastDraft={quickCastDraft}
        quickCastVisible={activeOverlayMenu === "quickCast"}
        selectedQuickCastEquipmentSpell={selectedQuickCastEquipmentSpell}
        selectedQuickCastEquipmentSpellSource={selectedQuickCastEquipmentSpellSource}
        selectedQuickCastSpell={selectedQuickCastSpell}
        theme={activeTheme}
        onAdjustQuickCastExtra={adjustQuickCastExtra}
        onApplyDamage={applyDamage}
        onApplyRecovery={applyRecovery}
        onCloseDamage={() => setDamageDraft(null)}
        onCloseQuickCast={() => {
          setQuickCastDraft(null);
          setActiveOverlayMenu(null);
        }}
        onCloseRecovery={() => setRecoveryDraft(null)}
        onConfirmQuickCast={confirmQuickCast}
        onSelectQuickCastEquipmentSpell={selectQuickCastEquipmentSpell}
        onSelectQuickCastSpell={selectQuickCastSpell}
        setDamageDraft={setDamageDraft}
        setQuickCastDraft={setQuickCastDraft}
        setRecoveryDraft={setRecoveryDraft}
      />

      {showOverlay ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => {
            setActiveOverlayMenu(null);
            setCreationDraft(null);
            setDamageDraft(null);
            setRecoveryDraft(null);
            setQuickCastDraft(null);
          }}
        >
          <View style={styles.overlayBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                setActiveOverlayMenu(null);
                setCreationDraft(null);
                setDamageDraft(null);
                setRecoveryDraft(null);
                setQuickCastDraft(null);
              }}
            />
            <View
              style={[
                styles.overlayCard,
                {
                  backgroundColor: activeTheme.panelBg,
                  borderColor: activeTheme.border,
                },
              ]}
            >
              <ScrollView
                style={styles.overlayScroll}
                contentContainerStyle={styles.overlayScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              {activeOverlayMenu === "bioView" ? (
                <>
                  <View style={styles.overlayHeader}>
                    <View style={styles.overlayHeaderText}>
                      <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                        Bio de {selectedCharacter.name}
                      </Text>
                      <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                        Historique, temperament, croyances ou details de roleplay.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setActiveOverlayMenu(null)}
                      style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                    >
                      <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                        Fermer
                      </Text>
                    </Pressable>
                  </View>
                  <View
                    style={[
                      styles.bioDialogCard,
                      { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                    ]}
                  >
                    <ScrollView style={styles.bioDialogScroll} showsVerticalScrollIndicator={false}>
                      <Text style={[styles.bioDialogText, { color: activeTheme.title }]}>
                        {selectedCharacter.bio || "Aucune bio renseignee."}
                      </Text>
                    </ScrollView>
                  </View>
                </>
              ) : activeOverlayMenu === "bioEdit" && draftCharacter ? (
                <>
                  <View style={styles.overlayHeader}>
                    <View style={styles.overlayHeaderText}>
                      <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                        Bio du personnage
                      </Text>
                      <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                        Texte libre pour l'historique, les intentions et le roleplay.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setActiveOverlayMenu(null)}
                      style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                    >
                      <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                        Fermer
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    value={draftCharacter.bio ?? ""}
                    onChangeText={(value) => updateDraftField("bio", value)}
                    style={[
                      styles.editorInput,
                      styles.bioEditorInput,
                      {
                        backgroundColor: activeTheme.chipBg,
                        borderColor: activeTheme.border,
                        color: activeTheme.title,
                      },
                    ]}
                    multiline
                    textAlignVertical="top"
                    placeholder="Bio du personnage"
                    placeholderTextColor={activeTheme.subtitle}
                  />
                </>
              ) : creationDraft ? (
                <>
                  <View style={styles.overlayHeader}>
                    <View style={styles.overlayHeaderText}>
                      <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                        Nouveau personnage
                      </Text>
                      <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                        {creationDraft.step === 1
                          ? "Choisis un archetype de base."
                          : "Choisis la specialisation, puis cree la fiche pre-remplie."}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setCreationDraft(null)}
                      style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                    >
                      <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                        Fermer
                      </Text>
                    </Pressable>
                  </View>

                  {creationDraft.step === 1 ? (
                    <View style={styles.overlayOptionList}>
                      {ARCHETYPE_OPTIONS.map((option) => (
                        <Pressable
                          key={option.id}
                          onPress={() => updateCreationArchetype(option.id)}
                          style={[
                            styles.overlayOptionCard,
                            {
                              backgroundColor: activeTheme.chipBg,
                              borderColor:
                                creationDraft.archetypeId === option.id
                                  ? activeTheme.accent
                                  : activeTheme.border,
                            },
                          ]}
                        >
                          <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                            {option.label}
                          </Text>
                          <Text
                            style={[styles.overlayOptionDescription, { color: activeTheme.subtitle }]}
                          >
                            {option.description}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <>
                      <View
                        style={[
                          styles.creationSummaryCard,
                          { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                        ]}
                      >
                        <Text style={[styles.creationSummaryTitle, { color: activeTheme.title }]}>
                          {creationArchetypeOption.label}
                        </Text>
                        <Text
                          style={[styles.creationSummaryDescription, { color: activeTheme.subtitle }]}
                        >
                          {creationArchetypeOption.description}
                        </Text>
                        <Text style={[styles.creationSummaryMeta, { color: activeTheme.subtitle }]}>
                          Theme suggere · {THEME_LABELS[creationArchetypeOption.theme]}
                        </Text>
                      </View>

                      <View style={styles.overlayOptionList}>
                        {creationArchetypeOption.specializations.map((specialization) => (
                          <Pressable
                            key={specialization}
                            onPress={() =>
                              setCreationDraft((current) =>
                                current ? { ...current, specialization } : current,
                              )
                            }
                            style={[
                              styles.overlayOptionCard,
                              {
                                backgroundColor: activeTheme.chipBg,
                                borderColor:
                                  creationDraft.specialization === specialization
                                    ? activeTheme.accent
                                    : activeTheme.border,
                              },
                            ]}
                          >
                            <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                              {specialization}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <View style={styles.overlayActions}>
                        <Pressable
                          onPress={() =>
                            setCreationDraft((current) =>
                              current ? { ...current, step: 1 } : current,
                            )
                          }
                          style={[
                            styles.overlaySecondaryButton,
                            { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                          ]}
                        >
                          <Text
                            style={[styles.overlaySecondaryButtonLabel, { color: activeTheme.title }]}
                          >
                            Retour
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={createCharacter}
                          style={[
                            styles.overlayPrimaryButton,
                            { backgroundColor: activeTheme.buttonBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.overlayPrimaryButtonLabel,
                              { color: activeTheme.buttonText },
                            ]}
                          >
                            Creer la fiche
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </>
              ) : activeOverlayMenu === "character" ? (
                <View style={styles.overlayOptionList}>
                  {characters.map((character) => {
                    const active = character.id === selectedCharacter.id;

                    return (
                      <Pressable
                        key={character.id}
                        onPress={() => {
                          setSelectedId(character.id);
                          setActiveOverlayMenu(null);
                        }}
                        style={[
                          styles.overlayOptionCard,
                          {
                            backgroundColor: activeTheme.chipBg,
                            borderColor: active ? activeTheme.accent : activeTheme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                          {character.name}
                        </Text>
                        <Text
                          style={[styles.overlayOptionDescription, { color: activeTheme.subtitle }]}
                        >
                          {character.archetype}
                          {` · Rang ${character.rank ?? "5"}`}
                          {character.level ? ` · Niv ${character.level}` : ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : activeOverlayMenu === "stance" ? (
                <View style={styles.overlayOptionList}>
                  {STANCES.map((stance) => (
                    <Pressable
                      key={stance}
                      onPress={() => setStance(selectedCharacter.id, stance)}
                      style={[
                        styles.overlayOptionCard,
                        {
                          backgroundColor: activeTheme.chipBg,
                          borderColor:
                            stance === selectedCharacter.stance
                              ? activeTheme.accent
                              : activeTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                        {stanceLabels[stance]}
                      </Text>
                      <Text
                        style={[styles.overlayOptionDescription, { color: activeTheme.subtitle }]}
                      >
                        {stanceDescriptions[stance]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : activeOverlayMenu === "editorTheme" && draftCharacter ? (
                <View style={styles.overlayOptionList}>
                  {(Object.keys(THEME_LABELS) as CharacterTheme[]).map((themeKey) => (
                    <Pressable
                      key={themeKey}
                      onPress={() => {
                        updateDraftField("theme", themeKey);
                        setActiveOverlayMenu(null);
                      }}
                      style={[
                        styles.overlayOptionCard,
                        {
                          backgroundColor: activeTheme.chipBg,
                          borderColor:
                            draftCharacter.theme === themeKey
                              ? activeTheme.accent
                              : activeTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                        {THEME_LABELS[themeKey]}
                      </Text>
                      <Text
                        style={[styles.overlayOptionDescription, { color: activeTheme.subtitle }]}
                      >
                        {THEME_DESCRIPTIONS[themeKey]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : activeOverlayMenu === "editorArchetype" && draftCharacter ? (
                <View style={styles.overlayOptionList}>
                  {ARCHETYPE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.id}
                      onPress={() => applyArchetypeTemplate(option.id)}
                      style={[
                        styles.overlayOptionCard,
                        {
                          backgroundColor: activeTheme.chipBg,
                          borderColor:
                            draftCharacter.archetypeId === option.id
                              ? activeTheme.accent
                              : activeTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                        {option.label}
                      </Text>
                      <Text
                        style={[styles.overlayOptionDescription, { color: activeTheme.subtitle }]}
                      >
                        {option.description}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : activeOverlayMenu === "editorSpecialization" && draftCharacter ? (
                <View style={styles.overlayOptionList}>
                  {selectedArchetypeOption.specializations.map((specialization) => (
                    <Pressable
                      key={specialization}
                      onPress={() => updateDraftSpecialization(specialization)}
                      style={[
                        styles.overlayOptionCard,
                        {
                          backgroundColor: activeTheme.chipBg,
                          borderColor:
                            draftCharacter.specialization === specialization
                              ? activeTheme.accent
                              : activeTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                        {specialization}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}

      <CharacterPanels
        character={selectedCharacter}
        isSplitLayout={useSplitLayout}
        quickActions={renderQuickActions()}
        theme={sectionTheme}
        onAdjustResource={(resourceKey, delta) =>
          updateResource(selectedCharacter.id, resourceKey, delta)
        }
        onAdjustResourceBonus={(resourceKey, delta) =>
          updateResourceBonus(selectedCharacter.id, resourceKey, delta)
        }
        onAdjustAttackBonus={(delta) => updateAttackBonus(selectedCharacter.id, delta)}
        onEditEquipment={() => openSectionEditor("equipment")}
        onEditEffects={() => openSectionEditor("effects")}
        onEditInventory={() => openSectionEditor("inventory")}
        onEditResistances={() => openSectionEditor("resistances")}
        onEditResources={() => openSectionEditor("resources")}
        onEditSkills={() => openSectionEditor("skills")}
        onEditSpells={() => openSectionEditor("spells")}
        onEditStats={() => openSectionEditor("stats")}
        onToggleSpellActive={(spellId) => toggleSpellActive(selectedCharacter.id, spellId)}
      />
    </ScrollView>
    {rosterMessage ? (
      <View
        style={[
          styles.toast,
          { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
        ]}
      >
        <Text style={[styles.toastText, { color: activeTheme.title }]}>{rosterMessage}</Text>
      </View>
    ) : null}
    </View>
  );
}
