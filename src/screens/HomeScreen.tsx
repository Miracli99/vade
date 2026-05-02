import { useState } from "react";
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { AssetVisual } from "../components/character-sheet/AssetVisual";
import { Character } from "../types/game";

const APP_LOGO = require("../../assets/vade-retro-logo.png");
const CHARACTER_BIO_PREVIEW_MAX_LENGTH = 220;

type HomeScreenProps = {
  characters: Character[];
  message?: string | null;
  syncEnabled: boolean;
  syncBusy: boolean;
  refreshBusy: boolean;
  onCreateCharacter: () => void;
  onImportCharacters: () => void;
  onExportCharacter: (characterId: string) => void;
  onEnableSync: () => void;
  onDisableSync: () => void;
  onRefreshSync: () => void;
  onOpenCharacter: (characterId: string) => void;
  onOpenHistory: () => void;
};

export function HomeScreen({
  characters,
  message,
  syncEnabled,
  syncBusy,
  refreshBusy,
  onCreateCharacter,
  onImportCharacters,
  onExportCharacter,
  onEnableSync,
  onDisableSync,
  onRefreshSync,
  onOpenCharacter,
  onOpenHistory,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 760;
  const isNarrowPhone = width < 430;
  const isAndroid = Platform.OS === "android";
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const [syncSettingsOpen, setSyncSettingsOpen] = useState(false);

  function getCharacterBioPreview(bio?: string) {
    const normalizedBio = bio?.replace(/\s+/g, " ").trim();

    if (!normalizedBio) {
      return "Aucune bio renseignee.";
    }

    if (normalizedBio.length <= CHARACTER_BIO_PREVIEW_MAX_LENGTH) {
      return normalizedBio;
    }

    return `${normalizedBio.slice(0, CHARACTER_BIO_PREVIEW_MAX_LENGTH).trimEnd()}...`;
  }

  return (
    <View style={styles.root}>
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
              Ouvre une fiche personnage ou l&apos;histoire de l&apos;univers.
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
            <Text style={styles.sectionSubtitle}>Ouverture directe des fiches et export manuel d&apos;un personnage</Text>
          </View>
          <View style={styles.rosterActions}>
            <Pressable onPress={onCreateCharacter} style={styles.primaryActionButton}>
              <Text style={styles.primaryActionLabel}>Nouveau</Text>
            </Pressable>
            <Pressable onPress={onImportCharacters} style={styles.secondaryActionButton}>
              <Text style={styles.secondaryActionLabel}>Importer</Text>
            </Pressable>
            <Pressable onPress={() => setExportPickerOpen(true)} style={styles.secondaryActionButton}>
              <Text style={styles.secondaryActionLabel}>Exporter</Text>
            </Pressable>
            {isAndroid ? (
              <Pressable
                onPress={() => setSyncSettingsOpen(true)}
                style={styles.iconActionButton}
                accessibilityRole="button"
                accessibilityLabel="Parametres de sync Android"
              >
                <Text style={styles.iconActionLabel}>⚙</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.rosterGrid}>
        {characters.map((character) => {
          return (
            <Pressable
              key={character.id}
              onPress={() => onOpenCharacter(character.id)}
              style={[styles.characterCard, isPhone ? styles.characterCardPhone : null]}
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
                  <Text style={styles.characterName} numberOfLines={isNarrowPhone ? 2 : 1}>
                    {character.name}
                  </Text>
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
                  {getCharacterBioPreview(character.bio)}
                </Text>
                <Text style={styles.characterCta}>Ouvrir la fiche</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={exportPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setExportPickerOpen(false)}
      >
        <View style={styles.exportPickerBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setExportPickerOpen(false)} />
          <View style={styles.exportPickerCard}>
            <Text style={styles.exportPickerTitle}>Exporter un personnage</Text>
            <View style={styles.exportPickerList}>
              {characters.map((character) => {
                return (
                  <Pressable
                    key={character.id}
                    onPress={() => {
                      onExportCharacter(character.id);
                      setExportPickerOpen(false);
                    }}
                    style={styles.exportOption}
                  >
                    <View style={styles.exportOptionBody}>
                      <Text style={styles.exportOptionName}>{character.name}</Text>
                      <Text style={styles.exportOptionMeta}>
                        {character.archetype}
                        {character.specialization ? ` · ${character.specialization}` : ""}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => setExportPickerOpen(false)} style={styles.exportPickerCloseButton}>
              <Text style={styles.exportPickerCloseButtonLabel}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={syncSettingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSyncSettingsOpen(false)}
      >
        <View style={styles.exportPickerBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSyncSettingsOpen(false)} />
          <View style={styles.syncDialogCard}>
            <View style={styles.syncDialogHeader}>
              <Text style={styles.exportPickerTitle}>Sync Android</Text>
              <Text style={[styles.syncStatus, syncEnabled ? styles.syncStatusActive : null]}>
                {syncEnabled ? "Active" : "Inactive"}
              </Text>
            </View>
            <View style={styles.syncPanelActions}>
              <Pressable
                onPress={onEnableSync}
                style={[styles.secondaryActionButton, syncEnabled ? styles.syncActionButtonActive : null]}
              >
                <Text style={styles.secondaryActionLabel}>
                  {syncBusy ? "Sync..." : syncEnabled ? "Changer dossier" : "Activer"}
                </Text>
              </Pressable>
              <Pressable
                onPress={onRefreshSync}
                style={styles.secondaryActionButton}
                disabled={!syncEnabled || refreshBusy || syncBusy}
              >
                <Text style={[styles.secondaryActionLabel, !syncEnabled || refreshBusy || syncBusy ? styles.actionLabelMuted : null]}>
                  {refreshBusy ? "Refresh..." : "Refresh"}
                </Text>
              </Pressable>
              {syncEnabled ? (
                <Pressable onPress={onDisableSync} style={styles.secondaryActionButton}>
                  <Text style={styles.secondaryActionLabel}>Desactiver</Text>
                </Pressable>
              ) : null}
            </View>
            <Pressable onPress={() => setSyncSettingsOpen(false)} style={styles.exportPickerCloseButton}>
              <Text style={styles.exportPickerCloseButtonLabel}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
    {message ? (
      <View pointerEvents="none" style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#090d16",
  },
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
    gap: 12,
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
  syncPanelActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  syncActionButtonActive: {
    borderColor: "rgba(34, 197, 94, 0.28)",
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
  iconActionButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  iconActionLabel: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "900",
  },
  actionLabelMuted: {
    opacity: 0.55,
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
  exportPickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.76)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  exportPickerCard: {
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#101827",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
  },
  exportPickerTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  exportPickerList: {
    gap: 10,
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#172033",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
  },
  exportOptionBody: {
    flex: 1,
    gap: 4,
  },
  exportOptionName: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  exportOptionMeta: {
    color: "#94a3b8",
    lineHeight: 18,
  },
  exportPickerCloseButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#172033",
  },
  exportPickerCloseButtonLabel: {
    color: "#cbd5e1",
    fontWeight: "800",
  },
  syncDialogCard: {
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    gap: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#101827",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.24)",
  },
  syncDialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  syncStatus: {
    color: "#cbd5e1",
    fontWeight: "900",
  },
  syncStatusActive: {
    color: "#86efac",
  },
  toast: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(16, 24, 40, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.32)",
    zIndex: 20,
  },
  toastText: {
    color: "#f8fafc",
    fontWeight: "800",
    textAlign: "center",
  },
});
