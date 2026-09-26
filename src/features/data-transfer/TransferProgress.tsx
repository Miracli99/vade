import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { modernColors, modernRadii } from "../../components/ui/design";

export function TransferProgress({ operation }: { operation: "import" | "export" | null }) {
  return (
    <Modal visible={operation !== null} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal accessibilityState={{ busy: true }}>
          <ActivityIndicator size="large" color={modernColors.accent} />
          <Text style={styles.title} accessibilityRole="header" accessibilityLiveRegion="polite">
            {operation === "import" ? "Importation en cours…" : "Exportation en cours…"}
          </Text>
          <Text style={styles.message}>
            {operation === "import"
              ? "Lecture du fichier et préparation des personnages."
              : "Préparation de l’archive et des images à partager."}
          </Text>
          <Text style={styles.hint}>Veuillez patienter sans fermer l’application.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.72)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { width: "100%", maxWidth: 400, padding: 28, gap: 16, alignItems: "center", backgroundColor: modernColors.panel, borderColor: modernColors.borderStrong, borderWidth: 1, borderRadius: modernRadii.xl },
  title: { color: modernColors.text, fontSize: 21, fontWeight: "700", textAlign: "center" },
  message: { color: modernColors.textSoft, fontSize: 15, lineHeight: 22, textAlign: "center" },
  hint: { color: modernColors.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
});
