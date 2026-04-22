import { Character } from "../types/game";

const ANGE_ASSET = require("../../assets/themes/ange.png");
const HUMAIN_ASSET = require("../../assets/themes/humain.png");
const NAIN_ASSET = require("../../assets/themes/nain.png");
const VIDE_ASSET = require("../../assets/themes/vide.png");
const SOEUR_AGNES_PORTRAIT = require("../../assets/characters/humaine_occultiste.png");
const MARCO_VALE_PORTRAIT = require("../../assets/characters/cleric_hunter.png");
const AGNES_ARMOR = require("../../assets/equipment/kevlar_sacre.png");
const AGNES_WEAPON = require("../../assets/equipment/epee_angelique_halo.png");
const AGNES_TOME = require("../../assets/equipment/grimoire_priest.png");
const AGNES_AMULET = require("../../assets/equipment/pendentif_sacre_azur.png");
const AGNES_HOLY_WATER = require("../../assets/inventory/fiole_bleu.png");
const AGNES_SEALED_LETTER = require("../../assets/inventory/lettre_scellee.png");
const AGNES_HOLY_BOOK = require("../../assets/inventory/livre_saint.png");
const AGNES_RELIC = require("../../assets/inventory/piece_relique.png");
const MARCO_WEAPON = require("../../assets/equipment/crossbow.png");
const MARCO_ARMOR = require("../../assets/equipment/kevlar_simple.png");
const MARCO_LANTERN = require("../../assets/equipment/lantern_occulte.png");
const MARCO_RING = require("../../assets/equipment/bague_runique.png");
const MARCO_DAGGER = require("../../assets/inventory/dague_rituelle.png");
const MARCO_RED_VIAL = require("../../assets/inventory/fiole_rouge.png");
const MARCO_GREEN_VIAL = require("../../assets/inventory/fiole_verte.png");
const MARCO_TOOLKIT = require("../../assets/inventory/outils_blanc_rouleau.png");
const MARCO_CURSED_CANDLE = require("../../assets/inventory/bougie_maudite.png");

export const sampleCharacters: Character[] = [
  {
    id: "soeur-agnes",
    name: "Soeur Agnes",
    archetypeId: "lecteur",
    archetype: "Lecteur de versets",
    specialization: "Aria",
    bio: "Exorciste de terrain, Agnes impose ses versets dans le chaos et tient la ligne quand tout vacille.",
    imageModule: SOEUR_AGNES_PORTRAIT,
    theme: "ange",
    level: 4,
    pv: { current: 18, max: 24, bonus: 2 },
    psy: { current: 11, max: 15, bonus: 0 },
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
        name: "Epee benite du choeur",
        category: "Arme",
        icon: "🗡️",
        imageModule: AGNES_WEAPON,
        notes: "Au combat, inflige toujours les degats maximums en posture combat.",
        usableLabel: "Liberation du sceau",
        usePsyCost: 2,
        reducible: true,
        tags: ["ange", "sceau", "corps-a-corps"],
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
      {
        id: "manteau-penitent",
        name: "Manteau penitentiel",
        category: "Armure",
        imageModule: AGNES_ARMOR,
        notes: "Tissu consacre renforce par des plaques legeres et des sutures rituelles.",
        tags: ["armure", "sacre", "protection"],
        activeEffects: [],
        passiveEffects: [
          {
            id: "manteau-penitent-aura",
            label: "Tenue consacree",
            description: "Ajoute 1 point d'armure contre les attaques infernales.",
            kind: "passive",
          },
        ],
      },
      {
        id: "breviary-choral",
        name: "Breviaire choral",
        category: "Catalyseur",
        imageModule: AGNES_TOME,
        notes: "Recueil de versets chantés, annotations et notations de terrain.",
        usableLabel: "Cantique de garde",
        usePsyCost: 2,
        reducible: true,
        tags: ["verset", "rituel", "support"],
        activeEffects: [
          {
            id: "breviary-choral-cantique",
            label: "Cantique de garde",
            description: "Un allie proche gagne un bonus defensif jusqu'a la fin de la scene.",
            kind: "active",
          },
        ],
        passiveEffects: [
          {
            id: "breviary-choral-focus",
            label: "Litanie preparee",
            description: "Reduit de 1 le premier cout de sort consacre de la scene.",
            kind: "passive",
          },
        ],
      },
      {
        id: "pendentif-sceau",
        name: "Pendentif du troisieme sceau",
        category: "Relique",
        imageModule: AGNES_AMULET,
        notes: "Relique portee a meme la peau pendant les exorcismes lourds.",
        tags: ["relique", "ange", "sceau"],
        activeEffects: [],
        passiveEffects: [
          {
            id: "pendentif-sceau-volonte",
            label: "Foi fixe",
            description: "Bonus de 5% sur les tests de resistance mentale contre possession.",
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
        imageModule: ANGE_ASSET,
        basePsyCost: 4,
        reducible: true,
        augmentable: true,
        description: "Aveugle une cible pendant un tour.",
        tags: ["ange", "sceau", "controle"],
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
        augmentable: false,
        description: "Ajoute 2 d'armure psychique jusqu'a la fin de la scene.",
        tags: ["protection", "esprit", "ange"],
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
    activeSpellIds: ["rempart-mental"],
    statusEffects: [
      {
        id: "barriere-chorale",
        name: "Barriere chorale",
        description: "Les allies proches gagnent une resistance spirituelle.",
        source: "Rempart mental",
        durationTurns: 3,
        active: true,
        tags: ["protection", "ange"],
      },
    ],
    resistances: [
      { id: "res1", label: "Demoniaque", type: "resistance", notes: "Foi disciplinee." },
      { id: "res2", label: "Corruption mentale", type: "resistance" },
    ],
    inventory: [
      {
        id: "fioles",
        name: "Fioles d'eau benite",
        icon: "🧪",
        imageModule: AGNES_HOLY_WATER,
        quantity: 2,
        notes: "Reservee aux rituels d'exorcisme.",
        tags: ["consommable", "ange"],
      },
      {
        id: "lettre-conclave",
        name: "Lettre scellee du conclave",
        imageModule: AGNES_SEALED_LETTER,
        quantity: 1,
        notes: "Ordres de mission et clauses de censure rituelle.",
        tags: ["mission", "ordre", "sceau"],
      },
      {
        id: "evangile-portatif",
        name: "Livre saint portatif",
        imageModule: AGNES_HOLY_BOOK,
        quantity: 1,
        notes: "Textes de reference pour benedictions, bannissements et veilles.",
        tags: ["rituel", "lecture"],
      },
      {
        id: "fragment-relique",
        name: "Fragment de relique",
        imageModule: AGNES_RELIC,
        quantity: 1,
        notes: "Preleve sur un ancien autel pour stabiliser les sceaux.",
        tags: ["relique", "sacre", "focus"],
      },
    ],
    stance: "focus",
  },
  {
    id: "marco-vale",
    name: "Marco Vale",
    archetypeId: "tireur",
    archetype: "Tireur",
    specialization: "Ritualiste",
    bio: "Chasseur pragmatique, Marco prepare ses zones, ouvre les combats a distance et couvre les replis.",
    imageModule: MARCO_VALE_PORTRAIT,
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
        name: "Arbalete lourde de veille",
        category: "Arme",
        icon: "🏹",
        imageModule: MARCO_WEAPON,
        usableLabel: "Trait consacre",
        usePsyCost: 3,
        reducible: false,
        tags: ["distance", "rituel"],
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
        id: "manteau-chasseur",
        name: "Manteau de chasseur",
        category: "Armure",
        imageModule: MARCO_ARMOR,
        notes: "Protection discrète renforcee pour les missions hors sanctuaire.",
        tags: ["armure", "leger", "terrain"],
        activeEffects: [],
        passiveEffects: [
          {
            id: "manteau-chasseur-couvert",
            label: "Protection stable",
            description: "Ajoute 1 point d'armure tant qu'il n'est pas brise.",
            kind: "passive",
          },
        ],
      },
      {
        id: "lanterne-occultante",
        name: "Lanterne occultante",
        category: "Outil rituel",
        imageModule: MARCO_LANTERN,
        notes: "Projette une lueur faible utile pour lire les traces et marquer un cercle.",
        usableLabel: "Revelation des marques",
        usePsyCost: 1,
        reducible: true,
        tags: ["rituel", "survie", "lumiere"],
        activeEffects: [
          {
            id: "lanterne-occultante-traces",
            label: "Traces revelées",
            description: "Met en evidence une empreinte spirituelle ou un residu de sort.",
            kind: "active",
          },
        ],
        passiveEffects: [],
      },
      {
        id: "anneau-runique",
        name: "Anneau runique de terrain",
        category: "Relique",
        imageModule: MARCO_RING,
        notes: "Utilise pour verrouiller un cercle ou ajuster une preparation sous pression.",
        tags: ["relique", "rituel", "precision"],
        activeEffects: [],
        passiveEffects: [
          {
            id: "anneau-runique-stabilite",
            label: "Main stable",
            description: "Bonus de 5% aux preparations de cercle runique.",
            kind: "passive",
          },
        ],
      },
    ],
    spells: [
      {
        id: "cercle-runique",
        name: "Cercle runique",
        icon: "◎",
        imageModule: VIDE_ASSET,
        basePsyCost: 5,
        reducible: true,
        augmentable: true,
        description: "Trace une zone rituelle qui fragilise les demons.",
        tags: ["rituel", "zone", "vide"],
        activeEffects: [
          {
            id: "cercle-zone",
            label: "Zone consacree",
            description: "Les ennemis dans le cercle subissent un malus de 10%.",
            kind: "active",
          },
        ],
        passiveEffects: [],
      },
    ],
    activeSpellIds: [],
    statusEffects: [
      {
        id: "vigilance",
        name: "Vigilance du tireur",
        description: "Bonus d'initiative tant que Marco n'a pas bouge.",
        source: "Posture de couverture",
        durationTurns: 2,
        active: true,
        tags: ["distance", "tactique"],
      },
    ],
    resistances: [
      { id: "res3", label: "Projectiles", type: "resistance", notes: "Usage du couvert." },
      { id: "res4", label: "Possession", type: "faiblesse", notes: "Volonte instable." },
    ],
    inventory: [
      {
        id: "carreaux",
        name: "Carreaux",
        icon: "📦",
        quantity: 18,
        notes: "6 carreaux benis melanges au lot.",
        tags: ["munition"],
      },
      {
        id: "dague-rituelle",
        name: "Dague rituelle",
        imageModule: MARCO_DAGGER,
        quantity: 1,
        notes: "Lame de secours pour tracer rapidement un signe ou finir un corps-a-corps.",
        tags: ["arme", "rituel", "secours"],
      },
      {
        id: "fiole-coagulante",
        name: "Fiole coagulante",
        imageModule: MARCO_RED_VIAL,
        quantity: 1,
        notes: "Melange d'urgence pour tenir jusqu'a l'extraction.",
        tags: ["soin", "consommable"],
      },
      {
        id: "fiole-depurative",
        name: "Fiole depurative",
        imageModule: MARCO_GREEN_VIAL,
        quantity: 1,
        notes: "Traitement amer contre spores, venins et miasmes rituels.",
        tags: ["soin", "alchimie", "consommable"],
      },
      {
        id: "kit-terrain",
        name: "Outils de terrain",
        imageModule: MARCO_TOOLKIT,
        quantity: 1,
        notes: "Craie, fils, pinces et aiguilles pour reperer et securiser une scene.",
        tags: ["outil", "rituel", "enquete"],
      },
      {
        id: "bougie-noire",
        name: "Bougie de veille maudite",
        imageModule: MARCO_CURSED_CANDLE,
        quantity: 1,
        notes: "Sert a attirer ou a confirmer une manifestation avant le piege.",
        tags: ["appat", "rituel", "danger"],
      },
      {
        id: "trousse",
        name: "Trousse de secours",
        icon: "🩹",
        quantity: 1,
        notes: "Utilisation rapide hors corruption lourde.",
        tags: ["soin", "consommable"],
      },
    ],
    stance: "combat",
  },
];
