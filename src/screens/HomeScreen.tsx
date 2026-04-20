import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { AssetVisual } from "../components/character-sheet/AssetVisual";
import { Character } from "../types/game";

const APP_LOGO = require("../../assets/vade-retro-logo.png");

type HomeScreenProps = {
  characters: Character[];
  selectedId: string;
  message?: string | null;
  onCreateCharacter: () => void;
  onImportCharacters: () => void;
  onExportCharacters: () => void;
  onOpenCharacter: (characterId: string) => void;
  onOpenHistory: () => void;
};

export function HomeScreen({
  characters,
  selectedId,
  message,
  onCreateCharacter,
  onImportCharacters,
  onExportCharacters,
  onOpenCharacter,
  onOpenHistory,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 760;
  const isNarrowPhone = width < 430;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isPhone ? styles.contentPhone : styles.contentWide]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={[styles.brandRow, isPhone ? styles.brandRowPhone : null]}>
          <Image
            source={APP_LOGO}
            style={[styles.logo, isPhone ? styles.logoPhone : null]}
            resizeMode="contain"
          />
          <View style={styles.brandText}>
            <Text style={styles.eyebrow}>Vade Retro</Text>
            <Text style={[styles.title, isPhone ? styles.titlePhone : null]}>Portail de campagne</Text>
            <Text style={styles.description}>
              Choisis une fiche personnage ou ouvre l&apos;histoire de l&apos;univers.
            </Text>
          </View>
        </View>

        <Pressable onPress={onOpenHistory} style={styles.storyCard}>
          <Text style={styles.storyEyebrow}>Lecture</Text>
          <Text style={styles.storyTitle}>Histoire</Text>
          <Text style={styles.storyDescription}>
            Accede au contexte, a la genese, au Vide et a la tonalite de Vade Retro.
          </Text>
          <Text style={styles.storyCta}>Ouvrir la page histoire</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderTop}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Personnages</Text>
            <Text style={styles.sectionSubtitle}>Selection directe vers la fiche</Text>
          </View>
          <View style={styles.rosterActions}>
            <Pressable onPress={onCreateCharacter} style={styles.primaryActionButton}>
              <Text style={styles.primaryActionLabel}>Nouveau</Text>
            </Pressable>
            <Pressable onPress={onImportCharacters} style={styles.secondaryActionButton}>
              <Text style={styles.secondaryActionLabel}>Importer</Text>
            </Pressable>
            <Pressable onPress={onExportCharacters} style={styles.secondaryActionButton}>
              <Text style={styles.secondaryActionLabel}>Exporter</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {message ? (
        <View style={styles.messageBanner}>
          <Text style={styles.messageBannerText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.rosterGrid}>
        {characters.map((character) => {
          const active = character.id === selectedId;

          return (
            <Pressable
              key={character.id}
              onPress={() => onOpenCharacter(character.id)}
              style={[
                styles.characterCard,
                isPhone ? styles.characterCardPhone : null,
                active ? styles.characterCardActive : null,
              ]}
            >
              <AssetVisual
                label={character.name}
                imageUrl={character.imageUrl}
                imageModule={character.imageModule}
                icon={character.name.slice(0, 1)}
                character
              />
              <View style={styles.characterBody}>
                <View style={styles.characterHeader}>
                  <Text
                    style={styles.characterName}
                    numberOfLines={isNarrowPhone ? 2 : 1}
                  >
                    {character.name}
                  </Text>
                  {active ? (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeLabel}>Actif</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.characterMeta}>
                  {character.archetype}
                  {character.specialization ? ` · ${character.specialization}` : ""}
                </Text>
                <Text style={styles.characterStats}>
                  PV {character.pv.current}/{character.pv.max} · PSY {character.psy.current}/
                  {character.psy.max}
                </Text>
                <Text style={styles.characterBio} numberOfLines={3}>
                  {character.bio || "Aucune bio renseignee."}
                </Text>
                <Text style={styles.characterCta}>Ouvrir la fiche</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#090d16",
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
    maxWidth: 1240,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    gap: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 28,
    backgroundColor: "rgba(16, 24, 40, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  brandRowPhone: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  logo: {
    width: 72,
    height: 72,
  },
  logoPhone: {
    width: 56,
    height: 56,
  },
  brandText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
  },
  titlePhone: {
    fontSize: 24,
  },
  description: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  storyCard: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: "rgba(43, 22, 7, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.28)",
    gap: 8,
  },
  storyEyebrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  storyTitle: {
    color: "#fff7ed",
    fontSize: 24,
    fontWeight: "900",
  },
  storyDescription: {
    color: "#fed7aa",
    lineHeight: 22,
  },
  storyCta: {
    color: "#fde68a",
    fontWeight: "800",
  },
  sectionHeader: {
    gap: 4,
  },
  sectionHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  sectionHeaderText: {
    gap: 4,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: "#94a3b8",
  },
  rosterActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#fbbf24",
  },
  primaryActionLabel: {
    color: "#3f2200",
    fontWeight: "900",
  },
  secondaryActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  secondaryActionLabel: {
    color: "#e2e8f0",
    fontWeight: "800",
  },
  messageBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(16, 24, 40, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.26)",
  },
  messageBannerText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  rosterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  characterCard: {
    flexBasis: 320,
    flexGrow: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  characterCardPhone: {
    flexBasis: "100%",
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  characterCardActive: {
    borderColor: "rgba(251, 191, 36, 0.42)",
    backgroundColor: "rgba(27, 39, 64, 0.92)",
  },
  characterBody: {
    flex: 1,
    gap: 6,
  },
  characterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  characterName: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fbbf24",
  },
  activeBadgeLabel: {
    color: "#3f2200",
    fontSize: 12,
    fontWeight: "900",
  },
  characterMeta: {
    color: "#cbd5e1",
  },
  characterStats: {
    color: "#fbbf24",
    fontWeight: "700",
  },
  characterBio: {
    color: "#94a3b8",
    lineHeight: 20,
  },
  characterCta: {
    color: "#e2e8f0",
    fontWeight: "800",
    marginTop: 4,
  },
});
