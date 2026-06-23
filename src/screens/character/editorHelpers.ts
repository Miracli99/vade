import { StatusEffect } from "../../types/game";
import { EditorSection } from "./types";

export function getEditorSectionTitle(section: EditorSection) {
  switch (section) {
    case "identity":
      return "Identite du personnage";
    case "resources":
      return "Ressources et combat";
    case "stats":
      return "Stats";
    case "effects":
      return "Buffs et debuffs";
    case "resistances":
      return "Affinites";
    case "skills":
      return "Competences";
    case "spells":
      return "Dons";
    case "equipment":
      return "Equipements";
    case "inventory":
      return "Inventaire";
    default:
      return "Edition complete";
  }
}

export function getEditorSectionSubtitle(section: EditorSection) {
  switch (section) {
    case "all":
      return "Modifie les informations du personnage, puis sauvegarde une fois les changements termines.";
    case "effects":
      return "Ajoute, active ou retire les effets qui changent les stats pendant la partie.";
    case "resources":
      return "Ajuste PV, PSY, armure, bouclier et attaque bonus.";
    case "identity":
      return "Nom, archetype, rang, theme, bio et portrait.";
    default:
      return "Edition ciblee de la section ouverte sur la fiche.";
  }
}

export function compactText(value: string | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

export function formatEditorTags(tags: string[] = []) {
  if (!tags.length) {
    return "";
  }

  return tags.slice(0, 3).join(", ") + (tags.length > 3 ? "..." : "");
}

function formatSignedEditorValue(value: number | undefined) {
  const safeValue = value ?? 0;
  return safeValue > 0 ? `+${safeValue}` : String(safeValue);
}

export function getStatusEffectKindLabel(effect: StatusEffect) {
  if (effect.category === "buff") {
    return "Buff";
  }

  if (effect.category === "debuff") {
    return "Debuff";
  }

  return "Effet";
}

export function getStatusEffectSummary(effect: StatusEffect) {
  const bonuses = [
    effect.bonuses?.attackBonus ? `Atk ${formatSignedEditorValue(effect.bonuses.attackBonus)}` : null,
    effect.bonuses?.armorBonus ? `Arm ${formatSignedEditorValue(effect.bonuses.armorBonus)}` : null,
    effect.bonuses?.pvBonus ? `PV ${formatSignedEditorValue(effect.bonuses.pvBonus)}` : null,
    effect.bonuses?.shieldBonus
      ? `Bouclier ${formatSignedEditorValue(effect.bonuses.shieldBonus)}`
      : null,
  ].filter(Boolean);

  return [
    effect.active ? "Actif" : "Inactif",
    effect.durationTurns === null ? "Duree libre" : `${effect.durationTurns} tour(s)`,
    effect.source ? `Source: ${effect.source}` : null,
    bonuses.length ? bonuses.join(" · ") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
