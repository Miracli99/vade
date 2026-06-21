import { Character, CombatStance, ResourcePool, Spell } from "../types/game";

export type StatusEffectBonuses = {
  attackBonus: number;
  armorBonus: number;
  pvBonus: number;
  shieldBonus: number;
};

const EMPTY_STATUS_EFFECT_BONUSES: StatusEffectBonuses = {
  attackBonus: 0,
  armorBonus: 0,
  pvBonus: 0,
  shieldBonus: 0,
};

export const stanceLabels: Record<CombatStance, string> = {
  focus: "Focus",
  combat: "Combat",
  defensif: "Defensif",
};

export const stanceDescriptions: Record<CombatStance, string> = {
  focus: "Reduit de 1 le cout des sorts reductibles.",
  combat: "L'arme inflige son maximum a chaque frappe.",
  defensif: "Autorise parade et esquive.",
};

export function getReducibleCost(baseCost: number, reducible: boolean, stance: CombatStance) {
  if (!reducible || stance !== "focus") {
    return baseCost;
  }

  return Math.max(0, baseCost - 1);
}

export function getSpellCost(spell: Spell, stance: CombatStance) {
  return getReducibleCost(spell.basePsyCost, spell.reducible, stance);
}

export function getScaledSpellCost(
  spell: Spell,
  stance: CombatStance,
  extraPsy: number = 0,
) {
  return getSpellCost(spell, stance) + Math.max(0, extraPsy);
}

export function getEquipmentArmorBonus(equipment: Character["equipment"] = []) {
  return equipment.reduce(
    (total, item) => total + Math.max(0, item.armorBonus ?? 0),
    0,
  );
}

export function getActiveSpellArmorBonus(character: Character) {
  return getActiveSpells(character).reduce(
    (total, spell) => total + Math.max(0, spell.armorBonus ?? 0),
    0,
  );
}

export function getActiveSpellDamageBonus(character: Character) {
  return getActiveSpells(character).reduce(
    (total, spell) => total + Math.max(0, spell.damageBonus ?? 0),
    0,
  );
}

export function getActiveStatusEffectBonuses(character: Character): StatusEffectBonuses {
  return (character.statusEffects ?? []).reduce<StatusEffectBonuses>(
    (total, effect) => {
      if (!effect.active) {
        return total;
      }

      return {
        attackBonus: total.attackBonus + (effect.bonuses?.attackBonus ?? 0),
        armorBonus: total.armorBonus + (effect.bonuses?.armorBonus ?? 0),
        pvBonus: total.pvBonus + (effect.bonuses?.pvBonus ?? 0),
        shieldBonus: total.shieldBonus + (effect.bonuses?.shieldBonus ?? 0),
      };
    },
    { ...EMPTY_STATUS_EFFECT_BONUSES },
  );
}

export function getEffectivePvResource(character: Character): ResourcePool {
  const pv = character.pv ?? { current: 0, max: 0, bonus: 0 };
  const statusBonuses = getActiveStatusEffectBonuses(character);
  const max = Math.max(0, pv.max + statusBonuses.pvBonus);
  const shield = Math.max(0, pv.bonus + statusBonuses.shieldBonus);

  return {
    current: Math.max(0, Math.min(pv.current, max)),
    max,
    bonus: shield,
  };
}

export function getEffectiveAttackBonus(character: Character) {
  return (
    character.attackBonus +
    getActiveSpellDamageBonus(character) +
    getActiveStatusEffectBonuses(character).attackBonus
  );
}

function getActiveSpells(character: Character) {
  const activeSpellIds = new Set(character.activeSpellIds ?? []);
  const equipmentSpells = (character.equipment ?? [])
    .map((item) => item.grantedSpell)
    .filter((spell): spell is Spell => Boolean(spell));
  return [...(character.spells ?? []), ...equipmentSpells].filter((spell) =>
    activeSpellIds.has(spell.id),
  );
}

export function getEffectiveArmorResource(character: Character): ResourcePool {
  const armor = character.armor ?? { current: 0, max: 0, bonus: 0 };
  const statusBonuses = getActiveStatusEffectBonuses(character);
  const activeBonus =
    armor.bonus +
    getEquipmentArmorBonus(character.equipment) +
    getActiveSpellArmorBonus(character) +
    statusBonuses.armorBonus;

  return {
    current: Math.max(0, armor.current + activeBonus),
    max: Math.max(0, armor.max + activeBonus),
    bonus: activeBonus,
  };
}

export function clampValue(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}
