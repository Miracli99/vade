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
import { clampValue, getSpellCost, stanceDescriptions, stanceLabels } from "../utils/game";
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

function createTemplateCharacter(archetypeId: ArchetypeId = "libre"): Character {
  const archetypeOption =
    ARCHETYPE_OPTIONS.find((option) => option.id === archetypeId) ??
    ARCHETYPE_OPTIONS[ARCHETYPE_OPTIONS.length - 1]!;
  const template = cloneTemplate(archetypeOption.template);

  return {
    id: makeId("character"),
    name: "Nouveau personnage",
    imageUrl: "",
    imageModule: undefined,
    level: 1,
    attackBonus: 0,
    activeSpellIds: [],
    inventory: [],
    stance: "focus",
    ...template,
  };
}

function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    archetypeId: character.archetypeId ?? "libre",
    specialization: character.specialization ?? "",
    theme: character.theme ?? "humain",
    imageModule: character.imageModule,
    equipment: character.equipment.map((item) => ({
      ...item,
      imageModule: item.imageModule,
      tags: item.tags ?? [],
    })),
    spells: character.spells.map((spell) => ({
      ...spell,
      imageModule: spell.imageModule,
      tags: spell.tags ?? [],
    })),
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

export function CharacterSheetScreen() {
  const { width } = useWindowDimensions();
  const [characters, setCharacters] = useState(sampleCharacters);
  const [selectedId, setSelectedId] = useState(sampleCharacters[0]?.id ?? "");
  const [characterMenuOpen, setCharacterMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [stanceMenuOpen, setStanceMenuOpen] = useState(false);
  const [editorArchetypeMenuOpen, setEditorArchetypeMenuOpen] = useState(false);
  const [editorSpecializationMenuOpen, setEditorSpecializationMenuOpen] = useState(false);
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
  const selectedArchetypeOption =
    (draftCharacter
      ? ARCHETYPE_OPTIONS.find((option) => option.id === draftCharacter.archetypeId)
      : undefined) ?? ARCHETYPE_OPTIONS[ARCHETYPE_OPTIONS.length - 1]!;
  const editingAll = editorSection === "all";

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
    setStanceMenuOpen(false);
  }

  function setCharacterTheme(characterId: string, theme: CharacterTheme) {
    updateCharacter(characterId, (character) => ({
      ...character,
      theme,
    }));
    setDraftCharacter((current) =>
      current && current.id === characterId ? { ...current, theme } : current,
    );
    setThemeMenuOpen(false);
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
      setRosterMessage(`${normalizedCharacters.length} personnage(s) importe(s).`);
    } catch {
      setRosterMessage("Import impossible: JSON invalide.");
    }
  }

  function createCharacter() {
    const newCharacter = createTemplateCharacter("libre");

    setCharacters((currentCharacters) => [...currentCharacters, newCharacter]);
    setSelectedId(newCharacter.id);
    setCharacterMenuOpen(false);
    setDraftCharacter(cloneTemplate(newCharacter));
    setRosterMessage("Nouveau personnage cree.");
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
  }

  function openSectionEditor(section: EditorSection) {
    setEditorSection(section);
    setDraftCharacter(cloneTemplate(selectedCharacter!));
  }

  function closeEditor() {
    setThemeMenuOpen(false);
    setEditorArchetypeMenuOpen(false);
    setEditorSpecializationMenuOpen(false);
    setEditorSection("all");
    setDraftCharacter(null);
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
    setThemeMenuOpen(false);
    setEditorArchetypeMenuOpen(false);
    setEditorSpecializationMenuOpen(false);
    setEditorSection("all");
    setDraftCharacter(null);
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
    setThemeMenuOpen(false);
    setEditorArchetypeMenuOpen(false);
    setEditorSpecializationMenuOpen(false);
    setEditorSection("all");
    setCharacterMenuOpen(false);
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
              [field]: nextValue,
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
    setEditorArchetypeMenuOpen(false);
    setEditorSpecializationMenuOpen(false);
  }

  function updateDraftSpecialization(value: string) {
    updateDraftField("specialization", value);
    setEditorSpecializationMenuOpen(false);
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
      contentContainerStyle={styles.content}
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
      <View style={styles.navbar}>
        <View>
          <Text style={[styles.navBrand, { color: activeTheme.title }]}>Vade Retro</Text>
          <Text style={[styles.navSubtle, { color: activeTheme.subtitle }]}>
            Compagnon de campagne
          </Text>
        </View>

        <View style={styles.navActions}>
          <Pressable
            onPress={createCharacter}
            style={[
              styles.navActionButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.navActionButtonLabel, { color: activeTheme.title }]}>
              Nouveau
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void handleImport();
            }}
            style={[
              styles.navActionButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.navActionButtonLabel, { color: activeTheme.title }]}>
              Importer
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void handleExport();
            }}
            style={[
              styles.navActionButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.navActionButtonLabel, { color: activeTheme.title }]}>
              Exporter
            </Text>
          </Pressable>
        </View>

        <View style={styles.navRightGroup}>
          <View style={styles.navThemeWrap}>
            <Pressable
              onPress={() => setThemeMenuOpen((current) => !current)}
              style={[
                styles.navThemeButton,
                { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
              ]}
            >
              <Text style={[styles.navCharacterLabel, { color: activeTheme.subtitle }]}>
                Theme
              </Text>
              <Text style={[styles.navThemeValue, { color: activeTheme.title }]}>
                {THEME_LABELS[selectedCharacter.theme]}
              </Text>
              <Text style={[styles.navChevron, { color: activeTheme.title }]}>▾</Text>
            </Pressable>

            {themeMenuOpen ? (
              <View
                style={[
                  styles.dropdownFloating,
                  { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                ]}
              >
                {(Object.keys(THEME_LABELS) as CharacterTheme[]).map((themeKey) => (
                  <Pressable
                    key={themeKey}
                    onPress={() => setCharacterTheme(selectedCharacter.id, themeKey)}
                    style={[
                      styles.dropdownItem,
                      selectedCharacter.theme === themeKey
                        ? { backgroundColor: activeTheme.chipBg }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownTitle,
                        { color: activeTheme.title },
                        selectedCharacter.theme === themeKey ? styles.dropdownTitleActive : null,
                        selectedCharacter.theme === themeKey
                          ? { color: activeTheme.accent }
                          : null,
                      ]}
                    >
                      {THEME_LABELS[themeKey]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.navMenuWrap}>
            <Pressable
              onPress={() => setCharacterMenuOpen((current) => !current)}
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

            {characterMenuOpen ? (
              <View
                style={[
                  styles.dropdownFloating,
                  { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                ]}
              >
                {characters.map((character) => {
                  const active = character.id === selectedCharacter.id;

                  return (
                    <Pressable
                      key={character.id}
                      onPress={() => {
                        setSelectedId(character.id);
                        setCharacterMenuOpen(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        active ? { backgroundColor: activeTheme.chipBg } : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownTitle,
                          { color: activeTheme.title },
                          active ? styles.dropdownTitleActive : null,
                          active ? { color: activeTheme.accent } : null,
                        ]}
                      >
                        {character.name}
                      </Text>
                      <Text style={[styles.dropdownSubtitle, { color: activeTheme.subtitle }]}>
                        {character.archetype}
                        {character.level ? ` · Niv ${character.level}` : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
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
        </View>

        <View style={styles.heroSide}>
          <Text style={[styles.heroSideLabel, { color: activeTheme.subtitle }]}>
            Position actuelle
          </Text>
          <View style={styles.stanceDropdownWrap}>
            <Pressable
              onPress={() => setStanceMenuOpen((current) => !current)}
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

            {stanceMenuOpen ? (
              <View
                style={[
                  styles.dropdownFloating,
                  { backgroundColor: activeTheme.panelBg, borderColor: activeTheme.border },
                ]}
              >
                {STANCES.map((stance) => (
                  <Pressable
                    key={stance}
                    onPress={() => setStance(selectedCharacter.id, stance)}
                    style={[
                      styles.dropdownItem,
                      stance === selectedCharacter.stance
                        ? { backgroundColor: activeTheme.chipBg }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownTitle,
                        { color: activeTheme.title },
                        stance === selectedCharacter.stance
                          ? styles.dropdownTitleActive
                          : null,
                        stance === selectedCharacter.stance
                          ? { color: activeTheme.accent }
                          : null,
                      ]}
                    >
                      {stanceLabels[stance]}
                    </Text>
                    <Text style={[styles.dropdownSubtitle, { color: activeTheme.subtitle }]}>
                      {stanceDescriptions[stance]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <Text style={[styles.heroSideDescription, { color: activeTheme.subtitle }]}>
            {stanceDescriptions[selectedCharacter.stance]}
          </Text>
          <Pressable
            onPress={() => openSectionEditor("identity")}
            style={[styles.editButton, { backgroundColor: activeTheme.chipBg }]}
          >
            <Text style={[styles.editButtonLabel, { color: activeTheme.title }]}>
              Editer le profil
            </Text>
          </Pressable>
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
              <Text style={styles.editorFieldLabel}>Archetype</Text>
              <View style={styles.editorDropdownWrap}>
                <Pressable
                  onPress={() =>
                    setEditorArchetypeMenuOpen((current) => !current)
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
                {editorArchetypeMenuOpen ? (
                  <View
                    style={[
                      styles.editorDropdownMenu,
                      {
                        backgroundColor: activeTheme.panelBg,
                        borderColor: activeTheme.border,
                      },
                    ]}
                  >
                    {ARCHETYPE_OPTIONS.map((option) => (
                      <Pressable
                        key={option.id}
                        onPress={() => applyArchetypeTemplate(option.id)}
                        style={[
                          styles.dropdownItem,
                          draftCharacter.archetypeId === option.id
                            ? { backgroundColor: activeTheme.chipBg }
                            : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownTitle,
                            { color: activeTheme.title },
                            draftCharacter.archetypeId === option.id
                              ? styles.dropdownTitleActive
                              : null,
                            draftCharacter.archetypeId === option.id
                              ? { color: activeTheme.accent }
                              : null,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={[styles.dropdownSubtitle, { color: activeTheme.subtitle }]}>
                          {option.description}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <Text style={styles.editorHint}>
                {selectedArchetypeOption.description}
              </Text>
            </View>
            <View style={[styles.editorField, styles.editorFieldOverlayMid]}>
              <Text style={styles.editorFieldLabel}>Specialisation</Text>
              <View style={styles.editorDropdownWrap}>
                <Pressable
                  onPress={() =>
                    setEditorSpecializationMenuOpen((current) => !current)
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
                {editorSpecializationMenuOpen ? (
                  <View
                    style={[
                      styles.editorDropdownMenu,
                      {
                        backgroundColor: activeTheme.panelBg,
                        borderColor: activeTheme.border,
                      },
                    ]}
                  >
                    {selectedArchetypeOption.specializations.map((specialization) => (
                      <Pressable
                        key={specialization}
                        onPress={() => updateDraftSpecialization(specialization)}
                        style={[
                          styles.dropdownItem,
                          draftCharacter.specialization === specialization
                            ? { backgroundColor: activeTheme.chipBg }
                            : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownTitle,
                            { color: activeTheme.title },
                            draftCharacter.specialization === specialization
                              ? styles.dropdownTitleActive
                              : null,
                            draftCharacter.specialization === specialization
                              ? { color: activeTheme.accent }
                              : null,
                          ]}
                        >
                          {specialization}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
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
                  <EditorField
                    label="Bonus"
                    value={String(draftCharacter[key].bonus)}
                    keyboardType="numeric"
                    onChangeText={(value) => updateDraftResource(key, "bonus", value)}
                  />
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
                    style={[styles.editorInput, styles.editorTextArea]}
                    multiline
                    placeholder="Description de l'effet"
                    placeholderTextColor="#6f84a7"
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
                      <Text style={styles.editorFieldLabel}>Type</Text>
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
                    style={[styles.editorInput, styles.editorTextArea]}
                    multiline
                    placeholder="Notes sur l'affinite"
                    placeholderTextColor="#6f84a7"
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
                      label="Icone"
                      value={spell.icon ?? ""}
                      onChangeText={(value) => updateDraftSpell(index, { icon: value })}
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
                  <TextInput
                    value={spell.description}
                    onChangeText={(value) =>
                      updateDraftSpell(index, { description: value })
                    }
                    style={[styles.editorInput, styles.editorTextArea]}
                    multiline
                    placeholder="Description du don"
                    placeholderTextColor="#6f84a7"
                  />
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
                      label="Icone"
                      value={item.icon ?? ""}
                      onChangeText={(value) =>
                        updateDraftEquipment(index, { icon: value })
                      }
                    />
                    <EditorField
                      label="Tags"
                      value={formatTags(item.tags)}
                      onChangeText={(value) =>
                        updateDraftEquipment(index, { tags: parseTags(value) })
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
                  <TextInput
                    value={item.notes ?? ""}
                    onChangeText={(value) =>
                      updateDraftEquipment(index, { notes: value })
                    }
                    style={[styles.editorInput, styles.editorTextArea]}
                    multiline
                    placeholder="Notes de l'equipement"
                    placeholderTextColor="#6f84a7"
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
                      label="Icone"
                      value={item.icon ?? ""}
                      onChangeText={(value) => updateDraftInventory(index, { icon: value })}
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
                    style={[styles.editorInput, styles.editorTextArea]}
                    multiline
                    placeholder="Commentaire d'inventaire"
                    placeholderTextColor="#6f84a7"
                  />
                </View>
              ))}
            </View>
          </View>
          ) : null}
        </Section>
              </ScrollView>
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
        <View style={[styles.bannerTag, { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border }]}>
          <Text style={[styles.bannerTagLabel, { color: activeTheme.title }]}>
            {selectedCharacter.statusEffects.filter((effect) => effect.active).length} effets actifs
          </Text>
        </View>
      </View>

      <Section
        title="Ressources"
        subtitle="Ajustement rapide pendant la partie."
        theme={{
          sectionBg: activeTheme.panelBg,
          sectionBorder: activeTheme.border,
          title: activeTheme.title,
          subtitle: activeTheme.subtitle,
        }}
        rightSlot={
          <Pressable
            onPress={() => openSectionEditor("resources")}
            style={[
              styles.sectionEditButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
          </Pressable>
        }
      >
        <View style={styles.resourceGrid}>
          <ResourceMeter
            label="PV"
            glyph="♥"
            accent="#ef4444"
            resource={selectedCharacter.pv}
            glyphScale={1}
            theme={activeTheme}
            onAdjust={(delta) => updateResource(selectedCharacter.id, "pv", delta)}
            onAdjustBonus={(delta) =>
              updateResourceBonus(selectedCharacter.id, "pv", delta)
            }
          />
          <ResourceMeter
            label="PSY"
            glyph="💧"
            accent="#38bdf8"
            resource={selectedCharacter.psy}
            glyphScale={0.78}
            theme={activeTheme}
            onAdjust={(delta) => updateResource(selectedCharacter.id, "psy", delta)}
            onAdjustBonus={(delta) =>
              updateResourceBonus(selectedCharacter.id, "psy", delta)
            }
          />
          <ResourceMeter
            label="Armure"
            glyph="🛡"
            accent="#f59e0b"
            resource={selectedCharacter.armor}
            glyphScale={1}
            theme={activeTheme}
            onAdjust={(delta) => updateResource(selectedCharacter.id, "armor", delta)}
            onAdjustBonus={(delta) =>
              updateResourceBonus(selectedCharacter.id, "armor", delta)
            }
          />
          <AttackBonusCard
            value={selectedCharacter.attackBonus}
            theme={activeTheme}
            onAdjust={(delta) => updateAttackBonus(selectedCharacter.id, delta)}
          />
        </View>
      </Section>

      <View style={styles.dualColumns}>
        <View style={styles.dualColumn}>
          <Section
            title="Effets actifs"
            subtitle="Suivi des effets persistants, dons et benedictions."
            theme={{
              sectionBg: activeTheme.panelBg,
              sectionBorder: activeTheme.border,
              title: activeTheme.title,
              subtitle: activeTheme.subtitle,
            }}
            rightSlot={
              <Pressable
                onPress={() => openSectionEditor("effects")}
                style={[
                  styles.sectionEditButton,
                  { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                ]}
              >
                <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
              </Pressable>
            }
          >
            <View style={styles.effectList}>
              {selectedCharacter.statusEffects.length ? (
                selectedCharacter.statusEffects.map((effect) => (
                  <View
                    key={effect.id}
                    style={[
                      styles.effectCard,
                      {
                        backgroundColor: activeTheme.chipBg,
                        borderColor: effect.active ? activeTheme.accent : activeTheme.border,
                      },
                    ]}
                  >
                    <View style={styles.effectHeader}>
                      <View style={styles.effectHeaderText}>
                        <Text style={[styles.effectTitle, { color: activeTheme.title }]}>
                          {effect.name}
                        </Text>
                        {effect.source ? (
                          <Text style={[styles.effectSource, { color: activeTheme.subtitle }]}>
                            Source · {effect.source}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => toggleStatusActive(selectedCharacter.id, effect.id)}
                        style={[
                          styles.effectActiveToggle,
                          {
                            backgroundColor: effect.active
                              ? activeTheme.accent
                              : activeTheme.panelBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.effectActiveToggleLabel,
                            { color: effect.active ? activeTheme.pageBg : activeTheme.title },
                          ]}
                        >
                          {effect.active ? "Actif" : "Off"}
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={[styles.effectDescription, { color: activeTheme.subtitle }]}>
                      {effect.description}
                    </Text>
                    {effect.tags.length ? (
                      <View style={styles.assetTags}>
                        {effect.tags.map((tag) => (
                          <View
                            key={`${effect.id}-${tag}`}
                            style={[
                              styles.assetTag,
                              {
                                backgroundColor: activeTheme.panelBg,
                                borderColor: activeTheme.border,
                              },
                            ]}
                          >
                            <Text style={[styles.assetTagLabel, { color: activeTheme.title }]}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    <View style={styles.effectFooter}>
                      <Text style={[styles.effectTurns, { color: activeTheme.title }]}>
                        {effect.durationTurns === null
                          ? "Permanent"
                          : `${effect.durationTurns} tour(s)`}
                      </Text>
                      {effect.durationTurns !== null ? (
                        <View style={styles.resourceButtons}>
                          <AdjustButton
                            label="-1"
                            onPress={() => stepStatusDuration(selectedCharacter.id, effect.id, -1)}
                            theme={activeTheme}
                          />
                          <AdjustButton
                            label="+1"
                            onPress={() => stepStatusDuration(selectedCharacter.id, effect.id, 1)}
                            theme={activeTheme}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: activeTheme.subtitle }]}>
                  Aucun effet persistant.
                </Text>
              )}
            </View>
          </Section>
        </View>
        <View style={styles.dualColumn}>
          <Section
            title="Affinites"
            subtitle="Resistances, faiblesses et immunites connues."
            theme={{
              sectionBg: activeTheme.panelBg,
              sectionBorder: activeTheme.border,
              title: activeTheme.title,
              subtitle: activeTheme.subtitle,
            }}
            rightSlot={
              <Pressable
                onPress={() => openSectionEditor("resistances")}
                style={[
                  styles.sectionEditButton,
                  { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                ]}
              >
                <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
              </Pressable>
            }
          >
            <View style={styles.resistanceList}>
              {selectedCharacter.resistances.length ? (
                selectedCharacter.resistances.map((entry) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.resistanceCard,
                      { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                    ]}
                  >
                    <View style={styles.resistanceHeader}>
                      <Text style={[styles.resistanceLabel, { color: activeTheme.title }]}>
                        {entry.label}
                      </Text>
                      <View
                        style={[
                          styles.resistanceBadge,
                          {
                            backgroundColor:
                              entry.type === "immunite"
                                ? activeTheme.accent
                                : activeTheme.panelBg,
                            borderColor: activeTheme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.resistanceBadgeLabel,
                            {
                              color:
                                entry.type === "immunite"
                                  ? activeTheme.pageBg
                                  : activeTheme.title,
                            },
                          ]}
                        >
                          {RESISTANCE_LABELS[entry.type]}
                        </Text>
                      </View>
                    </View>
                    {entry.notes ? (
                      <Text style={[styles.effectDescription, { color: activeTheme.subtitle }]}>
                        {entry.notes}
                      </Text>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: activeTheme.subtitle }]}>
                  Aucune affinite renseignee.
                </Text>
              )}
            </View>
          </Section>
        </View>
      </View>

      <View style={styles.dualColumns}>
        <View style={styles.dualColumn}>
          <View style={styles.equalHeightCard}>
            <Section
              title="Stats"
              subtitle="Valeurs de base en pourcentage."
              theme={{
                sectionBg: activeTheme.panelBg,
                sectionBorder: activeTheme.border,
                title: activeTheme.title,
                subtitle: activeTheme.subtitle,
              }}
              rightSlot={
                <Pressable
                  onPress={() => openSectionEditor("stats")}
                  style={[
                    styles.sectionEditButton,
                    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                  ]}
                >
                  <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
                </Pressable>
              }
            >
              <View style={styles.statsGrid}>
                {Object.entries(selectedCharacter.stats).map(([key, value]) => (
                <View
                  key={key}
                  style={[
                    styles.statCard,
                    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                  ]}
                >
                  <View style={styles.statHeader}>
                    <View style={styles.statIconWrap}>
                      <Text style={[styles.statIcon, { color: activeTheme.accent }]}>
                        {STAT_ICONS[key as keyof Character["stats"]]}
                      </Text>
                    </View>
                    <Text style={[styles.statLabel, { color: activeTheme.subtitle }]}>
                      {key}
                    </Text>
                  </View>
                  <Text style={[styles.statValue, { color: activeTheme.title }]}>
                    {value}%
                  </Text>
                </View>
                ))}
              </View>
            </Section>
          </View>
        </View>

        <View style={styles.dualColumn}>
          <View style={styles.equalHeightCard}>
            <Section
              title="Competences"
              subtitle="Bonus appliques aux actions specialisees."
              theme={{
                sectionBg: activeTheme.panelBg,
                sectionBorder: activeTheme.border,
                title: activeTheme.title,
                subtitle: activeTheme.subtitle,
              }}
              rightSlot={
                <Pressable
                  onPress={() => openSectionEditor("skills")}
                  style={[
                    styles.sectionEditButton,
                    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                  ]}
                >
                  <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
                </Pressable>
              }
            >
              <View style={styles.table}>
              <View style={[styles.tableHeader, { backgroundColor: activeTheme.chipBg }]}>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.tableNameColumn,
                    { color: activeTheme.subtitle },
                  ]}
                >
                  Competence
                </Text>
                <Text style={[styles.tableHeaderText, { color: activeTheme.subtitle }]}>
                  Bonus
                </Text>
              </View>
              {selectedCharacter.skills.map((skill) => (
                <View
                  key={skill.id}
                  style={[
                    styles.tableRow,
                    { backgroundColor: activeTheme.chipBg, borderTopColor: activeTheme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableNameColumn,
                      { color: activeTheme.title },
                    ]}
                  >
                    {skill.name}
                  </Text>
                  <Text style={[styles.tableBonus, { color: activeTheme.accent }]}>
                    +{skill.value}%
                  </Text>
                </View>
              ))}
              </View>
            </Section>
          </View>
        </View>
      </View>

      <Section
        title="Inventaire"
        subtitle="Objets emportes par le personnage."
        theme={{
          sectionBg: activeTheme.panelBg,
          sectionBorder: activeTheme.border,
          title: activeTheme.title,
          subtitle: activeTheme.subtitle,
        }}
        rightSlot={
          <Pressable
            onPress={() => openSectionEditor("inventory")}
            style={[
              styles.sectionEditButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
          </Pressable>
        }
      >
        <View style={styles.inventoryList}>
          {selectedCharacter.inventory.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.inventoryItem,
                  { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                ]}
              >
              <AssetVisual
                label={item.name}
                icon={item.icon}
                imageUrl={item.imageUrl}
                imageModule={item.imageModule}
                small
              />
              <View style={styles.inventoryBody}>
                  <Text style={[styles.inventoryName, { color: activeTheme.title }]}>
                    {item.name}
                  </Text>
                  {item.tags.length ? (
                    <View style={styles.assetTags}>
                      {item.tags.map((tag) => (
                        <View
                          key={`${item.id}-${tag}`}
                          style={[
                            styles.assetTag,
                            {
                              backgroundColor: activeTheme.panelBg,
                              borderColor: activeTheme.border,
                            },
                          ]}
                        >
                          <Text style={[styles.assetTagLabel, { color: activeTheme.title }]}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {item.notes ? (
                    <Text style={[styles.inventoryNotes, { color: activeTheme.subtitle }]}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.inventoryQty, { color: activeTheme.accent }]}>
                  x{item.quantity}
                </Text>
              </View>
          ))}
        </View>
      </Section>

      <Section
        title="Dons et sorts"
        subtitle="Couts recalcules selon la posture actuelle."
        theme={{
          sectionBg: activeTheme.panelBg,
          sectionBorder: activeTheme.border,
          title: activeTheme.title,
          subtitle: activeTheme.subtitle,
        }}
        rightSlot={
          <Pressable
            onPress={() => openSectionEditor("spells")}
            style={[
              styles.sectionEditButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
          </Pressable>
        }
      >
        <View style={styles.assetGrid}>
          {selectedCharacter.spells.length ? (
            selectedCharacter.spells.map((spell) => {
              const computedCost = getSpellCost(spell, selectedCharacter.stance);
              const reduced = spell.reducible && computedCost < spell.basePsyCost;
              const isActive = selectedCharacter.activeSpellIds.includes(spell.id);

              return (
                <View
                  key={spell.id}
                  style={[
                    styles.assetCard,
                    { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
                    isActive ? styles.assetCardActive : null,
                  ]}
                >
                  <AssetVisual
                    label={spell.name}
                    icon={spell.icon}
                    imageUrl={spell.imageUrl}
                    imageModule={spell.imageModule}
                    onPress={() => toggleSpellActive(selectedCharacter.id, spell.id)}
                    active={isActive}
                  />
                  <View style={styles.assetBody}>
                    <View style={styles.assetHeader}>
                      <View style={styles.assetHeading}>
                        <Text style={[styles.assetTitle, { color: activeTheme.title }]}>
                          {spell.name}
                        </Text>
                        <Text style={[styles.assetMeta, { color: activeTheme.subtitle }]}>
                          {spell.reducible
                            ? "Don reductible"
                            : "Don a cout fixe"}
                        </Text>
                      </View>
                      <View style={styles.assetBadgeColumn}>
                        {isActive ? (
                          <Text style={styles.activeBadge}>Actif</Text>
                        ) : null}
                        <Text
                          style={[
                            styles.costBadge,
                            reduced ? styles.costBadgeReduced : null,
                          ]}
                        >
                          {computedCost} PSY
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.assetDescription, { color: activeTheme.title }]}>
                      {spell.description}
                    </Text>
                    {spell.tags.length ? (
                      <View style={styles.assetTags}>
                        {spell.tags.map((tag) => (
                          <View
                            key={`${spell.id}-${tag}`}
                            style={[
                              styles.assetTag,
                              {
                                backgroundColor: activeTheme.panelBg,
                                borderColor: activeTheme.border,
                              },
                            ]}
                          >
                            <Text style={[styles.assetTagLabel, { color: activeTheme.title }]}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {spell.activeEffects.map((effect) => (
                      <Text
                        key={effect.id}
                        style={[styles.assetEffect, { color: activeTheme.subtitle }]}
                      >
                        Actif · {effect.label} · {effect.description}
                      </Text>
                    ))}
                    {spell.passiveEffects.map((effect) => (
                      <Text
                        key={effect.id}
                        style={[styles.assetEffect, { color: activeTheme.subtitle }]}
                      >
                        Passif · {effect.label} · {effect.description}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: activeTheme.subtitle }]}>
              Aucun don renseigne.
            </Text>
          )}
        </View>
      </Section>

      <Section
        title="Equipement"
        subtitle="L'equipement occupe l'espace principal de la feuille."
        theme={{
          sectionBg: activeTheme.panelBg,
          sectionBorder: activeTheme.border,
          title: activeTheme.title,
          subtitle: activeTheme.subtitle,
        }}
        rightSlot={
          <Pressable
            onPress={() => openSectionEditor("equipment")}
            style={[
              styles.sectionEditButton,
              { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
            ]}
          >
            <Text style={[styles.sectionEditButtonLabel, { color: activeTheme.title }]}>✎</Text>
          </Pressable>
        }
      >
        <View style={styles.equipmentList}>
          {selectedCharacter.equipment.map((item) => (
            <View
              key={item.id}
              style={[
                styles.equipmentCard,
                { backgroundColor: activeTheme.chipBg, borderColor: activeTheme.border },
              ]}
            >
              <AssetVisual
                label={item.name}
                icon={item.icon}
                imageUrl={item.imageUrl}
                imageModule={item.imageModule}
              />
              <View style={styles.equipmentBody}>
                <View style={styles.assetHeader}>
                  <View style={styles.assetHeading}>
                    <Text style={[styles.assetTitle, { color: activeTheme.title }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.assetMeta, { color: activeTheme.subtitle }]}>
                      {item.category}
                    </Text>
                  </View>
                </View>
                {item.notes ? (
                  <Text style={[styles.assetDescription, { color: activeTheme.title }]}>
                    {item.notes}
                  </Text>
                ) : null}
                {item.tags.length ? (
                  <View style={styles.assetTags}>
                    {item.tags.map((tag) => (
                      <View
                        key={`${item.id}-${tag}`}
                        style={[
                          styles.assetTag,
                          {
                            backgroundColor: activeTheme.panelBg,
                            borderColor: activeTheme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.assetTagLabel, { color: activeTheme.title }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {item.activeEffects.map((effect) => (
                  <Text
                    key={effect.id}
                    style={[styles.assetEffect, { color: activeTheme.subtitle }]}
                  >
                    Actif · {effect.label} · {effect.description}
                  </Text>
                ))}
                {item.passiveEffects.map((effect) => (
                  <Text
                    key={effect.id}
                    style={[styles.assetEffect, { color: activeTheme.subtitle }]}
                  >
                    Passif · {effect.label} · {effect.description}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

type ResourceMeterProps = {
  label: string;
  glyph: string;
  accent: string;
  resource: ResourcePool;
  glyphScale?: number;
  theme: {
    chipBg: string;
    border: string;
    title: string;
    subtitle: string;
    buttonBg: string;
    buttonText: string;
  };
  onAdjust: (delta: number) => void;
  onAdjustBonus: (delta: number) => void;
};

function ResourceMeter({
  label,
  glyph,
  accent,
  resource,
  glyphScale = 1,
  theme,
  onAdjust,
  onAdjustBonus,
}: ResourceMeterProps) {
  const fillRatio = resource.max === 0 ? 0 : resource.current / resource.max;

  return (
    <View
      style={[
        styles.resourceCard,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.resourceName, { color: theme.title }]}>{label}</Text>
      <View style={styles.resourceGlyphFrame}>
        <View style={[styles.resourceGlyphFillMask, { height: `${fillRatio * 100}%` }]}>
          <Text
            style={[
              styles.resourceGlyphFill,
              { color: accent, transform: [{ scale: glyphScale }] },
            ]}
          >
            {glyph}
          </Text>
        </View>
      </View>
      <Text style={[styles.resourceCount, { color: theme.title }]}>
        {resource.current}/{resource.max}
      </Text>
      <Text style={[styles.resourceBonus, { color: theme.subtitle }]}>
        Bonus +{resource.bonus}
      </Text>
      <View style={styles.resourceButtons}>
        <AdjustButton label="-1" onPress={() => onAdjust(-1)} theme={theme} />
        <AdjustButton label="+1" onPress={() => onAdjust(1)} theme={theme} />
      </View>
      <View style={styles.resourceButtons}>
        <AdjustButton label="-B" onPress={() => onAdjustBonus(-1)} theme={theme} />
        <AdjustButton label="+B" onPress={() => onAdjustBonus(1)} theme={theme} />
      </View>
    </View>
  );
}

type AttackBonusCardProps = {
  value: number;
  theme: {
    chipBg: string;
    border: string;
    title: string;
    subtitle: string;
    accent: string;
    buttonBg: string;
    buttonText: string;
  };
  onAdjust: (delta: number) => void;
};

function AttackBonusCard({ value, theme, onAdjust }: AttackBonusCardProps) {
  return (
    <View
      style={[
        styles.resourceCard,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.resourceName, { color: theme.title }]}>Attaque bonus</Text>
      <View style={styles.resourceGlyphWrap}>
        <Text style={[styles.attackGlyph, { color: theme.accent }]}>✦</Text>
      </View>
      <Text style={[styles.resourceCount, { color: theme.title }]}>+{value}</Text>
      <Text style={[styles.resourceBonus, { color: theme.subtitle }]}>
        Modificateur offensif
      </Text>
      <View style={styles.resourceButtons}>
        <AdjustButton label="-1" onPress={() => onAdjust(-1)} theme={theme} />
        <AdjustButton label="+1" onPress={() => onAdjust(1)} theme={theme} />
      </View>
    </View>
  );
}

type EditorFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
};

function EditorField({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: EditorFieldProps) {
  return (
    <View style={styles.editorField}>
      <Text style={styles.editorFieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.editorInput}
        placeholderTextColor="#6f84a7"
      />
    </View>
  );
}

type AssetVisualProps = {
  label: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  small?: boolean;
  character?: boolean;
  onPress?: () => void;
  active?: boolean;
};

function AssetVisual({
  label,
  icon,
  imageUrl,
  imageModule,
  small = false,
  character = false,
  onPress,
  active = false,
}: AssetVisualProps) {
  const sizeStyle = character
    ? styles.characterVisual
    : small
      ? styles.assetVisualSmall
      : styles.assetVisual;
  const content = imageUrl || imageModule ? (
    <Image
      source={imageUrl ? { uri: imageUrl } : imageModule}
      style={sizeStyle}
      resizeMode="cover"
    />
  ) : (
    <View style={[sizeStyle, styles.assetFallback, active ? styles.assetFallbackActive : null]}>
      <Text style={small ? styles.assetFallbackSmallText : styles.assetFallbackText}>
        {icon ?? label.slice(0, 1)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.assetVisualButton}>
        {content}
      </Pressable>
    );
  }

  return content;
}

type AdjustButtonProps = {
  label: string;
  theme: {
    border: string;
    buttonBg: string;
    buttonText: string;
  };
  onPress: () => void;
};

function AdjustButton({ label, theme, onPress }: AdjustButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.adjustButton,
        { backgroundColor: theme.buttonBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.adjustButtonLabel, { color: theme.buttonText }]}>{label}</Text>
    </Pressable>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    zIndex: 100,
  },
  navBrand: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  navSubtle: {
    color: "#8ea0bf",
    marginTop: 4,
  },
  navActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  navRightGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
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
    alignSelf: "stretch",
    zIndex: 120,
  },
  navThemeWrap: {
    position: "relative",
    minWidth: 150,
    zIndex: 121,
  },
  navThemeButton: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.14)",
    overflow: "visible",
    zIndex: 20,
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
  heroSide: {
    width: 280,
    gap: 8,
    zIndex: 25,
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
  editButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#1b2740",
  },
  editButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  editorActions: {
    flexDirection: "row",
    gap: 10,
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
