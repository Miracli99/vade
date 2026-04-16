import { useEffect, useState } from "react";
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

import { Section } from "../components/Section";
import { AssetVisual } from "../components/character-sheet/AssetVisual";
import {
  EditorField,
  EditorFieldThemeProvider,
} from "../components/character-sheet/EditorField";
import { EquipmentSection } from "../components/character-sheet/EquipmentSection";
import { InventorySection } from "../components/character-sheet/InventorySection";
import {
  AdjustButton,
  AttackBonusCard,
  ResourceMeter,
} from "../components/character-sheet/ResourceCards";
import { ResourcesSection } from "../components/character-sheet/ResourcesSection";
import { SpellsSection } from "../components/character-sheet/SpellsSection";
import { StatsSkillsSection } from "../components/character-sheet/StatsSkillsSection";
import { StatusSections } from "../components/character-sheet/StatusSections";
import { sampleCharacters } from "../data/sampleCharacters";
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
} from "../types/game";
import {
  clampValue,
  getReducibleCost,
  getScaledSpellCost,
  getSpellCost,
  stanceDescriptions,
  stanceLabels,
} from "../utils/game";
import {
  exportCharacters,
  importCharacters,
  loadCharactersFromStorage,
  persistCharactersToStorage,
} from "../utils/persistence";

const STANCES: CombatStance[] = ["focus", "combat", "defensif"];
const THEME_BACKGROUNDS: Record<CharacterTheme, number> = {
  vide: require("../../assets/themes/vide.png"),
  ange: require("../../assets/themes/ange.png"),
  demon: require("../../assets/themes/demon.png"),
  foret: require("../../assets/themes/foret.png"),
  humain: require("../../assets/themes/humain.png"),
  nain: require("../../assets/themes/nain.png"),
};
const APP_LOGO = require("../../assets/vade-retro-logo.png");
const STAT_ICONS: Record<keyof Character["stats"], string> = {
  physique: "⚔",
  mentale: "✦",
  sociale: "☉",
};
const THEME_LABELS: Record<CharacterTheme, string> = {
  vide: "Vide",
  ange: "Ange",
  demon: "Demon",
  foret: "Foret",
  humain: "Humain",
  nain: "Nain",
};
const THEME_PRESETS: Record<
  CharacterTheme,
  {
    pageBg: string;
    backgroundImage: number;
    panelBg: string;
    border: string;
    accent: string;
    title: string;
    subtitle: string;
    chipBg: string;
    buttonBg: string;
    buttonText: string;
  }
> = {
  vide: {
    pageBg: "#04010a",
    backgroundImage: THEME_BACKGROUNDS.vide,
    panelBg: "rgba(18, 8, 33, 0.88)",
    border: "rgba(168, 85, 247, 0.34)",
    accent: "#a855f7",
    title: "#f3e8ff",
    subtitle: "#d8b4fe",
    chipBg: "#1b1030",
    buttonBg: "#7e22ce",
    buttonText: "#fdf4ff",
  },
  ange: {
    pageBg: "#f6f1df",
    backgroundImage: THEME_BACKGROUNDS.ange,
    panelBg: "rgba(255, 252, 242, 0.94)",
    border: "rgba(217, 119, 6, 0.34)",
    accent: "#d4a017",
    title: "#5b4105",
    subtitle: "#8b6a12",
    chipBg: "#fff6db",
    buttonBg: "#d4a017",
    buttonText: "#2f2202",
  },
  demon: {
    pageBg: "#0b0204",
    backgroundImage: THEME_BACKGROUNDS.demon,
    panelBg: "rgba(27, 6, 8, 0.92)",
    border: "rgba(185, 28, 28, 0.42)",
    accent: "#b91c1c",
    title: "#fee2e2",
    subtitle: "#fca5a5",
    chipBg: "#1a0b0d",
    buttonBg: "#b91c1c",
    buttonText: "#fff1f2",
  },
  foret: {
    pageBg: "#0c120b",
    backgroundImage: THEME_BACKGROUNDS.foret,
    panelBg: "rgba(34, 24, 14, 0.88)",
    border: "rgba(34, 197, 94, 0.3)",
    accent: "#22c55e",
    title: "#ecfccb",
    subtitle: "#bbf7d0",
    chipBg: "#2a1f14",
    buttonBg: "#15803d",
    buttonText: "#f0fdf4",
  },
  humain: {
    pageBg: "#111214",
    backgroundImage: THEME_BACKGROUNDS.humain,
    panelBg: "rgba(58, 60, 66, 0.86)",
    border: "rgba(148, 163, 184, 0.3)",
    accent: "#94a3b8",
    title: "#f1f5f9",
    subtitle: "#cbd5e1",
    chipBg: "#4b5563",
    buttonBg: "#64748b",
    buttonText: "#f8fafc",
  },
  nain: {
    pageBg: "#0f1318",
    backgroundImage: THEME_BACKGROUNDS.nain,
    panelBg: "rgba(42, 48, 56, 0.9)",
    border: "rgba(156, 163, 175, 0.34)",
    accent: "#d1d5db",
    title: "#f9fafb",
    subtitle: "#d1d5db",
    chipBg: "#374151",
    buttonBg: "#9ca3af",
    buttonText: "#111827",
  },
};

const ARCHETYPE_OPTIONS: Array<{
  id: ArchetypeId;
  label: string;
  specializations: string[];
  description: string;
  theme: CharacterTheme;
  template: Pick<
    Character,
    | "archetype"
    | "archetypeId"
    | "specialization"
    | "theme"
    | "pv"
    | "psy"
    | "armor"
    | "stats"
    | "skills"
    | "equipment"
    | "spells"
    | "statusEffects"
    | "resistances"
  >;
}> = [
  {
    id: "paladin",
    label: "Paladin",
    specializations: ["Collectionneur d'ames", "Chevalier"],
    description: "Combattant sacre melant arme lourde, sceaux et protection.",
    theme: "ange",
    template: {
      archetypeId: "paladin",
      archetype: "Paladin",
      specialization: "Chevalier",
      theme: "ange",
      pv: { current: 20, max: 20, bonus: 0 },
      psy: { current: 8, max: 8, bonus: 0 },
      armor: { current: 4, max: 4, bonus: 0 },
      stats: { physique: 68, mentale: 52, sociale: 42 },
      skills: [
        { id: "templ-pal-skill-1", name: "Armes lourdes", value: 15 },
        { id: "templ-pal-skill-2", name: "Theologie", value: 10 },
      ],
      equipment: [
        {
          id: "templ-pal-eq-1",
          name: "Lame consacree",
          category: "Arme",
          icon: "🗡️",
          notes: "Arme de predilection du paladin.",
          tags: ["arme", "ange", "sceau"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      spells: [
        {
          id: "templ-pal-spell-1",
          name: "Egide de foi",
          icon: "✦",
          basePsyCost: 3,
          reducible: true,
          description: "Renforce l'armure et la tenue de ligne.",
          tags: ["protection", "ange"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      statusEffects: [],
      resistances: [{ id: "templ-pal-res-1", label: "Corruption", type: "resistance" }],
    },
  },
  {
    id: "tireur",
    label: "Tireur",
    specializations: ["Ritualiste", "Pistolero"],
    description: "Specialiste des armes a feu, du controle de zone et des munitions rituelles.",
    theme: "humain",
    template: {
      archetypeId: "tireur",
      archetype: "Tireur",
      specialization: "Ritualiste",
      theme: "humain",
      pv: { current: 16, max: 16, bonus: 0 },
      psy: { current: 7, max: 7, bonus: 0 },
      armor: { current: 2, max: 2, bonus: 0 },
      stats: { physique: 56, mentale: 58, sociale: 34 },
      skills: [
        { id: "templ-tir-skill-1", name: "Armes a feu", value: 16 },
        { id: "templ-tir-skill-2", name: "Perception", value: 12 },
      ],
      equipment: [
        {
          id: "templ-tir-eq-1",
          name: "Fusil rituel",
          category: "Arme",
          icon: "🔫",
          notes: "Accepte des munitions consacrees.",
          tags: ["distance", "rituel"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      spells: [],
      statusEffects: [],
      resistances: [{ id: "templ-tir-res-1", label: "Embuscade", type: "resistance" }],
    },
  },
  {
    id: "dresseur",
    label: "Dresseur",
    specializations: ["Demoniste", "Maitre des betes"],
    description: "Controle des entites invoquees, pactes et projection de pouvoir.",
    theme: "demon",
    template: {
      archetypeId: "dresseur",
      archetype: "Dresseur",
      specialization: "Demoniste",
      theme: "demon",
      pv: { current: 14, max: 14, bonus: 0 },
      psy: { current: 12, max: 12, bonus: 0 },
      armor: { current: 1, max: 1, bonus: 0 },
      stats: { physique: 34, mentale: 67, sociale: 49 },
      skills: [
        { id: "templ-dre-skill-1", name: "Invocation", value: 16 },
        { id: "templ-dre-skill-2", name: "Pactes", value: 13 },
      ],
      equipment: [],
      spells: [
        {
          id: "templ-dre-spell-1",
          name: "Appel infernal",
          icon: "☾",
          basePsyCost: 5,
          reducible: true,
          description: "Invoque un serviteur mineur pour la scene.",
          tags: ["invocation", "demon"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      statusEffects: [],
      resistances: [{ id: "templ-dre-res-1", label: "Possession", type: "faiblesse" }],
    },
  },
  {
    id: "lecteur",
    label: "Lecteur de versets",
    specializations: ["Aria", "Moine"],
    description: "Versets saints, bannissement et soutien sacre.",
    theme: "ange",
    template: {
      archetypeId: "lecteur",
      archetype: "Lecteur de versets",
      specialization: "Aria",
      theme: "ange",
      pv: { current: 15, max: 15, bonus: 0 },
      psy: { current: 12, max: 12, bonus: 0 },
      armor: { current: 1, max: 1, bonus: 0 },
      stats: { physique: 38, mentale: 71, sociale: 58 },
      skills: [
        { id: "templ-lec-skill-1", name: "Versets", value: 18 },
        { id: "templ-lec-skill-2", name: "Theologie", value: 14 },
      ],
      equipment: [],
      spells: [
        {
          id: "templ-lec-spell-1",
          name: "Verset d'exil",
          icon: "📜",
          basePsyCost: 4,
          reducible: true,
          description: "Fragilise une entite et peut la bannir si elle est mineure.",
          tags: ["bannissement", "ange", "rituel"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      statusEffects: [],
      resistances: [{ id: "templ-lec-res-1", label: "Terreur", type: "resistance" }],
    },
  },
  {
    id: "guerisseur",
    label: "Guerisseur",
    specializations: ["Pretre", "Alchimiste"],
    description: "Soin, soutien, protection et miracles de terrain.",
    theme: "foret",
    template: {
      archetypeId: "guerisseur",
      archetype: "Guerisseur",
      specialization: "Pretre",
      theme: "foret",
      pv: { current: 14, max: 14, bonus: 0 },
      psy: { current: 14, max: 14, bonus: 0 },
      armor: { current: 1, max: 1, bonus: 0 },
      stats: { physique: 32, mentale: 69, sociale: 55 },
      skills: [
        { id: "templ-gue-skill-1", name: "Soins", value: 18 },
        { id: "templ-gue-skill-2", name: "Alchimie", value: 12 },
      ],
      equipment: [],
      spells: [
        {
          id: "templ-gue-spell-1",
          name: "Grace reparatrice",
          icon: "💧",
          basePsyCost: 4,
          reducible: true,
          description: "Rend des PV a un allie et purifie une souillure legere.",
          tags: ["soin", "ange"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      statusEffects: [],
      resistances: [{ id: "templ-gue-res-1", label: "Poisons", type: "resistance" }],
    },
  },
  {
    id: "receptacle",
    label: "Receptacle",
    specializations: ["Pandemoniste", "Gardien"],
    description: "Mage de combat hebergeant une entite scellee.",
    theme: "vide",
    template: {
      archetypeId: "receptacle",
      archetype: "Receptacle",
      specialization: "Pandemoniste",
      theme: "vide",
      pv: { current: 17, max: 17, bonus: 0 },
      psy: { current: 13, max: 13, bonus: 0 },
      armor: { current: 2, max: 2, bonus: 0 },
      stats: { physique: 43, mentale: 73, sociale: 28 },
      skills: [
        { id: "templ-rec-skill-1", name: "Canalisation", value: 17 },
        { id: "templ-rec-skill-2", name: "Volonte", value: 14 },
      ],
      equipment: [],
      spells: [
        {
          id: "templ-rec-spell-1",
          name: "Manifestation",
          icon: "🜏",
          basePsyCost: 5,
          reducible: false,
          description: "Projette une partie de l'entite scellee au combat.",
          tags: ["vide", "manifestation", "mage"],
          activeEffects: [],
          passiveEffects: [],
        },
      ],
      statusEffects: [],
      resistances: [{ id: "templ-rec-res-1", label: "Magie", type: "resistance" }],
    },
  },
  {
    id: "libre",
    label: "Libre",
    specializations: ["Personnalise"],
    description: "Creation totalement libre.",
    theme: "humain",
    template: {
      archetypeId: "libre",
      archetype: "Libre",
      specialization: "Personnalise",
      theme: "humain",
      pv: { current: 10, max: 10, bonus: 0 },
      psy: { current: 5, max: 5, bonus: 0 },
      armor: { current: 0, max: 0, bonus: 0 },
      stats: { physique: 0, mentale: 0, sociale: 0 },
      skills: [],
      equipment: [],
      spells: [],
      statusEffects: [],
      resistances: [],
    },
  },
];

const RESISTANCE_LABELS: Record<ResistanceType, string> = {
  resistance: "Resistance",
  faiblesse: "Faiblesse",
  immunite: "Immunite",
};

function parseTags(rawValue: string) {
  return rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTags(tags: string[]) {
  return tags.join(", ");
}

function cloneTemplate<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeSpell(spell: Spell): Spell {
  return {
    ...spell,
    imageModule: spell.imageModule,
    augmentable:
      spell.augmentable ??
      Boolean((spell as Spell & { scaling?: { label?: string; bonusPerPsy?: string } }).scaling),
    tags: spell.tags ?? [],
  };
}

function createTemplateCharacter(
  archetypeId: ArchetypeId = "libre",
  specialization?: string,
): Character {
  const archetypeOption =
    ARCHETYPE_OPTIONS.find((option) => option.id === archetypeId) ??
    ARCHETYPE_OPTIONS[ARCHETYPE_OPTIONS.length - 1]!;
  const template = cloneTemplate(archetypeOption.template);

  return {
    id: makeId("character"),
    name:
      archetypeId === "libre" ? "Nouveau personnage" : `Nouveau ${archetypeOption.label}`,
    bio: "",
    imageUrl: "",
    imageModule: undefined,
    level: 1,
    attackBonus: 0,
    activeSpellIds: [],
    inventory: [],
    stance: "focus",
    ...template,
    specialization: specialization ?? template.specialization,
  };
}

function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    archetypeId: character.archetypeId ?? "libre",
    specialization: character.specialization ?? "",
    bio: character.bio ?? "",
    theme: character.theme ?? "humain",
    pv: { ...character.pv, bonus: character.pv?.bonus ?? 0 },
    psy: { ...character.psy, bonus: 0 },
    armor: { ...character.armor, bonus: character.armor?.bonus ?? 0 },
    imageModule: character.imageModule,
    equipment: character.equipment.map((item) => ({
      ...item,
      imageModule: item.imageModule,
      grantedSpell: item.grantedSpell ? normalizeSpell(item.grantedSpell) : undefined,
      tags: item.tags ?? [],
    })),
    spells: character.spells.map(normalizeSpell),
    inventory: character.inventory.map((item) => ({
      ...item,
      imageModule: item.imageModule,
      tags: item.tags ?? [],
    })),
    statusEffects: character.statusEffects ?? [],
    resistances: character.resistances ?? [],
  };
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type EditorSection =
  | "all"
  | "identity"
  | "resources"
  | "stats"
  | "effects"
  | "resistances"
  | "skills"
  | "spells"
  | "equipment"
  | "inventory";

type OverlayMenu =
  | "character"
  | "theme"
  | "stance"
  | "bioView"
  | "bioEdit"
  | "quickCast"
  | "quickRecovery"
  | "editorArchetype"
  | "editorSpecialization";

type CreationDraft = {
  archetypeId: ArchetypeId;
  specialization: string;
  step: 1 | 2;
};

type DamageDraft = {
  amount: string;
  ignoreArmor: boolean;
};

type RecoveryDraft = {
  amount: string;
  mode: "heal" | "shield";
};

type QuickCastDraft = {
  kind: "spell" | "equipment" | "equipmentSpell";
  id: string;
  sourceEquipmentId?: string;
  extraPsy: number;
};

export function CharacterSheetScreen() {
  const { width } = useWindowDimensions();
  const [characters, setCharacters] = useState(sampleCharacters);
  const [selectedId, setSelectedId] = useState(sampleCharacters[0]?.id ?? "");
  const [activeOverlayMenu, setActiveOverlayMenu] = useState<OverlayMenu | null>(null);
  const [creationDraft, setCreationDraft] = useState<CreationDraft | null>(null);
  const [damageDraft, setDamageDraft] = useState<DamageDraft | null>(null);
  const [recoveryDraft, setRecoveryDraft] = useState<RecoveryDraft | null>(null);
  const [quickCastDraft, setQuickCastDraft] = useState<QuickCastDraft | null>(null);
  const [draftCharacter, setDraftCharacter] = useState<Character | null>(null);
  const [editorSection, setEditorSection] = useState<EditorSection>("all");
  const [storageReady, setStorageReady] = useState(false);
  const [rosterMessage, setRosterMessage] = useState<string | null>(null);

  const selectedCharacter =
    characters.find((character) => character.id === selectedId) ?? characters[0];

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const stored = await loadCharactersFromStorage();

        if (!active) {
          return;
        }

        if (stored.characters?.length) {
          const normalizedCharacters = stored.characters.map(normalizeCharacter);
          setCharacters(normalizedCharacters);
          setSelectedId(stored.selectedId ?? normalizedCharacters[0]!.id);
        }
      } finally {
        if (active) {
          setStorageReady(true);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    void persistCharactersToStorage(characters, selectedId);
  }, [characters, selectedId, storageReady]);

  if (!selectedCharacter) {
    return null;
  }
  const activeTheme = THEME_PRESETS[selectedCharacter.theme ?? "humain"];
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
  const isPhone = width < 720;
  const isLaptop = width >= 1280;
  const useSplitLayout = width >= 980;
  const useWideHero = width >= 860;
  const showOverlay =
    activeOverlayMenu !== null ||
    creationDraft !== null ||
    damageDraft !== null ||
    recoveryDraft !== null;

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

  async function handleExport() {
    await exportCharacters(characters);
    setRosterMessage("Export JSON pret.");
  }

  async function handleImport() {
    try {
      const importedCharacters = await importCharacters();

      if (!importedCharacters?.length) {
        return;
      }

      const normalizedCharacters = importedCharacters.map(normalizeCharacter);
      setCharacters(normalizedCharacters);
      setSelectedId(normalizedCharacters[0]!.id);
      setDraftCharacter(null);
      setCreationDraft(null);
      setDamageDraft(null);
      setRecoveryDraft(null);
      setQuickCastDraft(null);
      setActiveOverlayMenu(null);
      setRosterMessage(`${normalizedCharacters.length} personnage(s) importe(s).`);
    } catch {
      setRosterMessage("Import impossible: JSON invalide.");
    }
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
      let armorAbsorbed = 0;
      let shieldAbsorbed = 0;
      let pvAbsorbed = 0;

      const nextArmor = { ...character.armor };
      const nextPv = { ...character.pv };

      if (!damageDraft.ignoreArmor && remaining > 0) {
        armorAbsorbed = Math.min(nextArmor.current, remaining);
        nextArmor.current -= armorAbsorbed;
        remaining -= armorAbsorbed;
      }

      if (remaining > 0) {
        shieldAbsorbed = Math.min(nextPv.bonus, remaining);
        nextPv.bonus -= shieldAbsorbed;
        remaining -= shieldAbsorbed;
      }

      if (remaining > 0) {
        pvAbsorbed = Math.min(nextPv.current, remaining);
        nextPv.current -= pvAbsorbed;
        remaining -= pvAbsorbed;
      }

      const messageParts = [
        `${amount} degats recus`,
        !damageDraft.ignoreArmor && armorAbsorbed > 0 ? `${armorAbsorbed} absorbes par l'armure` : null,
        shieldAbsorbed > 0 ? `${shieldAbsorbed} absorbes par le bouclier` : null,
        pvAbsorbed > 0 ? `${pvAbsorbed} retires aux PV` : null,
        remaining > 0 ? `${remaining} non absorbes` : null,
      ].filter(Boolean);

      setRosterMessage(messageParts.join(" · "));

      return {
        ...character,
        armor: nextArmor,
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
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function openSectionEditor(section: EditorSection) {
    setEditorSection(section);
    setDraftCharacter(cloneTemplate(selectedCharacter!));
    setQuickCastDraft(null);
    setActiveOverlayMenu(null);
  }

  function closeEditor() {
    setActiveOverlayMenu(null);
    setEditorSection("all");
    setDraftCharacter(null);
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
    setActiveOverlayMenu(null);
    setEditorSection("all");
    setQuickCastDraft(null);
    setRosterMessage(`${draftCharacter.name} a ete supprime.`);
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
        ? {
            ...current,
            ...cloneTemplate(archetypeOption.template),
            name: current.name,
            imageUrl: current.imageUrl,
            imageModule: current.imageModule,
            level: current.level,
            attackBonus: current.attackBonus,
            activeSpellIds: [],
            inventory: current.inventory,
            stance: current.stance,
          }
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
              ...current.spells,
              {
                id: makeId("spell"),
                name: "Nouveau don",
                icon: "✦",
                basePsyCost: 0,
                reducible: true,
                augmentable: false,
                description: "",
                tags: [],
                activeEffects: [],
                passiveEffects: [],
              },
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
              ...current.inventory,
              {
                id: makeId("item"),
                name: "Nouvel item",
                icon: "📦",
                quantity: 1,
                notes: "",
                tags: [],
              },
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
              ...current.equipment,
              {
                id: makeId("equipment"),
                name: "Nouvel equipement",
                category: "Objet",
                icon: "🧰",
                notes: "",
                tags: [],
                activeEffects: [],
                passiveEffects: [],
                grantedSpell: undefined,
              },
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

  async function uploadDraftSpellImage(index: number) {
    const uri = await pickImageUri();

    if (!uri) {
      return;
    }

    updateDraftSpell(index, { imageUrl: uri });
  }

  async function uploadDraftEquipmentImage(index: number) {
    const uri = await pickImageUri();

    if (!uri) {
      return;
    }

    updateDraftEquipment(index, { imageUrl: uri });
  }

  async function uploadDraftEquipmentGrantedSpellImage(index: number) {
    const uri = await pickImageUri();

    if (!uri) {
      return;
    }

    updateDraftEquipmentGrantedSpell(index, { imageUrl: uri });
  }

  async function uploadDraftCharacterImage() {
    const uri = await pickImageUri();

    if (!uri) {
      return;
    }

    updateDraftField("imageUrl", uri);
  }

  async function uploadDraftInventoryImage(index: number) {
    const uri = await pickImageUri();

    if (!uri) {
      return;
    }

    updateDraftInventory(index, { imageUrl: uri });
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
    <ScrollView
      style={[styles.scroll, { backgroundColor: activeTheme.pageBg }]}
      contentContainerStyle={[
        styles.content,
        isPhone ? styles.contentPhone : isLaptop ? styles.contentLaptop : styles.contentTablet,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={activeTheme.backgroundImage}
        style={styles.pageBackdrop}
        resizeMode="cover"
      />
      <View
        style={[
          styles.pageBackdropOverlay,
          { backgroundColor: activeTheme.pageBg },
        ]}
      />
      <View style={[styles.pageGlow, { backgroundColor: activeTheme.accent }]} />
      <View
        style={[
          styles.navbar,
          isPhone ? styles.navbarMobile : isLaptop ? styles.navbarLaptop : styles.navbarTablet,
        ]}
      >
        <View style={styles.navBrandBlock}>
          <View style={styles.navBrandRow}>
            <Image
              source={APP_LOGO}
              style={[styles.navLogo, isPhone ? styles.navLogoPhone : null]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.navBrand,
                isPhone ? styles.navBrandPhone : null,
                { color: activeTheme.title },
              ]}
            >
              Vade Retro
            </Text>
          </View>
          <Text
            style={[
              styles.navSubtle,
              isPhone ? styles.navSubtlePhone : null,
              { color: activeTheme.subtitle },
            ]}
          >
            Compagnon de campagne
          </Text>
        </View>

        <View style={[styles.navRightGroup, isPhone ? styles.navRightGroupMobile : null]}>
          <View style={styles.navThemeWrap}>
            <Pressable
              onPress={() =>
                setActiveOverlayMenu((current) => (current === "theme" ? null : "theme"))
              }
              style={[
                styles.navThemeButton,
                { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
              ]}
            >
              <View style={styles.navThemeText}>
                <Text style={[styles.navCharacterLabel, { color: activeTheme.subtitle }]}>
                  Theme
                </Text>
                <Text style={[styles.navThemeValue, { color: activeTheme.title }]}>
                  {THEME_LABELS[selectedCharacter.theme]}
                </Text>
              </View>
              <Text style={[styles.navChevron, { color: activeTheme.title }]}>▾</Text>
            </Pressable>
          </View>

          <View style={styles.navMenuWrap}>
            <Pressable
              onPress={() =>
                setActiveOverlayMenu((current) => (current === "character" ? null : "character"))
              }
              style={[
                styles.navCharacterButton,
                { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
              ]}
            >
              <View style={styles.navCharacterSeal}>
                <Text style={[styles.navCharacterSealText, { color: activeTheme.accent }]}>
                  {selectedCharacter.name.slice(0, 1)}
                </Text>
              </View>
              <View style={styles.navCharacterText}>
                <Text style={[styles.navCharacterLabel, { color: activeTheme.subtitle }]}>
                  Personnage actif
                </Text>
                <Text style={[styles.navCharacterName, { color: activeTheme.title }]}>
                  {selectedCharacter.name}
                </Text>
              </View>
              <Text style={[styles.navChevron, { color: activeTheme.title }]}>▾</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {rosterMessage ? (
        <View
          style={[
            styles.messageBanner,
            { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
          ]}
        >
          <Text style={[styles.messageBannerText, { color: activeTheme.title }]}>
            {rosterMessage}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.hero,
          useWideHero ? styles.heroTablet : styles.heroMobile,
          { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
        ]}
      >
        <AssetVisual
          label={selectedCharacter.name}
          imageUrl={selectedCharacter.imageUrl}
          imageModule={selectedCharacter.imageModule}
          icon={selectedCharacter.name.slice(0, 1)}
          character
        />
        <View style={styles.heroText}>
          <Text style={[styles.eyebrow, { color: activeTheme.accent }]}>
            Feuille de personnage
          </Text>
          <Text style={[styles.title, { color: activeTheme.title }]}>
            {selectedCharacter.name}
          </Text>
          <Text style={[styles.description, { color: activeTheme.subtitle }]}>
            {selectedCharacter.archetype}
            {selectedCharacter.specialization
              ? ` · ${selectedCharacter.specialization}`
              : ""}
            {selectedCharacter.level ? ` · Niveau ${selectedCharacter.level}` : ""}
          </Text>
          <Pressable
            onPress={() =>
              setActiveOverlayMenu((current) => (current === "bioView" ? null : "bioView"))
            }
            style={[styles.heroBioButton, { backgroundColor: activeTheme.chipBg }]}
          >
            <Text style={[styles.heroBioButtonLabel, { color: activeTheme.title }]}>
              {selectedCharacter.bio ? "Voir la bio" : "Ajouter une bio"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroSide}>
          <Pressable
            onPress={() => openSectionEditor("identity")}
            style={[
              styles.heroEditIconButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.heroEditIconLabel, { color: activeTheme.title }]}>✎</Text>
          </Pressable>
          <Text style={[styles.heroSideLabel, { color: activeTheme.subtitle }]}>
            Position actuelle
          </Text>
          <View style={styles.stanceDropdownWrap}>
            <Pressable
              onPress={() =>
                setActiveOverlayMenu((current) => (current === "stance" ? null : "stance"))
              }
              style={[
                styles.stanceCompactButton,
                { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
              ]}
            >
              <Text style={[styles.stanceCompactValue, { color: activeTheme.title }]}>
                {stanceLabels[selectedCharacter.stance]}
              </Text>
              <Text style={[styles.stanceCompactChevron, { color: activeTheme.title }]}>
                ▾
              </Text>
            </Pressable>
          </View>
          <Text style={[styles.heroSideDescription, { color: activeTheme.subtitle }]}>
            {stanceDescriptions[selectedCharacter.stance]}
          </Text>
        </View>
      </View>

      {draftCharacter ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={closeEditor}
        >
          <View style={styles.editorModalBackdrop}>
            <Pressable style={StyleSheet.absoluteFillObject} onPress={closeEditor} />
            <View style={styles.editorModalWrap}>
              <ScrollView
                style={styles.editorModalScroll}
                contentContainerStyle={styles.editorModalContent}
                showsVerticalScrollIndicator={false}
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
          }}
          rightSlot={
            <View style={styles.editorActions}>
              <Pressable
                onPress={deleteDraftCharacter}
                style={styles.editorDangerButton}
              >
                <Text style={styles.editorDangerButtonLabel}>Supprimer</Text>
              </Pressable>
              <Pressable onPress={closeEditor} style={styles.editorGhostButton}>
                <Text style={styles.editorGhostButtonLabel}>Annuler</Text>
              </Pressable>
              <Pressable onPress={saveEditor} style={styles.editorPrimaryButton}>
                <Text style={styles.editorPrimaryButtonLabel}>Sauvegarder</Text>
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
              <Text style={styles.editorHint}>
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
            <EditorField
              label="Attaque bonus"
              value={String(draftCharacter.attackBonus)}
              keyboardType="numeric"
              onChangeText={(value) =>
                updateDraftField(
                  "attackBonus",
                  Math.max(0, Number.parseInt(value || "0", 10) || 0),
                )
              }
            />
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
                void uploadDraftCharacterImage();
              }}
              style={styles.editorUploadButton}
            >
              <Text style={styles.editorUploadButtonLabel}>Choisir une image</Text>
            </Pressable>
          </View>
          </>
          ) : null}

          {editingAll || editorSection === "resources" ? (
          <View style={styles.editorGroup}>
            <Text style={styles.editorGroupTitle}>Ressources</Text>
            {([
              ["pv", "PV"],
              ["psy", "PSY"],
              ["armor", "Armure"],
            ] as const).map(([key, label]) => (
              <View key={key} style={styles.editorResourceBlock}>
                <Text style={styles.editorResourceTitle}>{label}</Text>
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
            <Text style={styles.editorGroupTitle}>Stats</Text>
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
              <Text style={styles.editorGroupTitle}>Effets persistants</Text>
              <Pressable onPress={addDraftStatusEffect} style={styles.editorAddButton}>
                <Text style={styles.editorAddButtonLabel}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.statusEffects.map((effect, index) => (
                <View key={effect.id} style={styles.editorCard}>
                  <View style={styles.editorCardHeader}>
                    <Text style={styles.editorCardTitle}>Effet</Text>
                    <Pressable
                      onPress={() => removeDraftStatusEffect(index)}
                      style={styles.editorRemoveButton}
                    >
                      <Text style={styles.editorRemoveButtonLabel}>Supprimer</Text>
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
                    <EditorField
                      label="Tags"
                      value={formatTags(effect.tags)}
                      onChangeText={(value) =>
                        updateDraftStatusEffect(index, { tags: parseTags(value) })
                      }
                    />
                  </View>
                  <View style={styles.editorToggleRow}>
                    <Text style={styles.editorInlineLabel}>Effet actif</Text>
                    <Pressable
                      onPress={() =>
                        updateDraftStatusEffect(index, { active: !effect.active })
                      }
                      style={[
                        styles.editorToggleButton,
                        effect.active ? styles.editorToggleButtonActive : null,
                      ]}
                    >
                      <Text style={styles.editorToggleButtonLabel}>
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
              <Text style={styles.editorGroupTitle}>Affinites</Text>
              <Pressable onPress={addDraftResistance} style={styles.editorAddButton}>
                <Text style={styles.editorAddButtonLabel}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.resistances.map((entry, index) => (
                <View key={entry.id} style={styles.editorCard}>
                  <View style={styles.editorCardHeader}>
                    <Text style={styles.editorCardTitle}>Affinite</Text>
                    <Pressable
                      onPress={() => removeDraftResistance(index)}
                      style={styles.editorRemoveButton}
                    >
                      <Text style={styles.editorRemoveButtonLabel}>Supprimer</Text>
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
                              entry.type === type ? styles.themeOptionActive : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.themeOptionLabel,
                                entry.type === type ? styles.themeOptionLabelActive : null,
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
              <Text style={styles.editorGroupTitle}>Competences</Text>
              <Pressable onPress={addDraftSkill} style={styles.editorAddButton}>
                <Text style={styles.editorAddButtonLabel}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.skills.map((skill, index) => (
                <View key={skill.id} style={styles.editorCard}>
                  <View style={styles.editorCardHeader}>
                    <Text style={styles.editorCardTitle}>Competence</Text>
                    <Pressable
                      onPress={() => removeDraftSkill(index)}
                      style={styles.editorRemoveButton}
                    >
                      <Text style={styles.editorRemoveButtonLabel}>Supprimer</Text>
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
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={styles.editorGroupTitle}>Dons</Text>
              <Pressable onPress={addDraftSpell} style={styles.editorAddButton}>
                <Text style={styles.editorAddButtonLabel}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.spells.map((spell, index) => (
                <View key={spell.id} style={styles.editorCard}>
                  <View style={styles.editorCardHeader}>
                    <Text style={styles.editorCardTitle}>Don</Text>
                    <Pressable
                      onPress={() => removeDraftSpell(index)}
                      style={styles.editorRemoveButton}
                    >
                      <Text style={styles.editorRemoveButtonLabel}>Supprimer</Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorGrid}>
                    <EditorField
                      label="Nom"
                      value={spell.name}
                      onChangeText={(value) => updateDraftSpell(index, { name: value })}
                    />
                    <EditorField
                      label="Tags"
                      value={formatTags(spell.tags)}
                      onChangeText={(value) =>
                        updateDraftSpell(index, { tags: parseTags(value) })
                      }
                    />
                    <EditorField
                      label="Cout PSY"
                      value={String(spell.basePsyCost)}
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        updateDraftSpell(index, {
                          basePsyCost:
                            Math.max(0, Number.parseInt(value || "0", 10) || 0),
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
                        void uploadDraftSpellImage(index);
                      }}
                      style={styles.editorUploadButton}
                    >
                      <Text style={styles.editorUploadButtonLabel}>
                        Choisir une image
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorToggleRow}>
                    <Text style={styles.editorInlineLabel}>Reducible en Focus</Text>
                    <Pressable
                      onPress={() =>
                        updateDraftSpell(index, { reducible: !spell.reducible })
                      }
                      style={[
                        styles.editorToggleButton,
                        spell.reducible ? styles.editorToggleButtonActive : null,
                      ]}
                    >
                      <Text style={styles.editorToggleButtonLabel}>
                        {spell.reducible ? "Oui" : "Non"}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorToggleRow}>
                    <Text style={styles.editorInlineLabel}>Augmentable</Text>
                    <Pressable
                      onPress={() =>
                        updateDraftSpell(index, { augmentable: !(spell.augmentable ?? false) })
                      }
                      style={[
                        styles.editorToggleButton,
                        spell.augmentable ? styles.editorToggleButtonActive : null,
                      ]}
                    >
                      <Text style={styles.editorToggleButtonLabel}>
                        {spell.augmentable ? "Oui" : "Non"}
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    value={spell.description}
                    onChangeText={(value) =>
                      updateDraftSpell(index, { description: value })
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
                    placeholder="Description du don"
                    placeholderTextColor={activeTheme.subtitle}
                  />
                  <Text style={[styles.editorHint, { color: activeTheme.subtitle, marginTop: 0 }]}>
                    Si un don est augmentable, l'action rapide permettra d'injecter du PSY
                    supplementaire selon la reserve restante du personnage.
                  </Text>
                </View>
              ))}
            </View>
          </View>
          ) : null}

          {editingAll || editorSection === "equipment" ? (
          <View style={styles.editorGroup}>
            <View style={styles.editorGroupHeader}>
              <Text style={styles.editorGroupTitle}>Equipements</Text>
              <Pressable onPress={addDraftEquipment} style={styles.editorAddButton}>
                <Text style={styles.editorAddButtonLabel}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.equipment.map((item, index) => (
                <View key={item.id} style={styles.editorCard}>
                  <View style={styles.editorCardHeader}>
                    <Text style={styles.editorCardTitle}>Equipement</Text>
                    <Pressable
                      onPress={() => removeDraftEquipment(index)}
                      style={styles.editorRemoveButton}
                    >
                      <Text style={styles.editorRemoveButtonLabel}>Supprimer</Text>
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
                    <EditorField
                      label="Tags"
                      value={formatTags(item.tags)}
                      onChangeText={(value) =>
                        updateDraftEquipment(index, { tags: parseTags(value) })
                      }
                    />
                    <EditorField
                      label="Action utilisable"
                      value={item.usableLabel ?? ""}
                      onChangeText={(value) =>
                        updateDraftEquipment(index, { usableLabel: value })
                      }
                    />
                    <EditorField
                      label="Cout PSY"
                      value={String(item.usePsyCost ?? 0)}
                      keyboardType="numeric"
                      onChangeText={(value) =>
                        updateDraftEquipment(index, {
                          usePsyCost: Math.max(0, Number.parseInt(value || "0", 10) || 0),
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
                        void uploadDraftEquipmentImage(index);
                      }}
                      style={styles.editorUploadButton}
                    >
                      <Text style={styles.editorUploadButtonLabel}>
                        Choisir une image
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorToggleRow}>
                    <Text style={styles.editorInlineLabel}>Cout reductible en Focus</Text>
                    <Pressable
                      onPress={() =>
                        updateDraftEquipment(index, { reducible: !(item.reducible ?? false) })
                      }
                      style={[
                        styles.editorToggleButton,
                        item.reducible ? styles.editorToggleButtonActive : null,
                      ]}
                    >
                      <Text style={styles.editorToggleButtonLabel}>
                        {item.reducible ? "Oui" : "Non"}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.editorToggleRow}>
                    <Text style={styles.editorInlineLabel}>Don associe</Text>
                    <Pressable
                      onPress={() => toggleDraftEquipmentGrantedSpell(index)}
                      style={[
                        styles.editorToggleButton,
                        item.grantedSpell ? styles.editorToggleButtonActive : null,
                      ]}
                    >
                      <Text style={styles.editorToggleButtonLabel}>
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
                        <EditorField
                          label="Tags"
                          value={formatTags(item.grantedSpell.tags)}
                          onChangeText={(value) =>
                            updateDraftEquipmentGrantedSpell(index, {
                              tags: parseTags(value),
                            })
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
                            void uploadDraftEquipmentGrantedSpellImage(index);
                          }}
                          style={styles.editorUploadButton}
                        >
                          <Text style={styles.editorUploadButtonLabel}>
                            Choisir une image
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.editorToggleRow}>
                        <Text style={styles.editorInlineLabel}>Reductible en Focus</Text>
                        <Pressable
                          onPress={() =>
                            updateDraftEquipmentGrantedSpell(index, {
                              reducible: !item.grantedSpell?.reducible,
                            })
                          }
                          style={[
                            styles.editorToggleButton,
                            item.grantedSpell.reducible
                              ? styles.editorToggleButtonActive
                              : null,
                          ]}
                        >
                          <Text style={styles.editorToggleButtonLabel}>
                            {item.grantedSpell.reducible ? "Oui" : "Non"}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.editorToggleRow}>
                        <Text style={styles.editorInlineLabel}>Augmentable</Text>
                        <Pressable
                          onPress={() =>
                            updateDraftEquipmentGrantedSpell(index, {
                              augmentable: !(item.grantedSpell?.augmentable ?? false),
                            })
                          }
                          style={[
                            styles.editorToggleButton,
                            item.grantedSpell.augmentable
                              ? styles.editorToggleButtonActive
                              : null,
                          ]}
                        >
                          <Text style={styles.editorToggleButtonLabel}>
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
              <Text style={styles.editorGroupTitle}>Inventaire</Text>
              <Pressable onPress={addDraftInventoryItem} style={styles.editorAddButton}>
                <Text style={styles.editorAddButtonLabel}>Ajouter</Text>
              </Pressable>
            </View>
            <View style={styles.editorList}>
              {draftCharacter.inventory.map((item, index) => (
                <View key={item.id} style={styles.editorCard}>
                  <View style={styles.editorCardHeader}>
                    <Text style={styles.editorCardTitle}>Item</Text>
                    <Pressable
                      onPress={() => removeDraftInventoryItem(index)}
                      style={styles.editorRemoveButton}
                    >
                      <Text style={styles.editorRemoveButtonLabel}>Supprimer</Text>
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
                    <EditorField
                      label="Tags"
                      value={formatTags(item.tags)}
                      onChangeText={(value) =>
                        updateDraftInventory(index, { tags: parseTags(value) })
                      }
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
                        void uploadDraftInventoryImage(index);
                      }}
                      style={styles.editorUploadButton}
                    >
                      <Text style={styles.editorUploadButtonLabel}>
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
          </View>
        </Modal>
      ) : null}

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
              {damageDraft ? (
                <>
                  <View style={styles.overlayHeader}>
                    <View style={styles.overlayHeaderText}>
                      <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                        Prendre des degats
                      </Text>
                      <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                        Les degats sont absorbes par l'armure, puis le bouclier, puis les PV.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setDamageDraft(null)}
                      style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                    >
                      <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                        Fermer
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.overlayOptionList}>
                    <View
                      style={[
                        styles.damageEditorCard,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text style={[styles.editorFieldLabel, { color: activeTheme.subtitle }]}>
                        Montant des degats
                      </Text>
                      <TextInput
                        value={damageDraft.amount}
                        onChangeText={(amount) =>
                          setDamageDraft((current) => (current ? { ...current, amount } : current))
                        }
                        keyboardType="numeric"
                        style={[
                          styles.editorInput,
                          {
                            backgroundColor: activeTheme.chipBg,
                            borderColor: activeTheme.border,
                            color: activeTheme.title,
                          },
                        ]}
                        placeholder="0"
                        placeholderTextColor={activeTheme.subtitle}
                      />
                      <Pressable
                        onPress={() =>
                          setDamageDraft((current) =>
                            current
                              ? { ...current, ignoreArmor: !current.ignoreArmor }
                              : current,
                          )
                        }
                        style={[
                          styles.damageToggle,
                          {
                            backgroundColor: damageDraft.ignoreArmor
                              ? activeTheme.accent
                              : activeTheme.panelBg,
                            borderColor: activeTheme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.damageToggleLabel,
                            {
                              color: damageDraft.ignoreArmor
                                ? activeTheme.pageBg
                                : activeTheme.title,
                            },
                          ]}
                        >
                          {damageDraft.ignoreArmor ? "☑" : "☐"} Ignorer l'armure
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.overlayActions}>
                    <Pressable
                      onPress={() => setDamageDraft(null)}
                      style={[
                        styles.overlaySecondaryButton,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text
                        style={[styles.overlaySecondaryButtonLabel, { color: activeTheme.title }]}
                      >
                        Annuler
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={applyDamage}
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
                        Appliquer
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : recoveryDraft ? (
                <>
                  <View style={styles.overlayHeader}>
                    <View style={styles.overlayHeaderText}>
                      <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                        Soigner / bouclier
                      </Text>
                      <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                        Restaure des PV ou ajoute un bouclier temporaire.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setRecoveryDraft(null)}
                      style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                    >
                      <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                        Fermer
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.overlayOptionList}>
                    <View
                      style={[
                        styles.damageEditorCard,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <View style={styles.quickModeRow}>
                        <Pressable
                          onPress={() =>
                            setRecoveryDraft((current) =>
                              current ? { ...current, mode: "heal" } : current,
                            )
                          }
                          style={[
                            styles.quickModeButton,
                            recoveryDraft.mode === "heal"
                              ? { backgroundColor: activeTheme.buttonBg }
                              : { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.quickModeButtonLabel,
                              {
                                color:
                                  recoveryDraft.mode === "heal"
                                    ? activeTheme.buttonText
                                    : activeTheme.title,
                              },
                            ]}
                          >
                            Soigner
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            setRecoveryDraft((current) =>
                              current ? { ...current, mode: "shield" } : current,
                            )
                          }
                          style={[
                            styles.quickModeButton,
                            recoveryDraft.mode === "shield"
                              ? { backgroundColor: activeTheme.buttonBg }
                              : { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.quickModeButtonLabel,
                              {
                                color:
                                  recoveryDraft.mode === "shield"
                                    ? activeTheme.buttonText
                                    : activeTheme.title,
                              },
                            ]}
                          >
                            Bouclier
                          </Text>
                        </Pressable>
                      </View>
                      <Text style={[styles.editorFieldLabel, { color: activeTheme.subtitle }]}>
                        Montant
                      </Text>
                      <TextInput
                        value={recoveryDraft.amount}
                        onChangeText={(amount) =>
                          setRecoveryDraft((current) => (current ? { ...current, amount } : current))
                        }
                        keyboardType="numeric"
                        style={[
                          styles.editorInput,
                          {
                            backgroundColor: activeTheme.chipBg,
                            borderColor: activeTheme.border,
                            color: activeTheme.title,
                          },
                        ]}
                        placeholder="0"
                        placeholderTextColor={activeTheme.subtitle}
                      />
                    </View>
                  </View>
                  <View style={styles.overlayActions}>
                    <Pressable
                      onPress={() => setRecoveryDraft(null)}
                      style={[
                        styles.overlaySecondaryButton,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text
                        style={[styles.overlaySecondaryButtonLabel, { color: activeTheme.title }]}
                      >
                        Annuler
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={applyRecovery}
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
                        Appliquer
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : activeOverlayMenu === "quickCast" ? (
                <>
                  <View style={styles.overlayHeader}>
                    <View style={styles.overlayHeaderText}>
                      <Text style={[styles.overlayTitle, { color: activeTheme.title }]}>
                        Lancer un sort
                      </Text>
                      <Text style={[styles.overlaySubtitle, { color: activeTheme.subtitle }]}>
                        Dons et equipements utilisables qui consomment du PSY.
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setQuickCastDraft(null);
                        setActiveOverlayMenu(null);
                      }}
                      style={[styles.overlayCloseButton, { borderColor: activeTheme.border }]}
                    >
                      <Text style={[styles.overlayCloseButtonLabel, { color: activeTheme.title }]}>
                        Fermer
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.overlayOptionList}>
                    {selectedCharacter.spells.map((spell) => {
                      const cost = getSpellCost(spell, selectedCharacter.stance);
                      const reduced = spell.reducible && cost < spell.basePsyCost;
                      const isSelected =
                        quickCastDraft?.kind === "spell" && quickCastDraft.id === spell.id;

                      return (
                        <Pressable
                          key={spell.id}
                          onPress={() => selectQuickCastSpell(spell.id)}
                          style={[
                            styles.overlayOptionCard,
                            {
                              backgroundColor: activeTheme.chipBg,
                              borderColor: isSelected ? activeTheme.accent : activeTheme.border,
                            },
                          ]}
                        >
                          <View style={styles.quickCastRow}>
                            <AssetVisual
                              label={spell.name}
                              icon={spell.icon}
                              imageUrl={spell.imageUrl}
                              imageModule={spell.imageModule}
                              small
                            />
                            <View style={styles.quickCastBody}>
                              <View style={styles.quickCastHeader}>
                                <Text
                                  style={[styles.overlayOptionTitle, { color: activeTheme.title }]}
                                >
                                  {spell.name}
                                </Text>
                                <Text
                                  style={[
                                    styles.quickCastCost,
                                    reduced ? styles.quickCastCostReduced : null,
                                  ]}
                                >
                                  {cost} PSY
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.overlayOptionDescription,
                                  { color: activeTheme.subtitle },
                                ]}
                              >
                                {spell.description}
                              </Text>
                              {spell.augmentable ? (
                                <Text
                                  style={[
                                    styles.quickCastScalingHint,
                                    { color: activeTheme.subtitle },
                                  ]}
                                >
                                  Injection de PSY supplementaire possible
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                    {selectedCharacter.equipment
                      .filter((item) => (item.usePsyCost ?? 0) > 0)
                      .map((item) => {
                        const cost = getReducibleCost(
                          item.usePsyCost ?? 0,
                          item.reducible ?? false,
                          selectedCharacter.stance,
                        );
                        const reduced =
                          (item.reducible ?? false) && cost < (item.usePsyCost ?? 0);
                        const isSelected =
                          quickCastDraft?.kind === "equipment" && quickCastDraft.id === item.id;

                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => selectQuickCastEquipment(item.id)}
                            style={[
                              styles.overlayOptionCard,
                              {
                                backgroundColor: activeTheme.chipBg,
                                borderColor: isSelected ? activeTheme.accent : activeTheme.border,
                              },
                            ]}
                          >
                            <View style={styles.quickCastHeader}>
                              <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                                {item.usableLabel ?? item.name}
                              </Text>
                              <Text
                                style={[
                                  styles.quickCastCost,
                                  reduced ? styles.quickCastCostReduced : null,
                                ]}
                              >
                                {cost} PSY
                              </Text>
                            </View>
                            <Text
                              style={[styles.overlayOptionDescription, { color: activeTheme.subtitle }]}
                            >
                              Equipement · {item.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    {selectedCharacter.equipment
                      .filter((item) => item.grantedSpell)
                      .map((item) => {
                        const spell = item.grantedSpell!;
                        const cost = getSpellCost(spell, selectedCharacter.stance);
                        const reduced = spell.reducible && cost < spell.basePsyCost;
                        const isSelected =
                          quickCastDraft?.kind === "equipmentSpell" &&
                          quickCastDraft.id === spell.id &&
                          quickCastDraft.sourceEquipmentId === item.id;

                        return (
                          <Pressable
                            key={`${item.id}-${spell.id}`}
                            onPress={() => selectQuickCastEquipmentSpell(item.id, spell.id)}
                            style={[
                              styles.overlayOptionCard,
                              {
                                backgroundColor: activeTheme.chipBg,
                                borderColor: isSelected ? activeTheme.accent : activeTheme.border,
                              },
                            ]}
                          >
                            <View style={styles.quickCastRow}>
                              <AssetVisual
                                label={spell.name}
                                icon={spell.icon}
                                imageUrl={spell.imageUrl}
                                imageModule={spell.imageModule}
                                small
                              />
                              <View style={styles.quickCastBody}>
                                <View style={styles.quickCastHeader}>
                                  <Text
                                    style={[styles.overlayOptionTitle, { color: activeTheme.title }]}
                                  >
                                    {spell.name}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.quickCastCost,
                                      reduced ? styles.quickCastCostReduced : null,
                                    ]}
                                  >
                                    {cost} PSY
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.overlayOptionDescription,
                                    { color: activeTheme.subtitle },
                                  ]}
                                >
                                  Don d'equipement · {item.name}
                                </Text>
                                {spell.augmentable ? (
                                  <Text
                                    style={[
                                      styles.quickCastScalingHint,
                                      { color: activeTheme.subtitle },
                                    ]}
                                  >
                                    Injection de PSY supplementaire possible
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          </Pressable>
                        );
                      })}
                  </View>
                  {selectedQuickCastSpell ? (
                    <View
                      style={[
                        styles.quickCastDetailCard,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text style={[styles.quickCastDetailTitle, { color: activeTheme.title }]}>
                        Reglage du sort · {selectedQuickCastSpell.name}
                      </Text>
                      <Text
                        style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                      >
                        Cout de base applique:{" "}
                        {getSpellCost(selectedQuickCastSpell, selectedCharacter.stance)} PSY
                        {selectedQuickCastSpell.reducible &&
                        getSpellCost(selectedQuickCastSpell, selectedCharacter.stance) <
                          selectedQuickCastSpell.basePsyCost
                          ? " (Focus deja pris en compte)"
                          : ""}
                      </Text>
                      {selectedQuickCastSpell.augmentable ? (
                        <>
                          {(() => {
                            const baseCost = getSpellCost(
                              selectedQuickCastSpell,
                              selectedCharacter.stance,
                            );
                            const maxExtraPsy = Math.max(
                              0,
                              selectedCharacter.psy.current - baseCost,
                            );

                            return (
                              <>
                          <Text
                            style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                          >
                            PSY supplementaire disponible: {maxExtraPsy}
                          </Text>
                          <View style={styles.quickCastAdjustRow}>
                            <Pressable
                              onPress={() => adjustQuickCastExtra(-1)}
                              style={[
                                styles.quickCastAdjustButton,
                                {
                                  backgroundColor: activeTheme.buttonBg,
                                  opacity: quickCastDraft?.extraPsy ? 1 : 0.55,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.quickCastAdjustButtonLabel,
                                  { color: activeTheme.buttonText },
                                ]}
                              >
                                -1 PSY
                              </Text>
                            </Pressable>
                            <View
                              style={[
                                styles.quickCastAdjustValue,
                                { borderColor: activeTheme.border },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.quickCastAdjustValueLabel,
                                  { color: activeTheme.title },
                                ]}
                              >
                                +{quickCastDraft?.extraPsy ?? 0} PSY
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => adjustQuickCastExtra(1)}
                              style={[
                                styles.quickCastAdjustButton,
                                {
                                  backgroundColor: activeTheme.buttonBg,
                                  opacity: (quickCastDraft?.extraPsy ?? 0) < maxExtraPsy ? 1 : 0.55,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.quickCastAdjustButtonLabel,
                                  { color: activeTheme.buttonText },
                                ]}
                              >
                                +1 PSY
                              </Text>
                            </Pressable>
                          </View>
                          <Text
                            style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                          >
                            Total:{" "}
                            {getScaledSpellCost(
                              selectedQuickCastSpell,
                              selectedCharacter.stance,
                              quickCastDraft?.extraPsy ?? 0,
                            )}{" "}
                            PSY
                          </Text>
                          <Text
                            style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                          >
                            Injection actuelle: +{quickCastDraft?.extraPsy ?? 0} PSY
                          </Text>
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <Text
                          style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                        >
                          Ce sort a un cout fixe. Aucun PSY supplementaire ne peut etre ajoute.
                        </Text>
                      )}
                      <View style={styles.overlayActions}>
                        <Pressable
                          onPress={() => setQuickCastDraft(null)}
                          style={[
                            styles.overlaySecondaryButton,
                            { borderColor: activeTheme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.overlaySecondaryButtonLabel,
                              { color: activeTheme.title },
                            ]}
                          >
                            Retour
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={confirmQuickCast}
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
                            Lancer
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                  {selectedQuickCastEquipmentSpell && selectedQuickCastEquipmentSpellSource ? (
                    <View
                      style={[
                        styles.quickCastDetailCard,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text style={[styles.quickCastDetailTitle, { color: activeTheme.title }]}>
                        Reglage du don d'equipement · {selectedQuickCastEquipmentSpell.name}
                      </Text>
                      <Text
                        style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                      >
                        Equipement source · {selectedQuickCastEquipmentSpellSource.name}
                      </Text>
                      <Text
                        style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                      >
                        Cout de base applique:{" "}
                        {getSpellCost(selectedQuickCastEquipmentSpell, selectedCharacter.stance)} PSY
                        {selectedQuickCastEquipmentSpell.reducible &&
                        getSpellCost(selectedQuickCastEquipmentSpell, selectedCharacter.stance) <
                          selectedQuickCastEquipmentSpell.basePsyCost
                          ? " (Focus deja pris en compte)"
                          : ""}
                      </Text>
                      {selectedQuickCastEquipmentSpell.augmentable ? (
                        <>
                          {(() => {
                            const baseCost = getSpellCost(
                              selectedQuickCastEquipmentSpell,
                              selectedCharacter.stance,
                            );
                            const maxExtraPsy = Math.max(
                              0,
                              selectedCharacter.psy.current - baseCost,
                            );

                            return (
                              <>
                                <Text
                                  style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                                >
                                  PSY supplementaire disponible: {maxExtraPsy}
                                </Text>
                                <View style={styles.quickCastAdjustRow}>
                                  <Pressable
                                    onPress={() => adjustQuickCastExtra(-1)}
                                    style={[
                                      styles.quickCastAdjustButton,
                                      {
                                        backgroundColor: activeTheme.buttonBg,
                                        opacity: quickCastDraft?.extraPsy ? 1 : 0.55,
                                      },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.quickCastAdjustButtonLabel,
                                        { color: activeTheme.buttonText },
                                      ]}
                                    >
                                      -1 PSY
                                    </Text>
                                  </Pressable>
                                  <View
                                    style={[
                                      styles.quickCastAdjustValue,
                                      { borderColor: activeTheme.border },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.quickCastAdjustValueLabel,
                                        { color: activeTheme.title },
                                      ]}
                                    >
                                      +{quickCastDraft?.extraPsy ?? 0} PSY
                                    </Text>
                                  </View>
                                  <Pressable
                                    onPress={() => adjustQuickCastExtra(1)}
                                    style={[
                                      styles.quickCastAdjustButton,
                                      {
                                        backgroundColor: activeTheme.buttonBg,
                                        opacity:
                                          (quickCastDraft?.extraPsy ?? 0) < maxExtraPsy ? 1 : 0.55,
                                      },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.quickCastAdjustButtonLabel,
                                        { color: activeTheme.buttonText },
                                      ]}
                                    >
                                      +1 PSY
                                    </Text>
                                  </Pressable>
                                </View>
                                <Text
                                  style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                                >
                                  Total:{" "}
                                  {getScaledSpellCost(
                                    selectedQuickCastEquipmentSpell,
                                    selectedCharacter.stance,
                                    quickCastDraft?.extraPsy ?? 0,
                                  )}{" "}
                                  PSY
                                </Text>
                                <Text
                                  style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                                >
                                  Injection actuelle: +{quickCastDraft?.extraPsy ?? 0} PSY
                                </Text>
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <Text
                          style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                        >
                          Ce don a un cout fixe. Aucun PSY supplementaire ne peut etre ajoute.
                        </Text>
                      )}
                      <View style={styles.overlayActions}>
                        <Pressable
                          onPress={() => setQuickCastDraft(null)}
                          style={[
                            styles.overlaySecondaryButton,
                            { borderColor: activeTheme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.overlaySecondaryButtonLabel,
                              { color: activeTheme.title },
                            ]}
                          >
                            Retour
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={confirmQuickCast}
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
                            Lancer
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                  {selectedQuickCastEquipment ? (
                    <View
                      style={[
                        styles.quickCastDetailCard,
                        { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text style={[styles.quickCastDetailTitle, { color: activeTheme.title }]}>
                        Utiliser l'equipement · {selectedQuickCastEquipment.usableLabel ??
                          selectedQuickCastEquipment.name}
                      </Text>
                      <Text
                        style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                      >
                        Cout total:{" "}
                        {getReducibleCost(
                          selectedQuickCastEquipment.usePsyCost ?? 0,
                          selectedQuickCastEquipment.reducible ?? false,
                          selectedCharacter.stance,
                        )}{" "}
                        PSY
                      </Text>
                      <Text
                        style={[styles.quickCastDetailText, { color: activeTheme.subtitle }]}
                      >
                        Equipement source · {selectedQuickCastEquipment.name}
                      </Text>
                      <View style={styles.overlayActions}>
                        <Pressable
                          onPress={() => setQuickCastDraft(null)}
                          style={[
                            styles.overlaySecondaryButton,
                            { borderColor: activeTheme.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.overlaySecondaryButtonLabel,
                              { color: activeTheme.title },
                            ]}
                          >
                            Retour
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={confirmQuickCast}
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
                            Utiliser
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </>
              ) : activeOverlayMenu === "bioView" ? (
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
              ) : activeOverlayMenu === "theme" ? (
                <View style={styles.overlayOptionList}>
                  {(Object.keys(THEME_LABELS) as CharacterTheme[]).map((themeKey) => (
                    <Pressable
                      key={themeKey}
                      onPress={() => setCharacterTheme(selectedCharacter.id, themeKey)}
                      style={[
                        styles.overlayOptionCard,
                        {
                          backgroundColor: activeTheme.chipBg,
                          borderColor:
                            selectedCharacter.theme === themeKey
                              ? activeTheme.accent
                              : activeTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.overlayOptionTitle, { color: activeTheme.title }]}>
                        {THEME_LABELS[themeKey]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : activeOverlayMenu === "character" ? (
                <View style={styles.overlayOptionList}>
                  <View
                    style={[
                      styles.characterOverlayActions,
                      { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                    ]}
                  >
                    <Pressable
                      onPress={openCreationWizard}
                      style={[
                        styles.characterOverlayActionButton,
                        { backgroundColor: activeTheme.buttonBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.characterOverlayActionLabel,
                          { color: activeTheme.buttonText },
                        ]}
                      >
                        Nouveau
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        void handleImport();
                      }}
                      style={[
                        styles.characterOverlayActionButton,
                        { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.characterOverlayActionLabel,
                          { color: activeTheme.title },
                        ]}
                      >
                        Importer
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        void handleExport();
                      }}
                      style={[
                        styles.characterOverlayActionButton,
                        { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.characterOverlayActionLabel,
                          { color: activeTheme.title },
                        ]}
                      >
                        Exporter
                      </Text>
                    </Pressable>
                  </View>
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
            </View>
          </View>
        </Modal>
      ) : null}

      <View style={styles.bannerRow}>
        <View style={[styles.bannerTag, { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border }]}>
          <Text style={[styles.bannerTagLabel, { color: activeTheme.title }]}>
            {selectedCharacter.spells.length} dons
          </Text>
        </View>
        <View style={[styles.bannerTag, { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border }]}>
          <Text style={[styles.bannerTagLabel, { color: activeTheme.title }]}>
            {selectedCharacter.equipment.length} equipements
          </Text>
        </View>
        <View style={[styles.bannerTag, { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border }]}>
          <Text style={[styles.bannerTagLabel, { color: activeTheme.title }]}>
            {selectedCharacter.inventory.length} objets
          </Text>
        </View>
      </View>

      {useSplitLayout ? (
        <>
          <View style={styles.tabletSectionGrid}>
            <View
              style={[
                styles.tabletPrimaryColumn,
                isLaptop ? styles.tabletPrimaryColumnLaptop : styles.tabletPrimaryColumnTablet,
              ]}
            >
              <ResourcesSection
                character={selectedCharacter}
                theme={activeTheme}
                onEdit={() => openSectionEditor("resources")}
                onAdjustResource={(resourceKey, delta) =>
                  updateResource(selectedCharacter.id, resourceKey, delta)
                }
                onAdjustResourceBonus={(resourceKey, delta) =>
                  updateResourceBonus(selectedCharacter.id, resourceKey, delta)
                }
                onAdjustAttackBonus={(delta) => updateAttackBonus(selectedCharacter.id, delta)}
              />
              <InventorySection
                character={selectedCharacter}
                theme={activeTheme}
                onEdit={() => openSectionEditor("inventory")}
              />
            </View>
            <View
              style={[
                styles.tabletSecondaryColumn,
                isLaptop
                  ? styles.tabletSecondaryColumnLaptop
                  : styles.tabletSecondaryColumnTablet,
              ]}
            >
              <View
                style={[
                  styles.quickActionsCard,
                  { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                ]}
              >
                <Text style={[styles.quickActionsHint, { color: activeTheme.subtitle }]}>
                  Actions rapides
                </Text>
                <View style={styles.quickActionsButtons}>
                  <Pressable
                    onPress={openDamageDialog}
                    style={[styles.quickActionButton, { backgroundColor: activeTheme.buttonBg }]}
                  >
                    <Text
                      style={[
                        styles.quickActionButtonLabel,
                        { color: activeTheme.buttonText },
                      ]}
                    >
                      Prendre des degats
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={openQuickCastDialog}
                    style={[styles.quickActionButton, { backgroundColor: activeTheme.chipBg }]}
                  >
                    <Text style={[styles.quickActionButtonLabel, { color: activeTheme.title }]}>
                      Lancer un sort
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={openRecoveryDialog}
                    style={[styles.quickActionButton, { backgroundColor: activeTheme.chipBg }]}
                  >
                    <Text style={[styles.quickActionButtonLabel, { color: activeTheme.title }]}>
                      Soigner / bouclier
                    </Text>
                  </Pressable>
                </View>
              </View>
              <StatsSkillsSection
                character={selectedCharacter}
                theme={activeTheme}
                onEditStats={() => openSectionEditor("stats")}
                onEditSkills={() => openSectionEditor("skills")}
              />
          <StatusSections
            character={selectedCharacter}
            theme={activeTheme}
            onEditResistances={() => openSectionEditor("resistances")}
          />
              <SpellsSection
                character={selectedCharacter}
                theme={activeTheme}
                onEdit={() => openSectionEditor("spells")}
                onToggleSpellActive={(spellId) =>
                  toggleSpellActive(selectedCharacter.id, spellId)
                }
              />
            </View>
          </View>
          <EquipmentSection
            character={selectedCharacter}
            theme={activeTheme}
            onEdit={() => openSectionEditor("equipment")}
          />
        </>
      ) : (
        <>
          <ResourcesSection
            character={selectedCharacter}
            theme={activeTheme}
            onEdit={() => openSectionEditor("resources")}
            onAdjustResource={(resourceKey, delta) =>
              updateResource(selectedCharacter.id, resourceKey, delta)
            }
            onAdjustResourceBonus={(resourceKey, delta) =>
              updateResourceBonus(selectedCharacter.id, resourceKey, delta)
            }
            onAdjustAttackBonus={(delta) => updateAttackBonus(selectedCharacter.id, delta)}
          />

          <View
            style={[
              styles.quickActionsCard,
              { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.quickActionsHint, { color: activeTheme.subtitle }]}>
              Actions rapides
            </Text>
            <View style={styles.quickActionsButtons}>
              <Pressable
                onPress={openDamageDialog}
                style={[styles.quickActionButton, { backgroundColor: activeTheme.buttonBg }]}
              >
                <Text
                  style={[
                    styles.quickActionButtonLabel,
                    { color: activeTheme.buttonText },
                  ]}
                >
                  Prendre des degats
                </Text>
              </Pressable>
              <Pressable
                onPress={openQuickCastDialog}
                style={[styles.quickActionButton, { backgroundColor: activeTheme.chipBg }]}
              >
                <Text style={[styles.quickActionButtonLabel, { color: activeTheme.title }]}>
                  Lancer un sort
                </Text>
              </Pressable>
              <Pressable
                onPress={openRecoveryDialog}
                style={[styles.quickActionButton, { backgroundColor: activeTheme.chipBg }]}
              >
                <Text style={[styles.quickActionButtonLabel, { color: activeTheme.title }]}>
                  Soigner / bouclier
                </Text>
              </Pressable>
            </View>
          </View>

          <StatsSkillsSection
            character={selectedCharacter}
            theme={activeTheme}
            onEditStats={() => openSectionEditor("stats")}
            onEditSkills={() => openSectionEditor("skills")}
          />

          <StatusSections
            character={selectedCharacter}
            theme={activeTheme}
            onEditResistances={() => openSectionEditor("resistances")}
          />

          <InventorySection
            character={selectedCharacter}
            theme={activeTheme}
            onEdit={() => openSectionEditor("inventory")}
          />

          <SpellsSection
            character={selectedCharacter}
            theme={activeTheme}
            onEdit={() => openSectionEditor("spells")}
            onToggleSpellActive={(spellId) => toggleSpellActive(selectedCharacter.id, spellId)}
          />

          <EquipmentSection
            character={selectedCharacter}
            theme={activeTheme}
            onEdit={() => openSectionEditor("equipment")}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#070b16",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 18,
  },
  contentPhone: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  contentTablet: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 1120,
    paddingHorizontal: 22,
  },
  contentLaptop: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 1480,
    paddingHorizontal: 28,
  },
  pageBackdrop: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  pageBackdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.58,
  },
  pageGlow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 999,
    opacity: 0.1,
  },
  navbar: {
    gap: 16,
    zIndex: 100,
  },
  navbarTablet: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  navbarLaptop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navbarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  navBrandBlock: {
    flexShrink: 1,
  },
  navBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navLogo: {
    width: 42,
    height: 42,
  },
  navLogoPhone: {
    width: 34,
    height: 34,
  },
  navBrand: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  navBrandPhone: {
    fontSize: 22,
  },
  navSubtle: {
    color: "#8ea0bf",
    marginTop: 4,
  },
  navSubtlePhone: {
    fontSize: 12,
  },
  navActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  navActionsMobile: {
    justifyContent: "flex-start",
  },
  navRightGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },
  navRightGroupMobile: {
    justifyContent: "space-between",
  },
  navActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#11182d",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  navActionButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  navMenuWrap: {
    position: "relative",
    minWidth: 230,
    maxWidth: 320,
    flexGrow: 1,
    alignSelf: "stretch",
    zIndex: 120,
  },
  navThemeWrap: {
    position: "relative",
    minWidth: 150,
    flexGrow: 1,
    zIndex: 121,
  },
  navThemeButton: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  navThemeText: {
    flex: 1,
    gap: 2,
  },
  navThemeValue: {
    fontSize: 15,
    fontWeight: "800",
    paddingRight: 18,
  },
  navCharacterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.18)",
  },
  navCharacterSeal: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b2440",
  },
  navCharacterSealText: {
    color: "#fbbf24",
    fontWeight: "800",
  },
  navCharacterText: {
    flex: 1,
  },
  navCharacterLabel: {
    color: "#91a1bd",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  navCharacterName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  navChevron: {
    color: "#f8fafc",
    fontSize: 14,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#0b1224",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    overflow: "hidden",
  },
  dropdownFloating: {
    position: "absolute",
    top: "100%",
    right: 0,
    left: 0,
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#0b1224",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    overflow: "hidden",
    zIndex: 140,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.1)",
  },
  dropdownItemActive: {
    backgroundColor: "#141f3a",
  },
  dropdownTitle: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  dropdownTitleActive: {
    color: "#fbbf24",
  },
  dropdownSubtitle: {
    color: "#8ea0bf",
    marginTop: 3,
    lineHeight: 18,
    fontSize: 12,
  },
  hero: {
    gap: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.14)",
    overflow: "visible",
    zIndex: 20,
  },
  heroTablet: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  heroMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  messageBanner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#10182d",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  messageBannerText: {
    color: "#dbe4f0",
    fontWeight: "700",
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 6, 14, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  overlayCard: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "88%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  overlayHeaderText: {
    flex: 1,
    gap: 4,
  },
  overlayTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  overlaySubtitle: {
    lineHeight: 20,
  },
  overlayCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  overlayCloseButtonLabel: {
    fontWeight: "800",
  },
  overlayOptionList: {
    gap: 12,
  },
  characterOverlayActions: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  characterOverlayActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  characterOverlayActionLabel: {
    fontWeight: "800",
  },
  overlayOptionCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  overlayOptionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  overlayOptionDescription: {
    lineHeight: 20,
  },
  bioDialogCard: {
    maxHeight: 420,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  bioDialogScroll: {
    maxHeight: 380,
  },
  bioDialogText: {
    fontSize: 14,
    lineHeight: 22,
  },
  damageEditorCard: {
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  damageToggle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  damageToggleLabel: {
    fontWeight: "800",
  },
  creationSummaryCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  creationSummaryTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  creationSummaryDescription: {
    lineHeight: 20,
  },
  creationSummaryMeta: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  overlayActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  overlaySecondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  overlaySecondaryButtonLabel: {
    fontWeight: "800",
  },
  overlayPrimaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  overlayPrimaryButtonLabel: {
    fontWeight: "900",
  },
  editorModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 6, 14, 0.72)",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  editorModalWrap: {
    maxHeight: "92%",
  },
  editorModalScroll: {
    flexGrow: 0,
  },
  editorModalContent: {
    paddingVertical: 4,
  },
  sectionEditButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionEditButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  eyebrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "900",
  },
  description: {
    color: "#b9c6da",
    fontSize: 15,
  },
  heroBioButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 2,
  },
  heroBioButtonLabel: {
    fontWeight: "800",
  },
  heroSide: {
    width: "100%",
    maxWidth: 280,
    gap: 8,
    zIndex: 25,
  },
  heroEditIconButton: {
    alignSelf: "flex-end",
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroEditIconLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  heroSideLabel: {
    color: "#8ea0bf",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stanceDropdownWrap: {
    position: "relative",
    zIndex: 40,
  },
  stanceCompactButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#131c33",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
  },
  stanceCompactValue: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  stanceCompactChevron: {
    color: "#f8fafc",
  },
  heroSideDescription: {
    color: "#9caec8",
    lineHeight: 20,
    fontSize: 13,
  },
  editorActions: {
    flexDirection: "row",
    gap: 10,
  },
  editorBioButton: {
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  editorBioButtonLabel: {
    fontWeight: "800",
  },
  editorBioButtonHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  editorDangerButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#3a1420",
  },
  editorDangerButtonLabel: {
    color: "#fecdd3",
    fontWeight: "800",
  },
  editorGhostButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#11182d",
  },
  editorGhostButtonLabel: {
    color: "#c8d5e8",
    fontWeight: "700",
  },
  editorPrimaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fbbf24",
  },
  editorPrimaryButtonLabel: {
    color: "#3f2200",
    fontWeight: "900",
  },
  editorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  editorField: {
    flexGrow: 1,
    flexBasis: 180,
    gap: 6,
  },
  editorFieldOverlayTop: {
    zIndex: 90,
  },
  editorFieldOverlayMid: {
    zIndex: 80,
  },
  themePicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#11182d",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  themeOptionActive: {
    backgroundColor: "#1b2740",
    borderColor: "rgba(251, 191, 36, 0.28)",
  },
  themeOptionLabel: {
    color: "#cbd5e1",
    fontWeight: "700",
    fontSize: 12,
  },
  themeOptionLabelActive: {
    color: "#fbbf24",
  },
  editorFieldLabel: {
    color: "#9caec8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  editorHint: {
    color: "#8ea0bf",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  editorDropdownWrap: {
    position: "relative",
    zIndex: 60,
  },
  editorSelectButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  editorSelectValue: {
    flex: 1,
    fontWeight: "700",
  },
  editorSelectChevron: {
    fontSize: 14,
    fontWeight: "800",
  },
  editorDropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    zIndex: 80,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  editorInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    color: "#f8fafc",
  },
  bioEditorInput: {
    minHeight: 280,
  },
  editorTextArea: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  editorGroup: {
    gap: 12,
  },
  editorGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  editorGroupTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },
  editorAddButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1b2740",
  },
  editorAddButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
    fontSize: 12,
  },
  editorResourceBlock: {
    gap: 10,
    paddingTop: 6,
  },
  editorResourceTitle: {
    color: "#fbbf24",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  editorList: {
    gap: 12,
  },
  editorCard: {
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  editorCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  editorCardTitle: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  editorRemoveButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#3a1420",
  },
  editorRemoveButtonLabel: {
    color: "#fecdd3",
    fontWeight: "800",
    fontSize: 12,
  },
  editorInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editorInlineLabel: {
    flex: 1,
    color: "#f8fafc",
    fontWeight: "700",
  },
  editorInlineInputWrap: {
    width: 110,
  },
  editorInventoryBlock: {
    gap: 8,
  },
  editorToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  editorMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editorUploadButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1b2740",
  },
  editorUploadButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  editorToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#11182d",
  },
  editorToggleButtonActive: {
    backgroundColor: "#1b2740",
  },
  editorToggleButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  bannerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tabletSectionGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },
  tabletPrimaryColumn: {
    flex: 1.05,
    gap: 18,
  },
  tabletPrimaryColumnTablet: {
    flex: 1,
  },
  tabletPrimaryColumnLaptop: {
    flex: 1.08,
  },
  tabletSecondaryColumn: {
    flex: 0.95,
    gap: 18,
  },
  tabletSecondaryColumnTablet: {
    flex: 1,
  },
  tabletSecondaryColumnLaptop: {
    flex: 0.92,
  },
  bannerTag: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#11182d",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  bannerTagLabel: {
    color: "#dbe4f0",
    fontWeight: "700",
    fontSize: 12,
  },
  quickActionsCard: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  quickActionsHint: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  quickActionsButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickActionButtonLabel: {
    fontWeight: "900",
  },
  quickModeRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickModeButtonLabel: {
    fontWeight: "800",
  },
  quickCastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  quickCastRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  quickCastBody: {
    flex: 1,
    gap: 6,
  },
  quickCastScalingHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  quickCastCost: {
    color: "#082f49",
    backgroundColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  quickCastCostReduced: {
    color: "#3f2200",
    backgroundColor: "#fbbf24",
  },
  quickCastDetailCard: {
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 2,
  },
  quickCastDetailTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  quickCastDetailText: {
    lineHeight: 20,
  },
  quickCastAdjustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  quickCastAdjustButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickCastAdjustButtonLabel: {
    fontWeight: "900",
  },
  quickCastAdjustValue: {
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  quickCastAdjustValueLabel: {
    fontWeight: "900",
  },
  dualColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    alignItems: "stretch",
  },
  dualColumn: {
    flexGrow: 1,
    flexBasis: 320,
    alignSelf: "stretch",
  },
  equalHeightCard: {
    flex: 1,
  },
  effectList: {
    gap: 12,
  },
  effectCard: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  effectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  effectHeaderText: {
    flex: 1,
    gap: 4,
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  effectSource: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  effectActiveToggle: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  effectActiveToggleLabel: {
    fontWeight: "800",
    fontSize: 12,
  },
  effectDescription: {
    lineHeight: 20,
  },
  effectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  effectTurns: {
    fontWeight: "800",
  },
  resistanceList: {
    gap: 12,
  },
  resistanceCard: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  resistanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  resistanceLabel: {
    fontWeight: "800",
    fontSize: 15,
    flex: 1,
  },
  resistanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  resistanceBadgeLabel: {
    fontWeight: "800",
    fontSize: 12,
  },
  resourceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  resourceCard: {
    flexGrow: 1,
    flexBasis: 210,
    alignItems: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
  },
  resourceName: {
    color: "#f8fafc",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  resourceGlyphFrame: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  resourceGlyphWrap: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceGlyphFillMask: {
    width: 96,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  resourceGlyphFill: {
    fontSize: 76,
    lineHeight: 82,
  },
  resourceCount: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  resourceBonus: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: "700",
  },
  resourceButtons: {
    flexDirection: "row",
    gap: 10,
  },
  attackGlyph: {
    color: "#fbbf24",
    fontSize: 76,
    lineHeight: 82,
  },
  adjustButton: {
    minWidth: 54,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1b2740",
  },
  adjustButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 140,
    gap: 6,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17223c",
  },
  statIcon: {
    color: "#fbbf24",
    fontSize: 15,
    fontWeight: "800",
  },
  statLabel: {
    color: "#9caec8",
    textTransform: "capitalize",
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    width: "100%",
  },
  table: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#121c34",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tableHeaderText: {
    color: "#8ea0bf",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#0d1426",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.08)",
  },
  tableNameColumn: {
    flex: 1,
  },
  tableCell: {
    color: "#f8fafc",
  },
  tableBonus: {
    color: "#fbbf24",
    fontWeight: "900",
  },
  inventoryList: {
    gap: 10,
  },
  inventoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  inventoryBody: {
    flex: 1,
    gap: 3,
  },
  inventoryName: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  inventoryNotes: {
    color: "#8ea0bf",
    fontSize: 12,
  },
  inventoryQty: {
    color: "#fbbf24",
    fontWeight: "900",
  },
  assetTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assetTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  assetTagLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  assetGrid: {
    gap: 14,
  },
  assetCard: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.12)",
  },
  assetCardActive: {
    backgroundColor: "#122237",
    borderColor: "rgba(251, 191, 36, 0.4)",
  },
  equipmentList: {
    gap: 14,
  },
  equipmentCard: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.12)",
  },
  assetVisual: {
    width: 84,
    height: 84,
    borderRadius: 20,
  },
  characterVisual: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  assetVisualButton: {
    borderRadius: 20,
  },
  assetVisualSmall: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  assetFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17223c",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  assetFallbackActive: {
    backgroundColor: "#2a3557",
    borderColor: "rgba(251, 191, 36, 0.35)",
  },
  assetFallbackText: {
    fontSize: 34,
  },
  assetFallbackSmallText: {
    fontSize: 18,
  },
  assetBody: {
    flex: 1,
    gap: 8,
  },
  equipmentBody: {
    flex: 1,
    gap: 8,
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  assetBadgeColumn: {
    alignItems: "flex-end",
    gap: 8,
  },
  assetHeading: {
    flex: 1,
    gap: 3,
  },
  assetTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
  },
  assetMeta: {
    color: "#8ea0bf",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  costBadge: {
    color: "#082f49",
    backgroundColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  costBadgeReduced: {
    color: "#3f2200",
    backgroundColor: "#fbbf24",
  },
  activeBadge: {
    color: "#3f2200",
    backgroundColor: "#fde68a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  assetDescription: {
    color: "#d7deeb",
    lineHeight: 21,
  },
  assetEffect: {
    color: "#b1c0d7",
    lineHeight: 20,
  },
  emptyText: {
    color: "#7d8eab",
  },
});
