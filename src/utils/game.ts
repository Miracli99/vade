import { CombatStance, Spell } from "../types/game";

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

export function clampValue(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}
