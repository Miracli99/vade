import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { ResourcePool } from "../../types/game";
import { getResponsiveFlags } from "../../utils/responsive";
import { modernColors, modernRadii } from "../ui/design";

type ThemeTokens = {
  chipBg: string;
  panelBg?: string;
  border: string;
  title: string;
  subtitle: string;
  buttonBg: string;
  buttonText: string;
  accent?: string;
};

type ResourceMeterProps = {
  label: string;
  glyph: string;
  accent: string;
  resource: ResourcePool;
  bonusLabel?: string;
  bonusDetail?: string;
  overlayBonus?: boolean;
  theme: ThemeTokens;
  onAdjust: (delta: number) => void;
  onAdjustBonus?: (delta: number) => void;
};

export function ResourceMeter({
  label,
  glyph,
  accent,
  resource,
  bonusLabel = "Bonus",
  bonusDetail,
  overlayBonus = false,
  theme,
  onAdjust,
  onAdjustBonus,
}: ResourceMeterProps) {
  const { width } = useWindowDimensions();
  const { isPhone, isNarrowPhone } = getResponsiveFlags(width);
  const effectiveMax = overlayBonus
    ? Math.max(resource.max, resource.current + resource.bonus, 1)
    : Math.max(resource.max, 1);
  const fillRatio = resource.current / effectiveMax;
  const clampedBaseRatio = Math.max(0, Math.min(fillRatio, 1));
  const bonusRatio = overlayBonus ? resource.bonus / effectiveMax : 0;
  const clampedBonusRatio = Math.max(0, Math.min(bonusRatio, 1 - clampedBaseRatio));

  return (
    <View style={[styles.card, isPhone ? styles.cardPhone : null, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.label, isPhone ? styles.labelPhone : null, { color: theme.title }]}>
            {label}
          </Text>
          <Text style={[styles.subtle, { color: theme.subtitle }]}>
            {onAdjustBonus ? `${bonusLabel} +${resource.bonus}` : "Reserve active"}
          </Text>
          {bonusDetail ? (
            <Text style={[styles.subtle, styles.detailText, { color: theme.subtitle }]}>
              {bonusDetail}
            </Text>
          ) : null}
        </View>
        <View style={[styles.countPill, { borderColor: theme.border }]}>
          <Text style={[styles.count, isPhone ? styles.countPhone : null, { color: theme.title }]}>
            {resource.current}/{resource.max}
          </Text>
        </View>
      </View>

      <View style={styles.visualRow}>
        <View style={[styles.iconWrap, isPhone ? styles.iconWrapPhone : null, { backgroundColor: theme.panelBg ?? theme.chipBg, borderColor: theme.border }]}>
          <Text style={[styles.icon, isPhone ? styles.iconPhone : null, { color: accent }]}>{glyph}</Text>
        </View>
        <View style={styles.trackBlock}>
          <View style={[styles.track, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.fill,
                { width: `${clampedBaseRatio * 100}%`, backgroundColor: accent },
              ]}
            />
            {overlayBonus && resource.bonus > 0 ? (
              <View
                style={[
                  styles.bonusFill,
                  {
                    left: `${clampedBaseRatio * 100}%`,
                    width: `${clampedBonusRatio * 100}%`,
                  },
                ]}
              />
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.subtitle }]}>0</Text>
            <Text style={[styles.metaText, { color: theme.subtitle }]}>
              max {overlayBonus ? effectiveMax : resource.max}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.controlsRow, isNarrowPhone ? styles.controlsRowTight : null]}>
        <AdjustButton label="-1" onPress={() => onAdjust(-1)} theme={theme} compact={isPhone} />
        <AdjustButton label="+1" onPress={() => onAdjust(1)} theme={theme} compact={isPhone} />
        {onAdjustBonus ? (
          <>
            <AdjustButton label="-B" onPress={() => onAdjustBonus(-1)} theme={theme} compact={isPhone} />
            <AdjustButton label="+B" onPress={() => onAdjustBonus(1)} theme={theme} compact={isPhone} />
          </>
        ) : null}
      </View>
    </View>
  );
}

type AttackBonusCardProps = {
  value: number;
  activeSpellDamageBonus?: number;
  theme: ThemeTokens & { accent: string };
  onAdjust: (delta: number) => void;
};

export function AttackBonusCard({
  value,
  activeSpellDamageBonus = 0,
  theme,
  onAdjust,
}: AttackBonusCardProps) {
  const { width } = useWindowDimensions();
  const isPhone = getResponsiveFlags(width).isPhone;
  const effectiveValue = value + activeSpellDamageBonus;

  return (
    <View style={[styles.card, isPhone ? styles.cardPhone : null, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.label, isPhone ? styles.labelPhone : null, { color: theme.title }]}>
            Attaque bonus
          </Text>
          <Text style={[styles.subtle, { color: theme.subtitle }]}>Modificateur offensif</Text>
          {activeSpellDamageBonus > 0 ? (
            <Text style={[styles.subtle, styles.detailText, { color: theme.subtitle }]}>
              Augmente par don actif +{activeSpellDamageBonus} degats
            </Text>
          ) : null}
        </View>
        <View style={[styles.countPill, { borderColor: theme.border }]}>
          <Text style={[styles.count, isPhone ? styles.countPhone : null, { color: theme.title }]}>+{effectiveValue}</Text>
        </View>
      </View>

      <View style={styles.visualRow}>
        <View style={[styles.iconWrap, isPhone ? styles.iconWrapPhone : null, { backgroundColor: theme.panelBg ?? theme.chipBg, borderColor: theme.border }]}>
          <Text style={[styles.icon, isPhone ? styles.iconPhone : null, { color: theme.accent }]}>✦</Text>
        </View>
        <View style={styles.attackSummary}>
          <Text style={[styles.attackValue, isPhone ? styles.attackValuePhone : null, { color: theme.title }]}>
            +{effectiveValue}
          </Text>
          <Text style={[styles.subtle, { color: theme.subtitle }]}>Ajoute ce bonus aux actions offensives</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <AdjustButton label="-1" onPress={() => onAdjust(-1)} theme={theme} compact={isPhone} />
        <AdjustButton label="+1" onPress={() => onAdjust(1)} theme={theme} compact={isPhone} />
      </View>
    </View>
  );
}

type AdjustButtonProps = {
  label: string;
  theme: Pick<ThemeTokens, "border" | "buttonBg" | "buttonText">;
  onPress: () => void;
  compact?: boolean;
};

export function AdjustButton({ label, theme, onPress, compact = false }: AdjustButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.adjustButton,
        compact ? styles.adjustButtonCompact : null,
        { backgroundColor: theme.buttonBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.adjustButtonLabel, compact ? styles.adjustButtonLabelCompact : null, { color: theme.buttonText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    gap: 12,
    padding: 14,
    borderRadius: modernRadii.lg,
    borderWidth: 1,
  },
  cardPhone: {
    gap: 10,
    padding: 12,
    borderRadius: modernRadii.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  labelPhone: {
    fontSize: 12,
    letterSpacing: 0.7,
  },
  subtle: {
    fontSize: 12,
    lineHeight: 18,
  },
  detailText: {
    fontWeight: "800",
  },
  countPill: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: modernRadii.sm,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "rgba(5, 8, 13, 0.38)",
  },
  count: {
    fontSize: 20,
    fontWeight: "900",
  },
  countPhone: {
    fontSize: 17,
  },
  visualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: modernRadii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapPhone: {
    width: 48,
    height: 48,
    borderRadius: modernRadii.md,
  },
  icon: {
    fontSize: 28,
    lineHeight: 32,
  },
  iconPhone: {
    fontSize: 24,
    lineHeight: 28,
  },
  trackBlock: {
    flex: 1,
    gap: 6,
  },
  track: {
    height: 9,
    borderRadius: modernRadii.sm,
    overflow: "hidden",
    opacity: 0.88,
  },
  fill: {
    height: "100%",
    borderRadius: modernRadii.sm,
  },
  bonusFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: modernRadii.sm,
    backgroundColor: modernColors.azure,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "700",
  },
  attackSummary: {
    flex: 1,
    gap: 4,
  },
  attackValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  attackValuePhone: {
    fontSize: 20,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
  },
  controlsRowTight: {
    gap: 6,
  },
  adjustButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: modernRadii.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  adjustButtonCompact: {
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: modernRadii.sm,
  },
  adjustButtonLabel: {
    fontSize: 13,
    fontWeight: "900",
  },
  adjustButtonLabelCompact: {
    fontSize: 12,
  },
});
