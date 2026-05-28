import { Pressable, StyleSheet, Text } from "react-native";

import { CharacterSheetTheme } from "./theme";

type SectionEditButtonProps = {
  theme: CharacterSheetTheme;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function SectionEditButton({
  theme,
  onPress,
  accessibilityLabel = "Modifier la section",
}: SectionEditButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.label, { color: theme.title }]}>✎</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
  },
});
