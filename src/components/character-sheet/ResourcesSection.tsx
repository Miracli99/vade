import { StyleSheet, View } from "react-native";

import { Character } from "../../types/game";
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
  return (
    <Section
      title="Ressources"
      subtitle="Ajustement rapide pendant la partie."
      theme={{
        sectionBg: theme.panelBg,
        sectionBorder: theme.border,
        title: theme.title,
        subtitle: theme.subtitle,
      }}
      rightSlot={<SectionEditButton theme={theme} onPress={onEdit} />}
    >
      <View style={styles.grid}>
        <ResourceMeter
          label="PV"
          glyph="♥"
          accent="#ef4444"
          resource={character.pv}
          bonusLabel="Bouclier"
          glyphScale={1}
          theme={theme}
          onAdjust={(delta) => onAdjustResource("pv", delta)}
          onAdjustBonus={(delta) => onAdjustResourceBonus("pv", delta)}
        />
        <ResourceMeter
          label="PSY"
          glyph="💧"
          accent="#38bdf8"
          resource={character.psy}
          glyphScale={0.78}
          theme={theme}
          onAdjust={(delta) => onAdjustResource("psy", delta)}
        />
        <ResourceMeter
          label="Armure"
          glyph="🛡"
          accent="#f59e0b"
          resource={character.armor}
          bonusLabel="Bonus"
          glyphScale={1}
          theme={theme}
          onAdjust={(delta) => onAdjustResource("armor", delta)}
          onAdjustBonus={(delta) => onAdjustResourceBonus("armor", delta)}
        />
        <AttackBonusCard
          value={character.attackBonus}
          theme={theme}
          onAdjust={onAdjustAttackBonus}
        />
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
});
