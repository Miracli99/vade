export type ImageLibraryCategory =
  | "character"
  | "spell"
  | "equipment"
  | "inventory";

export type LocalImageOption = {
  id: string;
  label: string;
  category: ImageLibraryCategory;
  imageModule: number;
};

export const LOCAL_IMAGE_LIBRARY: Record<ImageLibraryCategory, LocalImageOption[]> = {
  character: [
    {
      id: "char-cleric-hunter",
      label: "Cleric Hunter",
      category: "character",
      imageModule: require("../../assets/characters/cleric_hunter.png"),
    },
    {
      id: "char-demoniste",
      label: "Demoniste",
      category: "character",
      imageModule: require("../../assets/characters/demoniste.png"),
    },
    {
      id: "char-guerisseur-foret",
      label: "Guerisseur Foret",
      category: "character",
      imageModule: require("../../assets/characters/guerisseur_foret.png"),
    },
    {
      id: "char-paladin-ange",
      label: "Paladin Ange",
      category: "character",
      imageModule: require("../../assets/characters/paladin_ange.png"),
    },
  ],
  spell: [
    {
      id: "spell-sort-demoniaque",
      label: "Sort Demoniaque",
      category: "spell",
      imageModule: require("../../assets/spells/sort_demoniaque.png"),
    },
  ],
  equipment: [
    {
      id: "equip-lantern-occulte",
      label: "Lantern Occulte",
      category: "equipment",
      imageModule: require("../../assets/equipment/lantern_occulte.png"),
    },
  ],
  inventory: [
    {
      id: "item-potion-rouge",
      label: "Potion Rouge",
      category: "inventory",
      imageModule: require("../../assets/inventory/potion_rouge.png"),
    },
    {
      id: "item-fiole-rouge",
      label: "Fiole Rouge",
      category: "inventory",
      imageModule: require("../../assets/inventory/fiole_rouge.png"),
    },
    {
      id: "item-fiole-vert",
      label: "Fiole Verte",
      category: "inventory",
      imageModule: require("../../assets/inventory/fiole_verte.png"),
    },
    {
      id: "item-fiole-bleu",
      label: "Fiole Bleu",
      category: "inventory",
      imageModule: require("../../assets/inventory/fiole_bleu.png"),
    },
  ],
};
