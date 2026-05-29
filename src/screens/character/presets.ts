import { ArchetypeId, Character, CharacterTheme, CombatStance, ResistanceType, Spell } from "../../types/game";

export type CharacterThemePreset = {
  pageBg: string;
  backgroundImage: number;
  cardBackgroundImage: number;
  panelBg: string;
  border: string;
  accent: string;
  title: string;
  subtitle: string;
  chipBg: string;
  buttonBg: string;
  buttonText: string;
};

export const STANCES: CombatStance[] = ["focus", "combat", "defensif"];
export const THEME_BACKGROUNDS: Record<CharacterTheme, number> = {
  vide: require("../../../assets/themes/vide.png"),
  ange: require("../../../assets/themes/ange.png"),
  demon: require("../../../assets/themes/demon.png"),
  foret: require("../../../assets/themes/foret.png"),
  humain: require("../../../assets/themes/humain.png"),
  nain: require("../../../assets/themes/nain.png"),
  occulte: require("../../../assets/themes/occulte.png"),
  abyssal: require("../../../assets/themes/abyssal.png"),
  cendre: require("../../../assets/themes/cendre.png"),
  glace: require("../../../assets/themes/glace.png"),
  inquisition: require("../../../assets/themes/inquisition.png"),
  sang: require("../../../assets/themes/sang.png"),
  ronce: require("../../../assets/themes/ronce.png"),
  miroir: require("../../../assets/themes/miroir.png"),
};
export const THEME_CARD_BACKGROUNDS: Record<CharacterTheme, number> = {
  vide: require("../../../assets/themes/card/vide.png"),
  ange: require("../../../assets/themes/card/ange.png"),
  demon: require("../../../assets/themes/card/demon.png"),
  foret: require("../../../assets/themes/card/foret.png"),
  humain: require("../../../assets/themes/card/humain.png"),
  nain: require("../../../assets/themes/card/nain.png"),
  occulte: require("../../../assets/themes/card/occulte.png"),
  abyssal: require("../../../assets/themes/card/abyssal.png"),
  cendre: require("../../../assets/themes/card/cendre.png"),
  glace: require("../../../assets/themes/card/glace.png"),
  inquisition: require("../../../assets/themes/card/inquisition.png"),
  sang: require("../../../assets/themes/card/sang.png"),
  ronce: require("../../../assets/themes/card/ronce.png"),
  miroir: require("../../../assets/themes/card/miroir.png"),
};
export const STAT_ICONS: Record<keyof Character["stats"], string> = {
  physique: "⚔",
  mentale: "✦",
  sociale: "☉",
};
export const THEME_LABELS: Record<CharacterTheme, string> = {
  vide: "Vide",
  ange: "Ange",
  demon: "Demon",
  foret: "Foret",
  humain: "Humain",
  nain: "Nain",
  occulte: "Occulte",
  abyssal: "Abyssal",
  cendre: "Cendre",
  glace: "Glace",
  inquisition: "Inquisition",
  sang: "Sang",
  ronce: "Ronce",
  miroir: "Miroir",
};
export const THEME_DESCRIPTIONS: Record<CharacterTheme, string> = {
  vide: "Mystique obscure et energie violette.",
  ange: "Lumiere sacree, ivoire et or ancien.",
  demon: "Rouges profonds, rituel infernal et tension brute.",
  foret: "Vert ancien, reliques naturelles et souffle vivant.",
  humain: "Acier, pierre et sobriete militaire.",
  nain: "Forge froide, metal brut et discipline runique.",
  occulte: "Noir liturgique, cuivre sombre et symboles caches.",
  abyssal: "Bleu des profondeurs, pression froide et eclat marin.",
  cendre: "Braise eteinte, charbon et poussiere de bataille.",
  glace: "Givre pale, cristal et lueur hivernale.",
  inquisition: "Noir judiciaire, sceaux rouges et foi implacable.",
  sang: "Carmin rituel, serments graves et blessures sacrees.",
  ronce: "Epines anciennes, nature maudite et seve sombre.",
  miroir: "Reflets froids, verre brise et verites dedoublees.",
};
export const THEME_PRESETS: Record<
  CharacterTheme,
  CharacterThemePreset
> = {
  vide: {
    pageBg: "#04010a",
    backgroundImage: THEME_BACKGROUNDS.vide,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.vide,
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
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.ange,
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
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.demon,
    panelBg: "rgba(32, 5, 16, 0.92)",
    border: "rgba(225, 29, 72, 0.44)",
    accent: "#fb174c",
    title: "#ffe4ef",
    subtitle: "#fda4c3",
    chipBg: "#210817",
    buttonBg: "#be123c",
    buttonText: "#fff1f2",
  },
  foret: {
    pageBg: "#0c120b",
    backgroundImage: THEME_BACKGROUNDS.foret,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.foret,
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
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.humain,
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
    pageBg: "#11100d",
    backgroundImage: THEME_BACKGROUNDS.nain,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.nain,
    panelBg: "rgba(40, 34, 27, 0.9)",
    border: "rgba(180, 125, 50, 0.34)",
    accent: "#b47d32",
    title: "#f7ead7",
    subtitle: "#d7b98a",
    chipBg: "#30281f",
    buttonBg: "#a16207",
    buttonText: "#fff7ed",
  },
  occulte: {
    pageBg: "#09070b",
    backgroundImage: THEME_BACKGROUNDS.occulte,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.occulte,
    panelBg: "rgba(22, 16, 20, 0.9)",
    border: "rgba(166, 124, 82, 0.34)",
    accent: "#a67c52",
    title: "#f4e7d3",
    subtitle: "#d3b58f",
    chipBg: "#1b1417",
    buttonBg: "#7c5c3c",
    buttonText: "#fff6ea",
  },
  abyssal: {
    pageBg: "#030b13",
    backgroundImage: THEME_BACKGROUNDS.abyssal,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.abyssal,
    panelBg: "rgba(8, 24, 38, 0.9)",
    border: "rgba(56, 189, 248, 0.28)",
    accent: "#38bdf8",
    title: "#e0f2fe",
    subtitle: "#93c5fd",
    chipBg: "#0b1a2a",
    buttonBg: "#0ea5e9",
    buttonText: "#eaf8ff",
  },
  cendre: {
    pageBg: "#0d0d0c",
    backgroundImage: THEME_BACKGROUNDS.cendre,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.cendre,
    panelBg: "rgba(25, 25, 23, 0.92)",
    border: "rgba(251, 146, 60, 0.28)",
    accent: "#fb923c",
    title: "#f5f0e8",
    subtitle: "#b8ada1",
    chipBg: "#1d1c1a",
    buttonBg: "#9a3412",
    buttonText: "#fff7ed",
  },
  glace: {
    pageBg: "#eef8ff",
    backgroundImage: THEME_BACKGROUNDS.glace,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.glace,
    panelBg: "rgba(246, 252, 255, 0.95)",
    border: "rgba(14, 165, 233, 0.28)",
    accent: "#0ea5e9",
    title: "#0c3048",
    subtitle: "#3f6f8d",
    chipBg: "#d9f1ff",
    buttonBg: "#0284c7",
    buttonText: "#eff6ff",
  },
  inquisition: {
    pageBg: "#060504",
    backgroundImage: THEME_BACKGROUNDS.inquisition,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.inquisition,
    panelBg: "rgba(16, 13, 11, 0.94)",
    border: "rgba(127, 29, 29, 0.38)",
    accent: "#991b1b",
    title: "#f4eadb",
    subtitle: "#b9aa96",
    chipBg: "#191512",
    buttonBg: "#7f1d1d",
    buttonText: "#fff7ed",
  },
  sang: {
    pageBg: "#16040a",
    backgroundImage: THEME_BACKGROUNDS.sang,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.sang,
    panelBg: "rgba(42, 9, 20, 0.92)",
    border: "rgba(217, 119, 6, 0.3)",
    accent: "#d97706",
    title: "#ffe4e6",
    subtitle: "#e8a1a8",
    chipBg: "#32101b",
    buttonBg: "#9f1239",
    buttonText: "#fff1f2",
  },
  ronce: {
    pageBg: "#070d05",
    backgroundImage: THEME_BACKGROUNDS.ronce,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.ronce,
    panelBg: "rgba(18, 28, 11, 0.91)",
    border: "rgba(190, 242, 100, 0.3)",
    accent: "#bef264",
    title: "#f7fee7",
    subtitle: "#d9f99d",
    chipBg: "#14210b",
    buttonBg: "#5b21b6",
    buttonText: "#f7fee7",
  },
  miroir: {
    pageBg: "#061113",
    backgroundImage: THEME_BACKGROUNDS.miroir,
    cardBackgroundImage: THEME_CARD_BACKGROUNDS.miroir,
    panelBg: "rgba(10, 24, 26, 0.9)",
    border: "rgba(203, 213, 225, 0.32)",
    accent: "#cbd5e1",
    title: "#f8fafc",
    subtitle: "#99f6e4",
    chipBg: "#0f2a2d",
    buttonBg: "#0f766e",
    buttonText: "#ecfeff",
  },
};

export const ARCHETYPE_OPTIONS: Array<{
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

export const RESISTANCE_LABELS: Record<ResistanceType, string> = {
  resistance: "Resistance",
  faiblesse: "Faiblesse",
  immunite: "Immunite",
};

export function cloneTemplate<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function normalizeSpell(spell: Spell): Spell {
  return {
    ...spell,
    imageModule: spell.imageModule,
    augmentable:
      spell.augmentable ??
      Boolean((spell as Spell & { scaling?: { label?: string; bonusPerPsy?: string } }).scaling),
    tags: spell.tags ?? [],
  };
}

export function createTemplateCharacter(
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

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
