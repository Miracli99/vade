import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { historySections } from "../data/historyContent";

type HistoryScreenProps = {
  onOpenHome: () => void;
};

export function HistoryScreen({ onOpenHome }: HistoryScreenProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 760;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isPhone ? styles.contentPhone : styles.contentWide]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={onOpenHome} style={styles.backButton}>
          <Text style={styles.backButtonLabel}>← Accueil</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Histoire</Text>
        <Text style={styles.title}>Chroniques de Vade Retro</Text>
        <Text style={styles.description}>
          Lecture synthétique du cadre de jeu, de la genese au ton general de la campagne.
        </Text>
      </View>

      <View style={styles.sectionList}>
        {historySections.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {"quote" in section && section.quote ? (
              <Text style={styles.quote}>“{section.quote}”</Text>
            ) : null}
            <View style={styles.bodyList}>
              {section.body.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0b0d12",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  contentPhone: {
    paddingHorizontal: 16,
  },
  contentWide: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    gap: 8,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "rgba(24, 18, 12, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.22)",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.24)",
  },
  backButtonLabel: {
    color: "#fde68a",
    fontWeight: "800",
  },
  eyebrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#fff7ed",
    fontSize: 30,
    fontWeight: "900",
  },
  description: {
    color: "#fed7aa",
    lineHeight: 22,
  },
  sectionList: {
    gap: 16,
  },
  sectionCard: {
    gap: 12,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(17, 24, 39, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  quote: {
    color: "#fbbf24",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  bodyList: {
    gap: 10,
  },
  paragraph: {
    color: "#cbd5e1",
    lineHeight: 24,
    fontSize: 15,
  },
});
