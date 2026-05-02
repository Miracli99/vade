import { Character, ResourcePool, Spell } from "../types/game";

const DEFAULT_RESOURCE: ResourcePool = {
  current: 0,
  max: 0,
  bonus: 0,
};

const DEFAULT_STATS: Character["stats"] = {
  physique: 0,
  mentale: 0,
  sociale: 0,
};

function normalizeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeResource(resource: ResourcePool | undefined, forceBonus?: number): ResourcePool {
  const max = normalizeNumber(resource?.max);
  const current = normalizeNumber(resource?.current);

  return {
    current: Math.max(0, current),
    max: Math.max(0, max),
    bonus: Math.max(0, forceBonus ?? normalizeNumber(resource?.bonus)),
  };
}

function normalizeSpell(spell: Spell): Spell {
  return {
    ...spell,
    basePsyCost: Math.max(0, normalizeNumber(spell.basePsyCost)),
    armorBonus:
      spell.armorBonus === undefined
        ? undefined
        : Math.max(0, normalizeNumber(spell.armorBonus)),
    reducible: spell.reducible ?? false,
    imageModule: spell.imageModule,
    augmentable:
      spell.augmentable ??
      Boolean((spell as Spell & { scaling?: { label?: string; bonusPerPsy?: string } }).scaling),
    tags: spell.tags ?? [],
    activeEffects: spell.activeEffects ?? [],
    passiveEffects: spell.passiveEffects ?? [],
  };
}

export function normalizeCharacter(character: Character): Character {
  const equipment = character.equipment ?? [];
  const spells = character.spells ?? [];
  const inventory = character.inventory ?? [];
  const skills = character.skills ?? [];

  return {
    ...character,
    archetypeId: character.archetypeId ?? "libre",
    specialization: character.specialization ?? "",
    bio: character.bio ?? "",
    theme: character.theme ?? "humain",
    cardBackgroundsEnabled: character.cardBackgroundsEnabled ?? true,
    level: character.level,
    pv: normalizeResource(character.pv ?? DEFAULT_RESOURCE),
    psy: normalizeResource(character.psy ?? DEFAULT_RESOURCE, 0),
    armor: normalizeResource(character.armor ?? DEFAULT_RESOURCE),
    attackBonus: Math.max(0, normalizeNumber(character.attackBonus)),
    stats: {
      ...DEFAULT_STATS,
      ...character.stats,
      physique: Math.max(0, normalizeNumber(character.stats?.physique)),
      mentale: Math.max(0, normalizeNumber(character.stats?.mentale)),
      sociale: Math.max(0, normalizeNumber(character.stats?.sociale)),
    },
    imageModule: character.imageModule,
    skills: skills.map((skill) => ({
      ...skill,
      value: Math.max(0, normalizeNumber(skill.value)),
    })),
    equipment: equipment.map((item) => ({
      ...item,
      armorBonus:
        item.armorBonus === undefined
          ? undefined
          : Math.max(0, normalizeNumber(item.armorBonus)),
      usePsyCost:
        item.usePsyCost === undefined
          ? undefined
          : Math.max(0, normalizeNumber(item.usePsyCost)),
      imageModule: item.imageModule,
      grantedSpell: item.grantedSpell ? normalizeSpell(item.grantedSpell) : undefined,
      tags: item.tags ?? [],
      activeEffects: item.activeEffects ?? [],
      passiveEffects: item.passiveEffects ?? [],
    })),
    spells: spells.map(normalizeSpell),
    activeSpellIds: character.activeSpellIds ?? [],
    inventory: inventory.map((item) => ({
      ...item,
      quantity: Math.max(0, normalizeNumber(item.quantity)),
      imageModule: item.imageModule,
      tags: item.tags ?? [],
    })),
    statusEffects: character.statusEffects ?? [],
    resistances: character.resistances ?? [],
  };
}
