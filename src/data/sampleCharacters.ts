import { Character } from "../types/game";

export const sampleCharacters: Character[] = [
  {
    id: "soeur-agnes",
    name: "Soeur Agnes",
    archetype: "Exorciste",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
    theme: "ange",
    level: 4,
    pv: { current: 18, max: 24, bonus: 2 },
    psy: { current: 11, max: 15, bonus: 1 },
    armor: { current: 3, max: 5, bonus: 0 },
    attackBonus: 0,
    stats: {
      physique: 52,
      mentale: 74,
      sociale: 61,
    },
    skills: [
      { id: "theologie", name: "Theologie", value: 18 },
      { id: "armes-courtes", name: "Armes courtes", value: 12 },
      { id: "perception", name: "Perception", value: 15 },
    ],
    equipment: [
      {
        id: "lame-benite",
        name: "Lame benite",
        category: "Arme",
        icon: "🗡️",
        notes: "Au combat, inflige toujours les degats maximums en posture combat.",
        activeEffects: [
          {
            id: "lame-benite-frappe",
            label: "Frappe consacree",
            description: "Ignore 1 point d'armure demoniaque.",
            kind: "active",
          },
        ],
        passiveEffects: [
          {
            id: "lame-benite-aura",
            label: "Aura sainte",
            description: "Bonus de 5% sur les tests sociaux face aux fideles.",
            kind: "passive",
          },
        ],
      },
    ],
    spells: [
      {
        id: "sceau-lumiere",
        name: "Sceau de lumiere",
        icon: "✨",
        basePsyCost: 4,
        reducible: true,
        description: "Aveugle une cible pendant un tour.",
        activeEffects: [
          {
            id: "sceau-aveugle",
            label: "Eblouissement",
            description: "La cible subit un malus de 20% a ses actions.",
            kind: "active",
          },
        ],
        passiveEffects: [],
      },
      {
        id: "rempart-mental",
        name: "Rempart mental",
        icon: "🜂",
        basePsyCost: 3,
        reducible: false,
        description: "Ajoute 2 d'armure psychique jusqu'a la fin de la scene.",
        activeEffects: [],
        passiveEffects: [
          {
            id: "rempart-bonus",
            label: "Garde de l'esprit",
            description: "Reduit les pertes de PSY subies par effet hostile.",
            kind: "passive",
          },
        ],
      },
    ],
    activeSpellIds: [],
    inventory: [
      {
        id: "fioles",
        name: "Fioles d'eau benite",
        icon: "🧪",
        quantity: 2,
        notes: "Reservee aux rituels d'exorcisme.",
      },
      {
        id: "corde",
        name: "Corde rituelle",
        icon: "🪢",
        quantity: 1,
        notes: "Marquee de sceaux pour les entraves.",
      },
      {
        id: "notes",
        name: "Carnet de rites",
        icon: "📖",
        quantity: 1,
        notes: "Contient les invocations de terrain.",
      },
    ],
    stance: "focus",
  },
  {
    id: "marco-vale",
    name: "Marco Vale",
    archetype: "Chasseur",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    theme: "humain",
    level: 3,
    pv: { current: 22, max: 22, bonus: 0 },
    psy: { current: 5, max: 9, bonus: 0 },
    armor: { current: 4, max: 4, bonus: 1 },
    attackBonus: 0,
    stats: {
      physique: 71,
      mentale: 46,
      sociale: 39,
    },
    skills: [
      { id: "armes-longues", name: "Armes longues", value: 19 },
      { id: "survie", name: "Survie", value: 11 },
      { id: "intimidation", name: "Intimidation", value: 8 },
    ],
    equipment: [
      {
        id: "arbalete",
        name: "Arbalete lourde",
        category: "Arme",
        icon: "🏹",
        activeEffects: [
          {
            id: "tir-percant",
            label: "Tir percant",
            description: "Ignore 2 points d'armure sur un tir prepare.",
            kind: "active",
          },
        ],
        passiveEffects: [],
      },
      {
        id: "plastron-cuir",
        name: "Plastron de cuir",
        category: "Armure",
        icon: "🛡️",
        activeEffects: [],
        passiveEffects: [
          {
            id: "plastron-malus",
            label: "Protection stable",
            description: "Ajoute 1 point d'armure tant qu'il n'est pas brise.",
            kind: "passive",
          },
        ],
      },
    ],
    spells: [],
    activeSpellIds: [],
    inventory: [
      {
        id: "carreaux",
        name: "Carreaux",
        icon: "📦",
        quantity: 18,
        notes: "6 carreaux benis melanges au lot.",
      },
      {
        id: "trousse",
        name: "Trousse de secours",
        icon: "🩹",
        quantity: 1,
        notes: "Utilisation rapide hors corruption lourde.",
      },
    ],
    stance: "combat",
  },
];
