import { Pressable, StyleSheet, Text, View } from "react-native";

import { ResourcePool } from "../../types/game";

type ThemeTokens = {
  chipBg: string;
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
  glyphScale?: number;
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
  glyphScale = 1,
  theme,
  onAdjust,
  onAdjustBonus,
}: ResourceMeterProps) {
  const fillRatio = resource.max === 0 ? 0 : resource.current / resource.max;

  return (
    <View
      style={[
        styles.resourceCard,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.resourceName, { color: theme.title }]}>{label}</Text>
      <View style={styles.resourceGlyphFrame}>
        <View style={[styles.resourceGlyphFillMask, { height: `${fillRatio * 100}%` }]}>
          <Text
            style={[
              styles.resourceGlyphFill,
              { color: accent, transform: [{ scale: glyphScale }] },
            ]}
          >
            {glyph}
          </Text>
        </View>
      </View>
      <Text style={[styles.resourceCount, { color: theme.title }]}>
        {resource.current}/{resource.max}
      </Text>
      {onAdjustBonus ? (
        <Text style={[styles.resourceBonus, { color: theme.subtitle }]}>
          {bonusLabel} +{resource.bonus}
        </Text>
      ) : null}
      <View style={styles.resourceButtons}>
        <AdjustButton label="-1" onPress={() => onAdjust(-1)} theme={theme} />
        <AdjustButton label="+1" onPress={() => onAdjust(1)} theme={theme} />
      </View>
      {onAdjustBonus ? (
        <View style={styles.resourceButtons}>
          <AdjustButton label="-B" onPress={() => onAdjustBonus(-1)} theme={theme} />
          <AdjustButton label="+B" onPress={() => onAdjustBonus(1)} theme={theme} />
        </View>
      ) : null}
    </View>
  );
}

type AttackBonusCardProps = {
  value: number;
  theme: ThemeTokens & { accent: string };
  onAdjust: (delta: number) => void;
};

export function AttackBonusCard({ value, theme, onAdjust }: AttackBonusCardProps) {
  return (
    <View
      style={[
        styles.resourceCard,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.resourceName, { color: theme.title }]}>Attaque bonus</Text>
      <View style={styles.resourceGlyphWrap}>
        <Text style={[styles.attackGlyph, { color: theme.accent }]}>✦</Text>
      </View>
      <Text style={[styles.resourceCount, { color: theme.title }]}>+{value}</Text>
      <Text style={[styles.resourceBonus, { color: theme.subtitle }]}>
        Modificateur offensif
      </Text>
      <View style={styles.resourceButtons}>
        <AdjustButton label="-1" onPress={() => onAdjust(-1)} theme={theme} />
        <AdjustButton label="+1" onPress={() => onAdjust(1)} theme={theme} />
      </View>
    </View>
  );
}

type AdjustButtonProps = {
  label: string;
  theme: Pick<ThemeTokens, "border" | "buttonBg" | "buttonText">;
  onPress: () => void;
};

export function AdjustButton({ label, theme, onPress }: AdjustButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.adjustButton,
        { backgroundColor: theme.buttonBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.adjustButtonLabel, { color: theme.buttonText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  resourceCard: {
    flexGrow: 1,
    flexBasis: 210,
    alignItems: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
  },
  resourceName: {
    color: "#f8fafc",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  resourceGlyphFrame: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  resourceGlyphWrap: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceGlyphFillMask: {
    width: 96,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  resourceGlyphFill: {
    fontSize: 76,
    lineHeight: 82,
  },
  resourceCount: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  resourceBonus: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: "700",
  },
  resourceButtons: {
    flexDirection: "row",
    gap: 10,
  },
  attackGlyph: {
    color: "#fbbf24",
    fontSize: 76,
    lineHeight: 82,
  },
  adjustButton: {
    minWidth: 54,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1b2740",
    borderWidth: 1,
  },
  adjustButtonLabel: {
    color: "#f8fafc",
    fontWeight: "800",
  },
});
