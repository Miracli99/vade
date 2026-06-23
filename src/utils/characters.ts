import { Character, CharacterRank, ResourcePool, Spell, StatusEffect } from "../types/game";
import { normalizeImageModule } from "./assets";
import { getEquipmentGrantedSpells } from "./game";

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

function normalizeSignedNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeRank(value: unknown): CharacterRank {
  if (value === "S") {
    return "S";
  }

  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) {
    return String(value) as CharacterRank;
  }

  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "5") {
    return value;
  }

  return "5";
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
    damageBonus:
      spell.damageBonus === undefined
        ? undefined
        : Math.max(0, normalizeNumber(spell.damageBonus)),
    reducible: spell.reducible ?? false,
    imageModule: normalizeImageModule(spell.imageModule),
    augmentable:
      spell.augmentable ??
      Boolean((spell as Spell & { scaling?: { label?: string; bonusPerPsy?: string } }).scaling),
    tags: spell.tags ?? [],
    activeEffects: spell.activeEffects ?? [],
    passiveEffects: spell.passiveEffects ?? [],
  };
}

function normalizeStatusEffect(effect: StatusEffect): StatusEffect {
  const rawBonuses = effect.bonuses ?? {};

  return {
    ...effect,
    category: effect.category ?? "neutral",
    source: effect.source ?? "",
    durationTurns: effect.durationTurns ?? null,
    active: effect.active ?? true,
    tags: effect.tags ?? [],
    bonuses: {
      attackBonus: normalizeSignedNumber(rawBonuses.attackBonus),
      armorBonus: normalizeSignedNumber(rawBonuses.armorBonus),
      pvBonus: normalizeSignedNumber(rawBonuses.pvBonus),
      shieldBonus: normalizeSignedNumber(rawBonuses.shieldBonus),
    },
  };
}

export function normalizeCharacter(character: Character): Character {
  const equipment = character.equipment ?? [];
  const spells = character.spells ?? [];
  const inventory = character.inventory ?? [];
  const skills = character.skills ?? [];
  const normalizedEquipment = equipment.map((item) => {
    const {
      grantedSpell: legacyGrantedSpell,
      reducible: _legacyReducible,
      usableLabel: _legacyUsableLabel,
      usePsyCost: _legacyUsePsyCost,
      ...itemWithoutLegacyAction
    } = item as Character["equipment"][number] & {
      grantedSpell?: Spell;
      reducible?: boolean;
      usableLabel?: string;
      usePsyCost?: number;
    };
    const grantedSpells = (item.grantedSpells ?? []).map(normalizeSpell);
    const normalizedLegacyGrantedSpell = legacyGrantedSpell
      ? normalizeSpell(legacyGrantedSpell)
      : undefined;

    if (
      normalizedLegacyGrantedSpell &&
      !grantedSpells.some((spell) => spell.id === normalizedLegacyGrantedSpell.id)
    ) {
      grantedSpells.push(normalizedLegacyGrantedSpell);
    }

    return {
      ...itemWithoutLegacyAction,
      armorBonus:
        item.armorBonus === undefined
          ? undefined
          : Math.max(0, normalizeNumber(item.armorBonus)),
      imageModule: normalizeImageModule(item.imageModule),
      grantedSpells,
      tags: item.tags ?? [],
      activeEffects: item.activeEffects ?? [],
      passiveEffects: item.passiveEffects ?? [],
    };
  });
  const normalizedSpells = spells.map(normalizeSpell);
  const knownSpellIds = new Set([
    ...normalizedSpells.map((spell) => spell.id),
    ...normalizedEquipment
      .flatMap(getEquipmentGrantedSpells)
      .map((spell) => spell.id),
  ]);

  return {
    ...character,
    archetypeId: character.archetypeId ?? "libre",
    specialization: character.specialization ?? "",
    bio: character.bio ?? "",
    theme: character.theme ?? "humain",
    cardBackgroundsEnabled: character.cardBackgroundsEnabled ?? true,
    level: character.level,
    rank: normalizeRank(character.rank),
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
    imageModule: normalizeImageModule(character.imageModule),
    skills: skills.map((skill) => ({
      ...skill,
      value: Math.max(0, normalizeNumber(skill.value)),
    })),
    equipment: normalizedEquipment,
    spells: normalizedSpells,
    activeSpellIds: (character.activeSpellIds ?? []).filter((id) => knownSpellIds.has(id)),
    inventory: inventory.map((item) => ({
      ...item,
      quantity: Math.max(0, normalizeNumber(item.quantity)),
      imageModule: normalizeImageModule(item.imageModule),
      tags: item.tags ?? [],
    })),
    statusEffects: (character.statusEffects ?? []).map(normalizeStatusEffect),
    resistances: character.resistances ?? [],
  };
}
