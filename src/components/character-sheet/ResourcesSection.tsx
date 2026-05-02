import { StyleSheet, View, useWindowDimensions } from "react-native";

import { Character } from "../../types/game";
import {
  getActiveSpellArmorBonus,
  getActiveSpellDamageBonus,
  getEffectiveArmorResource,
} from "../../utils/game";
import { Section } from "../Section";
import { AttackBonusCard, ResourceMeter } from "./ResourceCards";
import { SectionEditButton } from "./SectionEditButton";
import { CharacterSheetTheme } from "./theme";

type ResourcesSectionProps = {
  character: Character;
  theme: CharacterSheetTheme;
  onEdit: () => void;
  onAdjustResource: (resourceKey: "pv" | "psy" | "armor", delta: number) => void;
  onAdjustResourceBonus: (resourceKey: "pv" | "psy" | "armor", delta: number) => void;
  onAdjustAttackBonus: (delta: number) => void;
};

export function ResourcesSection({
  character,
  theme,
  onEdit,
  onAdjustResource,
  onAdjustResourceBonus,
  onAdjustAttackBonus,
}: ResourcesSectionProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 720;
  const isTablet = width >= 720 && width < 1180;
  const effectiveArmor = getEffectiveArmorResource(character);
  const activeSpellArmorBonus = getActiveSpellArmorBonus(character);
  const activeSpellDamageBonus = getActiveSpellDamageBonus(character);

  return (
    <Section
      title="Ressources"
      subtitle="Ajustement rapide pendant la partie."
      theme={{
        sectionBg: theme.panelBg,
        sectionBorder: theme.border,
        title: theme.title,
        subtitle: theme.subtitle,
        cardBackgroundImage: theme.cardBackgroundImage,
      }}
      rightSlot={<SectionEditButton theme={theme} onPress={onEdit} />}
    >
      <View style={styles.grid}>
        <View style={[styles.cell, isPhone ? styles.cellPhone : isTablet ? styles.cellTablet : styles.cellDesktop]}>
          <ResourceMeter
            label="PV"
            glyph="♥"
            accent="#ef4444"
            resource={character.pv}
            bonusLabel="Bouclier"
            overlayBonus
            theme={theme}
            onAdjust={(delta) => onAdjustResource("pv", delta)}
            onAdjustBonus={(delta) => onAdjustResourceBonus("pv", delta)}
          />
        </View>
        <View style={[styles.cell, isPhone ? styles.cellPhone : isTablet ? styles.cellTablet : styles.cellDesktop]}>
          <ResourceMeter
            label="PSY"
            glyph="💧"
            accent="#38bdf8"
            resource={character.psy}
            theme={theme}
            onAdjust={(delta) => onAdjustResource("psy", delta)}
          />
        </View>
        <View style={[styles.cell, isPhone ? styles.cellPhone : isTablet ? styles.cellTablet : styles.cellDesktop]}>
          <ResourceMeter
            label="Armure"
            glyph="🛡"
            accent="#f59e0b"
            resource={effectiveArmor}
            bonusLabel="Bonus"
            bonusDetail={
              activeSpellArmorBonus > 0
                ? `Augmentee par don actif +${activeSpellArmorBonus}`
                : undefined
            }
            theme={theme}
            onAdjust={(delta) => onAdjustResource("armor", delta)}
            onAdjustBonus={(delta) => onAdjustResourceBonus("armor", delta)}
          />
        </View>
        <View style={[styles.cell, isPhone ? styles.cellPhone : isTablet ? styles.cellTablet : styles.cellDesktop]}>
          <AttackBonusCard
            value={character.attackBonus}
            activeSpellDamageBonus={activeSpellDamageBonus}
            theme={theme}
            onAdjust={onAdjustAttackBonus}
          />
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  cell: {
    flexGrow: 1,
  },
  cellPhone: {
    flexBasis: "100%",
  },
  cellTablet: {
    flexBasis: "48%",
  },
  cellDesktop: {
    flexBasis: 220,
  },
});
