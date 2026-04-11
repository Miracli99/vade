export type CombatStance = "focus" | "combat" | "defensif";
export type CharacterTheme = "vide" | "ange" | "demon" | "foret" | "humain" | "nain";

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

export type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  icon?: string;
  imageUrl?: string;
  notes?: string;
  activeEffects: Effect[];
  passiveEffects: Effect[];
};

export type Spell = {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  basePsyCost: number;
  reducible: boolean;
  description: string;
  activeEffects: Effect[];
  passiveEffects: Effect[];
};

export type InventoryItem = {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  quantity: number;
  notes?: string;
};

export type Character = {
  id: string;
  name: string;
  archetype: string;
  imageUrl?: string;
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
  inventory: InventoryItem[];
  stance: CombatStance;
};
