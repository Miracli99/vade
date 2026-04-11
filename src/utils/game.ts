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

export function getSpellCost(spell: Spell, stance: CombatStance) {
  if (!spell.reducible || stance !== "focus") {
    return spell.basePsyCost;
  }

  return Math.max(0, spell.basePsyCost - 1);
}

export function clampValue(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}
