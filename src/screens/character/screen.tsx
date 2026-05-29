import { Dispatch, SetStateAction, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Image,
  KeyboardAvoidingView,
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

import { Section } from "../../components/Section";
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
  ArchetypeId,
  Character,
  CombatStance,
  CharacterTheme,
  EquipmentItem,
  InventoryItem,
  ResistanceProfile,
  ResistanceType,
  ResourcePool,
  Skill,
  Spell,
  StatusEffect,
} from "../../types/game";
import {
  clampValue,
  getEffectiveArmorResource,
  getReducibleCost,
  getScaledSpellCost,
  getSpellCost,
  stanceDescriptions,
  stanceLabels,
} from "../../utils/game";
import { normalizeCharacter } from "../../utils/characters";
import { getResponsiveFlags } from "../../utils/responsive";
import {
  LOCAL_IMAGE_LIBRARY,
  ImageLibraryCategory,
  LocalImageOption,
} from "../../data/image-library";
import { AppNavbar } from "../navbar";
import {
  ARCHETYPE_OPTIONS,
  RESISTANCE_LABELS,
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
  const [editorSection, setEditorSection] = useState<EditorSection>("all");
  const [rosterMessage, setRosterMessage] = useState<string | null>(null);
  const [deleteCharacterConfirm, setDeleteCharacterConfirm] = useState(false);
  const [imageLibraryTarget, setImageLibraryTarget] = useState<ImageLibraryTarget | null>(null);
  const [imageLibraryQuery, setImageLibraryQuery] = useState("");

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
      ? selectedQuickCastEquipmentSpellSource?.grantedSpell?.id === quickCastDraft.id
        ? selectedQuickCastEquipmentSpellSource.grantedSpell
        : null
      : null;
  const selectedQuickCastEquipment =
    quickCastDraft?.kind === "equipment"
      ? selectedCharacter.equipment.find((item) => item.id === quickCastDraft.id) ?? null
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

    const timeout = setTimeout(() => setRosterMessage(null), 2000);

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

      if (remaining > 0) {
        shieldAbsorbed = Math.min(nextPv.bonus, remaining);
        nextPv.bonus -= shieldAbsorbed;
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

  function selectQuickCastEquipment(equipmentId: string) {
    setQuickCastDraft({ kind: "equipment", id: equipmentId, extraPsy: 0 });
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
      title: "Lancer un sort",
      description: "Choisit un don ou un equipement qui consomme du PSY.",
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
        const spell =
          quickCastDraft.kind === "spell"
            ? character.spells.find((entry) => entry.id === quickCastDraft.id)
            : character.equipment.find((entry) => entry.id === quickCastDraft.sourceEquipmentId)
                ?.grantedSpell;

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

      const item = character.equipment.find((entry) => entry.id === quickCastDraft.id);

      if (!item?.usePsyCost) {
        return character;
      }

      const cost = getReducibleCost(
        item.usePsyCost,
        item.reducible ?? false,
        character.stance,
      );

      if (character.psy.current < cost) {
        setRosterMessage(`PSY insuffisante pour ${item.name}.`);
        return character;
      }

      setRosterMessage(`${item.usableLabel ?? item.name} active · -${cost} PSY.`);

      return {
        ...character,
        psy: {
          ...character.psy,
          current: character.psy.current - cost,
        },
      };
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
    setEditorSection("all");
    setDraftCharacter(cloneTemplate(selectedCharacter!));
    setDeleteCharacterConfirm(false);
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function openSectionEditor(section: EditorSection) {
    setEditorSection(section);
    setDraftCharacter(cloneTemplate(selectedCharacter!));
    setDeleteCharacterConfirm(false);
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function closeEditor() {
    setActiveOverlayMenu(null);
    setEditorSection("all");
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

    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === draftCharacter.id ? draftCharacter : character,
      ),
    );
    setActiveOverlayMenu(null);
    setEditorSection("all");
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
    setDraftCharacter(null);
    setDeleteCharacterConfirm(false);
    setImageLibraryTarget(null);
    setImageLibraryQuery("");
    setActiveOverlayMenu(null);
    setEditorSection("all");
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

  function applyLocalImage(target: ImageLibraryTarget, option: LocalImageOption) {
    switch (target.kind) {
      case "character":
        updateDraftField("imageModule", option.imageModule);
        updateDraftField("imageUrl", undefined);
        break;
      case "spell":
        updateDraftSpell(target.index, { imageModule: option.imageModule, imageUrl: undefined });
        break;
      case "equipment":
        updateDraftEquipment(target.index, {
          imageModule: option.imageModule,
          imageUrl: undefined,
        });
        break;
      case "equipmentSpell":
        updateDraftEquipmentGrantedSpell(target.index, {
          imageModule: option.imageModule,
          imageUrl: undefined,
        });
        break;
      case "inventory":
        updateDraftInventory(target.index, {
          imageModule: option.imageModule,
          imageUrl: undefined,
        });
        break;
    }

    setImageLibraryTarget(null);
    setImageLibraryQuery("");
  }

  function clearImageSelection(target: ImageLibraryTarget) {
    switch (target.kind) {
      case "character":
        updateDraftField("imageModule", undefined);
        updateDraftField("imageUrl", undefined);
        break;
      case "spell":
        updateDraftSpell(target.index, { imageModule: undefined, imageUrl: undefined });
        break;
      case "equipment":
        updateDraftEquipment(target.index, { imageModule: undefined, imageUrl: undefined });
        break;
      case "equipmentSpell":
        updateDraftEquipmentGrantedSpell(target.index, {
          imageModule: undefined,
          imageUrl: undefined,
        });
        break;
      case "inventory":
        updateDraftInventory(target.index, { imageModule: undefined, imageUrl: undefined });
        break;
    }

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
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            skills: [
              ...current.skills,
              { id: makeId("skill"), name: "Nouvelle competence", value: 0 },
            ],
          }
        : current,
    );
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
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            spells: [
              {
                id: makeId("spell"),
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

  function addDraftStatusEffect() {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            statusEffects: [
              ...current.statusEffects,
              {
                id: makeId("status"),
                name: "Nouvel effet",
                description: "",
                source: "",
                durationTurns: 1,
                active: true,
                tags: [],
              },
            ],
          }
        : current,
    );
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
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            resistances: [
              ...current.resistances,
              {
                id: makeId("resistance"),
                label: "Nouvelle affinite",
                type: "resistance",
                notes: "",
              },
            ],
          }
        : current,
    );
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
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            inventory: [
              {
                id: makeId("item"),
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

  function updateDraftEquipmentGrantedSpell(index: number, patch: Partial<Spell>) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.map((item, itemIndex) => {
              if (itemIndex !== index || !item.grantedSpell) {
                return item;
              }

              return {
                ...item,
                grantedSpell: {
                  ...item.grantedSpell,
                  ...patch,
                },
              };
            }),
          }
        : current,
    );
  }

  function toggleDraftEquipmentGrantedSpell(index: number) {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: current.equipment.map((item, itemIndex) => {
              if (itemIndex !== index) {
                return item;
              }

              if (item.grantedSpell) {
                return {
                  ...item,
                  grantedSpell: undefined,
                };
              }

              return {
                ...item,
                grantedSpell: {
                  id: makeId("equipment-spell"),
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
              };
            }),
          }
        : current,
    );
  }

  function addDraftEquipment() {
    setDraftCharacter((current) =>
      current
        ? {
            ...current,
            equipment: [
              {
                id: makeId("equipment"),
                name: "Nouvel equipement",
                category: "Objet",
                icon: "🧰",
                notes: "",
                armorBonus: 0,
                tags: [],
                activeEffects: [],
                passiveEffects: [],
                grantedSpell: undefined,
              },
              ...current.equipment,
            ],
          }
        : current,
    );
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

    return result.assets[0]?.uri ?? null;
  }

  async function uploadCustomImage(target: ImageLibraryTarget) {
    const uri = await pickImageUri();

    if (!uri) {
      return;
    }

    switch (target.kind) {
      case "character":
        updateDraftField("imageUrl", uri);
        updateDraftField("imageModule", undefined);
        break;
      case "spell":
        updateDraftSpell(target.index, { imageUrl: uri, imageModule: undefined });
        break;
      case "equipment":
        updateDraftEquipment(target.index, { imageUrl: uri, imageModule: undefined });
        break;
      case "equipmentSpell":
        updateDraftEquipmentGrantedSpell(target.index, {
          imageUrl: uri,
          imageModule: undefined,
        });
        break;
      case "inventory":
        updateDraftInventory(target.index, { imageUrl: uri, imageModule: undefined });
        break;
    }

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
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={closeEditor}
        >
          <KeyboardAvoidingView
            style={styles.editorModalBackdrop}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Pressable style={StyleSheet.absoluteFillObject} onPress={closeEditor} />
            <View style={styles.editorModalWrap}>
              <ScrollView
                style={styles.editorModalScroll}
                contentContainerStyle={styles.editorModalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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
        <Section
          title="Edition ciblee"
          subtitle="Modifie uniquement la card ouverte puis sauvegarde."
          theme={{
            sectionBg: activeTheme.panelBg,
            sectionBorder: activeTheme.border,
            title: activeTheme.title,
            subtitle: activeTheme.subtitle,
            cardBackgroundImage: sectionTheme.cardBackgroundImage,
          }}
          rightSlot={
            <View style={styles.editorActions}>
              <Pressable onPress={closeEditor} style={editorGhostButtonStyle}>
                <Text style={editorGhostButtonLabelStyle}>Annuler</Text>
              </Pressable>
              <Pressable onPress={saveEditor} style={editorPrimaryButtonStyle}>
                <Text style={editorPrimaryButtonLabelStyle}>Sauvegarder</Text>
              </Pressable>
            </View>
          }
        >
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
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={editorSectionTitleStyle}>Effets persistants</Text>
              <Pressable onPress={addDraftStatusEffect} style={editorAddButtonStyle}>
                <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.statusEffects.map((effect, index) => (
                <View key={effect.id} style={editorCardStyle}>
                  <View style={styles.editorCardHeader}>
                    <Text style={editorCardTitleStyle}>Effet</Text>
                    <Pressable
                      onPress={() => removeDraftStatusEffect(index)}
                      style={getEditorRemoveButtonStyle()}
                    >
                      <Text style={getEditorRemoveButtonLabelStyle()}>Supprimer</Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorGrid}>
                    <EditorField
                      label="Nom"
                      value={effect.name}
                      onChangeText={(value) =>
                        updateDraftStatusEffect(index, { name: value })
                      }
                    />
                    <EditorField
                      label="Source"
                      value={effect.source ?? ""}
                      onChangeText={(value) =>
                        updateDraftStatusEffect(index, { source: value })
                      }
                    />
                    <EditorField
                      label="Tours"
                      value={effect.durationTurns === null ? "" : String(effect.durationTurns)}
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        updateDraftStatusEffect(index, {
                          durationTurns: value.trim() === ""
                            ? null
                            : Math.max(0, Number.parseInt(value || "0", 10) || 0),
                        })
                      }
                    />
                    <TagEditorField
                      tags={effect.tags}
                      onChangeTags={(tags) => updateDraftStatusEffect(index, { tags })}
                    />
                  </View>
                  <View style={styles.editorToggleRow}>
                    <Text style={editorInlineLabelStyle}>Effet actif</Text>
                    <Pressable
                      onPress={() =>
                        updateDraftStatusEffect(index, { active: !effect.active })
                      }
                      style={getEditorToggleButtonStyle(effect.active)}
                    >
                      <Text style={getEditorToggleButtonLabelStyle(effect.active)}>
                        {effect.active ? "Actif" : "Inactif"}
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    value={effect.description}
                    onChangeText={(value) =>
                      updateDraftStatusEffect(index, { description: value })
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
                    placeholder="Description de l'effet"
                    placeholderTextColor={activeTheme.subtitle}
                  />
                </View>
              ))}
            </View>
          </View>
          ) : null}

          {editingAll || editorSection === "resistances" ? (
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={editorSectionTitleStyle}>Affinites</Text>
              <Pressable onPress={addDraftResistance} style={editorAddButtonStyle}>
                <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.resistances.map((entry, index) => (
                <View key={entry.id} style={editorCardStyle}>
                  <View style={styles.editorCardHeader}>
                    <Text style={editorCardTitleStyle}>Affinite</Text>
                    <Pressable
                      onPress={() => removeDraftResistance(index)}
                      style={getEditorRemoveButtonStyle()}
                    >
                      <Text style={getEditorRemoveButtonLabelStyle()}>Supprimer</Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorGrid}>
                    <EditorField
                      label="Libelle"
                      value={entry.label}
                      onChangeText={(value) =>
                        updateDraftResistance(index, { label: value })
                      }
                    />
                    <View style={styles.editorField}>
                      <Text style={[styles.editorFieldLabel, { color: activeTheme.subtitle }]}>
                        Type
                      </Text>
                      <View style={styles.themePicker}>
                        {(Object.keys(RESISTANCE_LABELS) as ResistanceType[]).map((type) => (
                          <Pressable
                            key={type}
                            onPress={() => updateDraftResistance(index, { type })}
                            style={[
                              styles.themeOption,
                              {
                                backgroundColor:
                                  entry.type === type ? activeTheme.chipBg : "rgba(15, 23, 42, 0.78)",
                                borderColor:
                                  entry.type === type ? activeTheme.accent : activeTheme.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.themeOptionLabel,
                                {
                                  color:
                                    entry.type === type ? activeTheme.title : activeTheme.subtitle,
                                },
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
                    onChangeText={(value) => updateDraftResistance(index, { notes: value })}
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
                    placeholder="Notes sur l'affinite"
                    placeholderTextColor={activeTheme.subtitle}
                  />
                </View>
              ))}
            </View>
          </View>
          ) : null}

          {editingAll || editorSection === "skills" ? (
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={editorSectionTitleStyle}>Competences</Text>
              <Pressable onPress={addDraftSkill} style={editorAddButtonStyle}>
                <Text style={editorAddButtonLabelStyle}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.skills.map((skill, index) => (
                <View key={skill.id} style={editorCardStyle}>
                  <View style={styles.editorCardHeader}>
                    <Text style={editorCardTitleStyle}>Competence</Text>
                    <Pressable
                      onPress={() => removeDraftSkill(index)}
                      style={getEditorRemoveButtonStyle()}
                    >
                      <Text style={getEditorRemoveButtonLabelStyle()}>Supprimer</Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorGrid}>
                    <EditorField
                      label="Nom"
                      value={skill.name}
                      onChangeText={(value) => updateDraftSkill(index, { name: value })}
                    />
                    <EditorField
                      label="Bonus %"
                      value={String(skill.value)}
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        updateDraftSkill(index, {
                          value: Math.max(0, Number.parseInt(value || "0", 10) || 0),
                        })
                      }
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
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
              onAddDraftSpell={addDraftSpell}
              onRemoveDraftSpell={removeDraftSpell}
              onSetImageLibraryTarget={setImageLibraryTarget}
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
              {draftCharacter.equipment.map((item, index) => (
                <View key={item.id} style={editorCardStyle}>
                  <View style={styles.editorCardHeader}>
                    <Text style={editorCardTitleStyle}>Equipement</Text>
                    <Pressable
                      onPress={() => removeDraftEquipment(index)}
                      style={getEditorRemoveButtonStyle()}
                    >
                      <Text style={getEditorRemoveButtonLabelStyle()}>Supprimer</Text>
                    </Pressable>
                  </View>
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
                  <View style={styles.editorToggleRow}>
                    <Text style={editorInlineLabelStyle}>Don associe</Text>
                    <Pressable
                      onPress={() => toggleDraftEquipmentGrantedSpell(index)}
                      style={getEditorToggleButtonStyle(Boolean(item.grantedSpell))}
                    >
                      <Text style={getEditorToggleButtonLabelStyle(Boolean(item.grantedSpell))}>
                        {item.grantedSpell ? "Oui" : "Non"}
                      </Text>
                    </Pressable>
                  </View>
                  {item.grantedSpell ? (
                    <View
                      style={[
                        styles.editorCard,
                        {
                          backgroundColor: activeTheme.panelBg,
                          borderColor: activeTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.editorCardTitle, { color: activeTheme.title }]}>
                        Don de l'equipement
                      </Text>
                      <View style={styles.editorGrid}>
                        <EditorField
                          label="Nom"
                          value={item.grantedSpell.name}
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, { name: value })
                          }
                        />
                        <TagEditorField
                          tags={item.grantedSpell.tags}
                          onChangeTags={(tags) =>
                            updateDraftEquipmentGrantedSpell(index, { tags })
                          }
                        />
                        <EditorField
                          label="Cout PSY"
                          value={String(item.grantedSpell.basePsyCost)}
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, {
                              basePsyCost: Math.max(
                                0,
                                Number.parseInt(value || "0", 10) || 0,
                              ),
                            })
                          }
                        />
                        <EditorField
                          label="Bonus d'armure (actif)"
                          value={String(item.grantedSpell.armorBonus ?? 0)}
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, {
                              armorBonus: Math.max(
                                0,
                                Number.parseInt(value || "0", 10) || 0,
                              ),
                            })
                          }
                        />
                        <EditorField
                          label="Bonus de degats (actif)"
                          value={String(item.grantedSpell.damageBonus ?? 0)}
                          keyboardType="numeric"
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, {
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
                          label={item.grantedSpell.name}
                          icon={item.grantedSpell.icon}
                          imageUrl={item.grantedSpell.imageUrl}
                          imageModule={item.grantedSpell.imageModule}
                        />
                        <Pressable
                          onPress={() => {
                            setImageLibraryTarget({ kind: "equipmentSpell", index });
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
                            updateDraftEquipmentGrantedSpell(index, {
                              reducible: !item.grantedSpell?.reducible,
                            })
                          }
                          style={getEditorToggleButtonStyle(Boolean(item.grantedSpell.reducible))}
                        >
                          <Text
                            style={getEditorToggleButtonLabelStyle(
                              Boolean(item.grantedSpell.reducible),
                            )}
                          >
                            {item.grantedSpell.reducible ? "Oui" : "Non"}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.editorToggleRow}>
                        <Text style={editorInlineLabelStyle}>Augmentable</Text>
                        <Pressable
                          onPress={() =>
                            updateDraftEquipmentGrantedSpell(index, {
                              augmentable: !(item.grantedSpell?.augmentable ?? false),
                            })
                          }
                          style={getEditorToggleButtonStyle(Boolean(item.grantedSpell.augmentable))}
                        >
                          <Text
                            style={getEditorToggleButtonLabelStyle(
                              Boolean(item.grantedSpell.augmentable),
                            )}
                          >
                            {item.grantedSpell.augmentable ? "Oui" : "Non"}
                          </Text>
                        </Pressable>
                      </View>
                      <TextInput
                        value={item.grantedSpell.description}
                        onChangeText={(value) =>
                          updateDraftEquipmentGrantedSpell(index, { description: value })
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
                    </View>
                  ) : null}
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
                </View>
              ))}
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
              {draftCharacter.inventory.map((item, index) => (
                <View key={item.id} style={editorCardStyle}>
                  <View style={styles.editorCardHeader}>
                    <Text style={editorCardTitleStyle}>Item</Text>
                    <Pressable
                      onPress={() => removeDraftInventoryItem(index)}
                      style={getEditorRemoveButtonStyle()}
                    >
                      <Text style={getEditorRemoveButtonLabelStyle()}>Supprimer</Text>
                    </Pressable>
                  </View>
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
                </View>
              ))}
            </View>
          </View>
          ) : null}
        </Section>
        </EditorFieldThemeProvider>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
        selectedQuickCastEquipment={selectedQuickCastEquipment}
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
        onSelectQuickCastEquipment={selectQuickCastEquipment}
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
              style={StyleSheet.absoluteFillObject}
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
        pointerEvents="none"
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
