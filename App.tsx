import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";

import { CharacterSheetScreen } from "./src/screens/CharacterSheetScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />
      <CharacterSheetScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
});
