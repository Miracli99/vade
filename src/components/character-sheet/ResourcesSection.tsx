import { StyleSheet, View, useWindowDimensions } from "react-native";

import { Character } from "../../types/game";
import {
  getActiveSpellArmorBonus,
  getActiveSpellDamageBonus,
  getActiveStatusEffectBonuses,
  getEffectiveArmorResource,
  getEffectivePvResource,
} from "../../utils/game";
import { getResponsiveFlags } from "../../utils/responsive";
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
  const { isPhone, isTablet } = getResponsiveFlags(width);
  const effectivePv = getEffectivePvResource(character);
  const effectiveArmor = getEffectiveArmorResource(character);
  const activeSpellArmorBonus = getActiveSpellArmorBonus(character);
  const activeSpellDamageBonus = getActiveSpellDamageBonus(character);
  const statusBonuses = getActiveStatusEffectBonuses(character);

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
      rightSlot={<SectionEditButton theme={theme} onPress={onEdit} accessibilityLabel="Modifier les ressources" />}
    >
      <View style={styles.grid}>
        <View style={[styles.cell, isPhone ? styles.cellPhone : isTablet ? styles.cellTablet : styles.cellDesktop]}>
          <ResourceMeter
            label="PV"
            glyph="♥"
            accent="#ef4444"
            resource={effectivePv}
            bonusLabel="Bouclier"
            bonusDetail={
              statusBonuses.pvBonus !== 0 || statusBonuses.shieldBonus !== 0
                ? [
                    statusBonuses.pvBonus !== 0
                      ? `PV ${statusBonuses.pvBonus > 0 ? "+" : ""}${statusBonuses.pvBonus}`
                      : null,
                    statusBonuses.shieldBonus !== 0
                      ? `bouclier ${statusBonuses.shieldBonus > 0 ? "+" : ""}${statusBonuses.shieldBonus}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : undefined
            }
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
              activeSpellArmorBonus > 0 || statusBonuses.armorBonus !== 0
                ? [
                    activeSpellArmorBonus > 0 ? `don actif +${activeSpellArmorBonus}` : null,
                    statusBonuses.armorBonus !== 0
                      ? `buff/debuff ${statusBonuses.armorBonus > 0 ? "+" : ""}${statusBonuses.armorBonus}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
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
            statusAttackBonus={statusBonuses.attackBonus}
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
