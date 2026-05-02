import { Character, CombatStance, ResourcePool, Spell } from "../types/game";

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

export function getEquipmentArmorBonus(equipment: Character["equipment"]) {
  return equipment.reduce(
    (total, item) => total + Math.max(0, item.armorBonus ?? 0),
    0,
  );
}

export function getActiveSpellArmorBonus(character: Character) {
  const activeSpellIds = new Set(character.activeSpellIds);
  const equipmentSpells = character.equipment
    .map((item) => item.grantedSpell)
    .filter((spell): spell is Spell => Boolean(spell));
  const activeSpells = [...character.spells, ...equipmentSpells].filter((spell) =>
    activeSpellIds.has(spell.id),
  );

  return activeSpells.reduce(
    (total, spell) => total + Math.max(0, spell.armorBonus ?? 0),
    0,
  );
}

export function getEffectiveArmorResource(character: Character): ResourcePool {
  const activeBonus =
    character.armor.bonus +
    getEquipmentArmorBonus(character.equipment) +
    getActiveSpellArmorBonus(character);

  return {
    current: character.armor.current + activeBonus,
    max: character.armor.max + activeBonus,
    bonus: activeBonus,
  };
}

export function clampValue(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}
