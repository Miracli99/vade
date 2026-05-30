import { Image, StyleSheet, View } from "react-native";

import { CharacterSheetTheme } from "./theme";

type CharacterSheetBackdropProps = {
  theme: CharacterSheetTheme;
};

export function CharacterSheetBackdrop({ theme }: CharacterSheetBackdropProps) {
  return (
    <>
      <Image source={theme.backgroundImage} style={styles.pageBackdrop} resizeMode="cover" />
      <View style={[styles.pageBackdropOverlay, { backgroundColor: theme.pageBg }]} />
      <View style={[styles.pageGlow, { backgroundColor: theme.accent }]} />
    </>
  );
}

const styles = StyleSheet.create({
  pageBackdrop: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  pageBackdropOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.58,
  },
  pageGlow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 999,
    opacity: 0.1,
  },
});
