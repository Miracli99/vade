import { ArchetypeId } from "../../types/game";

export type EditorSection =
  | "all"
  | "identity"
  | "resources"
  | "stats"
  | "effects"
  | "resistances"
  | "skills"
  | "spells"
  | "equipment"
  | "inventory";

export type OverlayMenu =
  | "character"
  | "theme"
  | "stance"
  | "bioView"
  | "bioEdit"
  | "quickCast"
  | "quickRecovery"
  | "editorTheme"
  | "editorArchetype"
  | "editorSpecialization";

export type CreationDraft = {
  archetypeId: ArchetypeId;
  specialization: string;
  step: 1 | 2;
};

export type DamageDraft = {
  amount: string;
  ignoreArmor: boolean;
};

export type RecoveryDraft = {
  amount: string;
  mode: "heal" | "shield";
};

export type QuickCastDraft = {
  kind: "spell" | "equipment" | "equipmentSpell";
  id: string;
  sourceEquipmentId?: string;
  extraPsy: number;
};

export type ImageLibraryTarget =
  | { kind: "character" }
  | { kind: "spell"; index: number }
  | { kind: "equipment"; index: number }
  | { kind: "equipmentSpell"; index: number }
  | { kind: "inventory"; index: number };
