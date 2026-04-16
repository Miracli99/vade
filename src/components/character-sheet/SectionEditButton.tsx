import { Pressable, StyleSheet, Text } from "react-native";

import { CharacterSheetTheme } from "./theme";

type SectionEditButtonProps = {
  theme: CharacterSheetTheme;
  onPress: () => void;
};

export function SectionEditButton({ theme, onPress }: SectionEditButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: theme.chipBg, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.label, { color: theme.title }]}>✎</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
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
