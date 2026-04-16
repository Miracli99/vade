import { Character, Spell } from "../types/game";

function normalizeSpell(spell: Spell): Spell {
  return {
    ...spell,
    imageModule: spell.imageModule,
    augmentable:
      spell.augmentable ??
      Boolean((spell as Spell & { scaling?: { label?: string; bonusPerPsy?: string } }).scaling),
    tags: spell.tags ?? [],
  };
}

export function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    archetypeId: character.archetypeId ?? "libre",
    specialization: character.specialization ?? "",
    bio: character.bio ?? "",
    theme: character.theme ?? "humain",
    pv: { ...character.pv, bonus: character.pv?.bonus ?? 0 },
    psy: { ...character.psy, bonus: 0 },
    armor: { ...character.armor, bonus: character.armor?.bonus ?? 0 },
    imageModule: character.imageModule,
    equipment: character.equipment.map((item) => ({
      ...item,
      imageModule: item.imageModule,
      grantedSpell: item.grantedSpell ? normalizeSpell(item.grantedSpell) : undefined,
      tags: item.tags ?? [],
    })),
    spells: character.spells.map(normalizeSpell),
    inventory: character.inventory.map((item) => ({
      ...item,
      imageModule: item.imageModule,
      tags: item.tags ?? [],
    })),
    statusEffects: character.statusEffects ?? [],
    resistances: character.resistances ?? [],
  };
}
