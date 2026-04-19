export type CombatStance = "focus" | "combat" | "defensif";
export type CharacterTheme =
  | "vide"
  | "ange"
  | "demon"
  | "foret"
  | "humain"
  | "nain"
  | "occulte"
  | "abyssal"
  | "cendre"
  | "glace";
export type ArchetypeId =
  | "paladin"
  | "tireur"
  | "dresseur"
  | "lecteur"
  | "guerisseur"
  | "receptacle"
  | "libre";

export type PercentStatKey = "physique" | "mentale" | "sociale";

export type ResourcePool = {
  current: number;
  max: number;
  bonus: number;
};

export type CharacterStats = Record<PercentStatKey, number>;

export type Skill = {
  id: string;
  name: string;
  value: number;
  notes?: string;
};

export type Effect = {
  id: string;
  label: string;
  description: string;
  kind: "active" | "passive";
};

export type StatusEffect = {
  id: string;
  name: string;
  description: string;
  source?: string;
  durationTurns: number | null;
  active: boolean;
  tags: string[];
};

export type ResistanceType = "resistance" | "faiblesse" | "immunite";

export type ResistanceProfile = {
  id: string;
  label: string;
  type: ResistanceType;
  notes?: string;
};

export type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  notes?: string;
  usableLabel?: string;
  usePsyCost?: number;
  reducible?: boolean;
  grantedSpell?: Spell;
  tags: string[];
  activeEffects: Effect[];
  passiveEffects: Effect[];
};

export type Spell = {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  basePsyCost: number;
  reducible: boolean;
  augmentable?: boolean;
  description: string;
  tags: string[];
  activeEffects: Effect[];
  passiveEffects: Effect[];
};

export type InventoryItem = {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  imageModule?: number;
  quantity: number;
  notes?: string;
  tags: string[];
};

export type Character = {
  id: string;
  name: string;
  archetypeId: ArchetypeId;
  archetype: string;
  specialization?: string;
  bio?: string;
  imageUrl?: string;
  imageModule?: number;
  theme: CharacterTheme;
  level?: number;
  pv: ResourcePool;
  psy: ResourcePool;
  armor: ResourcePool;
  attackBonus: number;
  stats: CharacterStats;
  skills: Skill[];
  equipment: EquipmentItem[];
  spells: Spell[];
  activeSpellIds: string[];
  statusEffects: StatusEffect[];
  resistances: ResistanceProfile[];
  inventory: InventoryItem[];
  stance: CombatStance;
};
