import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { AssetVisual } from "../components/character-sheet/AssetVisual";
import { modernColors, modernRadii } from "../components/ui/design";
import { Character } from "../types/game";
import { getResponsiveFlags } from "../utils/responsive";
import { AppNavbar } from "./navbar";

const CHARACTER_BIO_PREVIEW_MAX_LENGTH = 220;

export type HomeScreenProps = {
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
  onOpenCharacters?: () => void;
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
  onOpenCharacters,
  onOpenHistory,
}: HomeScreenProps) {
  const { width, height } = useWindowDimensions();
  const { isPhone, isNarrowPhone } = getResponsiveFlags(width);
  const availableContentHeight = Math.max(height - (isPhone ? 75 : 90), 0);
  const horizontalPadding = 0;
  const verticalPadding = 0;
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
    <AppNavbar
      activeRoute="home"
      compact={isPhone}
      titleColor={modernColors.text}
      subtitleColor={modernColors.muted}
      panelColor={modernColors.panel}
      borderColor={modernColors.border}
      accentColor={modernColors.accent}
      onOpenHome={() => undefined}
      onOpenHistory={onOpenHistory}
      onOpenCharacter={onOpenCharacters}
    />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          minHeight: availableContentHeight,
          paddingHorizontal: horizontalPadding,
          paddingTop: 16,
          paddingBottom: verticalPadding,
        },
        isPhone ? styles.contentPhone : styles.contentWide,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        testID="home-shell"
        style={[
          styles.shell,
          { minHeight: Math.max(availableContentHeight - verticalPadding * 2, 0) },
          isPhone ? styles.shellPhone : null,
        ]}
      >
        <View style={[styles.mainPanel, isPhone ? styles.mainPanelNoSidebar : null]}>
          <Pressable
            onPress={onOpenHistory}
            style={styles.historyButton}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir la page histoire"
          >
            <View style={styles.historyButtonText}>
              <Text style={styles.historyButtonTitle}>Histoire</Text>
              <Text style={styles.historyButtonSubtitle}>
                Ouvrir le codex et le contexte de campagne
              </Text>
            </View>
            <Text style={styles.historyButtonArrow}>›</Text>
          </Pressable>

          <View style={styles.actionPanel}>
            <Text style={styles.panelTitle}>Actions</Text>
            <View style={[styles.primaryActions, isPhone ? styles.primaryActionsPhone : null]}>
              <Pressable
                onPress={onCreateCharacter}
                style={styles.primaryActionButton}
                accessibilityRole="button"
                accessibilityLabel="Creer un nouveau personnage"
              >
                <Text style={styles.primaryActionLabel}>Nouveau</Text>
              </Pressable>
              <Pressable
                onPress={onImportCharacters}
                style={styles.secondaryActionButton}
                accessibilityRole="button"
                accessibilityLabel="Importer des personnages"
              >
                <Text style={styles.secondaryActionLabel}>Importer</Text>
              </Pressable>
              <Pressable
                onPress={() => setExportPickerOpen(true)}
                style={styles.secondaryActionButton}
                accessibilityRole="button"
                accessibilityLabel="Exporter un personnage"
              >
                <Text style={styles.secondaryActionLabel}>Exporter</Text>
              </Pressable>
              {isAndroid ? (
                <Pressable
                  onPress={() => setSyncSettingsOpen(true)}
                  style={[
                    styles.iconActionButton,
                    syncEnabled ? styles.iconActionButtonSynced : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Parametres de sync Android"
                >
                  <Text
                    style={[
                      styles.iconActionLabel,
                      syncEnabled ? styles.iconActionLabelSynced : null,
                    ]}
                  >
                    ⚙
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={[styles.sectionHeaderTop, isPhone ? styles.sectionHeaderTopPhone : null]}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Personnages</Text>
                <Text style={styles.sectionSubtitle}>
                  Selectionne une fiche pour jouer, modifier les ressources ou consulter les dons.
                </Text>
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
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir la fiche de ${character.name}`}
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
                    <Text style={styles.characterArrow}>›</Text>
                  </View>
                  <Text style={styles.characterMeta}>
                    {character.archetype}
                    {character.specialization ? ` · ${character.specialization}` : ""}
                  </Text>
                  <View style={styles.characterStatsRow}>
                    <Text style={styles.characterStatsCrimson}>PV {character.pv.current}/{character.pv.max}</Text>
                    <Text style={styles.characterStatsAzure}>PSY {character.psy.current}/{character.psy.max}</Text>
                    <Text style={styles.characterStatsEmerald}>Armure {character.armor.current}/{character.armor.max}</Text>
                  </View>
                  <Text style={styles.characterBio} numberOfLines={3}>
                    {getCharacterBioPreview(character.bio)}
                  </Text>
                  <Text style={styles.characterCta}>Niveau {character.level ?? 0} · {character.spells.length} dons · {character.equipment.length} equipements</Text>
                </View>
              </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <Modal
        visible={exportPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setExportPickerOpen(false)}
      >
        <View style={styles.exportPickerBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setExportPickerOpen(false)} />
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
                    accessibilityRole="button"
                    accessibilityLabel={`Exporter ${character.name}`}
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
            <Pressable
              onPress={() => setExportPickerOpen(false)}
              style={styles.exportPickerCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Fermer la selection d'export"
            >
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
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSyncSettingsOpen(false)} />
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
                accessibilityRole="button"
                accessibilityLabel={syncEnabled ? "Changer le dossier de sync Android" : "Activer la sync Android"}
              >
                <Text style={styles.secondaryActionLabel}>
                  {syncBusy ? "Sync..." : syncEnabled ? "Changer dossier" : "Activer"}
                </Text>
              </Pressable>
              <Pressable
                onPress={onRefreshSync}
                style={styles.secondaryActionButton}
                disabled={!syncEnabled || refreshBusy || syncBusy}
                accessibilityRole="button"
                accessibilityLabel="Rafraichir depuis le dossier de sync Android"
              >
                <Text style={[styles.secondaryActionLabel, !syncEnabled || refreshBusy || syncBusy ? styles.actionLabelMuted : null]}>
                  {refreshBusy ? "Refresh..." : "Refresh"}
                </Text>
              </Pressable>
              {syncEnabled ? (
                <Pressable
                  onPress={onDisableSync}
                  style={styles.secondaryActionButton}
                  accessibilityRole="button"
                  accessibilityLabel="Desactiver la sync Android"
                >
                  <Text style={styles.secondaryActionLabel}>Desactiver</Text>
                </Pressable>
              ) : null}
            </View>
            <Pressable
              onPress={() => setSyncSettingsOpen(false)}
              style={styles.exportPickerCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Fermer les parametres de sync Android"
            >
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
    backgroundColor: modernColors.page,
  },
  scroll: {
    flex: 1,
    backgroundColor: modernColors.page,
  },
  content: {
    flexGrow: 1,
    width: "100%",
  },
  contentPhone: {},
  contentWide: {
    width: "100%",
    alignSelf: "center",
  },
  shell: {
    flex: 1,
    flexDirection: "row",
    overflow: "visible",
    borderRadius: 0,
    backgroundColor: modernColors.shell,
    borderWidth: 0,
    borderColor: modernColors.border,
  },
  shellPhone: {
    flexDirection: "column",
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  sideRail: {
    width: 220,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: modernColors.border,
    backgroundColor: "#070f17",
  },
  sideRailCollapsed: {
    width: 76,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  sideBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: modernColors.border,
  },
  sideBrandCollapsed: {
    justifyContent: "center",
    paddingBottom: 14,
  },
  sideLogo: {
    width: 44,
    height: 44,
  },
  sideBrandTitle: {
    color: modernColors.accent,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sideBrandSubtitle: {
    color: modernColors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sideNav: {
    gap: 6,
    paddingVertical: 18,
    alignSelf: "stretch",
  },
  sideNavItem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: modernRadii.md,
  },
  sideNavItemCollapsed: {
    width: 48,
    justifyContent: "center",
    paddingHorizontal: 0,
    alignSelf: "center",
  },
  sideNavItemActive: {
    backgroundColor: modernColors.accentSoft,
    borderWidth: 1,
    borderColor: modernColors.borderStrong,
  },
  sideNavIcon: {
    width: 18,
    color: modernColors.accent,
    textAlign: "center",
  },
  sideNavLabel: {
    color: modernColors.muted,
    fontWeight: "700",
  },
  sideNavLabelActive: {
    color: modernColors.text,
    fontWeight: "900",
  },
  sideFooter: {
    marginTop: "auto",
    padding: 12,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  sideFooterCollapsed: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  sideFooterTitle: {
    color: modernColors.text,
    fontWeight: "900",
    textAlign: "center",
  },
  sideFooterText: {
    color: modernColors.muted,
    marginTop: 2,
    fontSize: 12,
  },
  mainPanel: {
    flex: 1,
    width: "100%",
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
    minWidth: 0,
  },
  mainPanelNoSidebar: {
    paddingHorizontal: 14,
    paddingTop: 0,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  historyButtonText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  historyButtonTitle: {
    color: modernColors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  historyButtonSubtitle: {
    color: modernColors.muted,
    lineHeight: 19,
  },
  historyButtonArrow: {
    color: modernColors.accent,
    fontSize: 28,
    fontWeight: "900",
  },
  actionPanel: {
    gap: 12,
    padding: 16,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  panelTitle: {
    color: modernColors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  primaryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  primaryActionsPhone: {
    alignItems: "stretch",
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
  sectionHeaderTopPhone: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sectionTitle: {
    color: modernColors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: modernColors.muted,
    flexShrink: 1,
    lineHeight: 20,
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
  rosterActionsPhone: {
    alignSelf: "stretch",
  },
  primaryActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.accent,
  },
  primaryActionLabel: {
    color: modernColors.accentText,
    fontWeight: "900",
  },
  secondaryActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  secondaryActionLabel: {
    color: modernColors.textSoft,
    fontWeight: "800",
  },
  iconActionButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  iconActionButtonSynced: {
    backgroundColor: "rgba(34, 197, 94, 0.14)",
    borderColor: "rgba(34, 197, 94, 0.42)",
  },
  iconActionLabel: {
    color: modernColors.textSoft,
    fontSize: 20,
    fontWeight: "900",
  },
  iconActionLabelSynced: {
    color: modernColors.emerald,
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
    flexBasis: 390,
    flexGrow: 1,
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: modernRadii.lg,
    backgroundColor: modernColors.panelSoft,
    borderWidth: 1,
    borderColor: modernColors.border,
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
    color: modernColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  characterArrow: {
    color: modernColors.accent,
    fontSize: 22,
    lineHeight: 24,
  },
  characterMeta: {
    color: modernColors.textSoft,
  },
  characterStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  characterStatsCrimson: {
    color: modernColors.crimson,
    fontWeight: "800",
    fontSize: 12,
  },
  characterStatsAzure: {
    color: modernColors.azure,
    fontWeight: "800",
    fontSize: 12,
  },
  characterStatsEmerald: {
    color: modernColors.emerald,
    fontWeight: "700",
    fontSize: 12,
  },
  characterBio: {
    color: modernColors.muted,
    lineHeight: 20,
  },
  characterCta: {
    color: modernColors.faint,
    fontWeight: "800",
    fontSize: 12,
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
    borderRadius: modernRadii.lg,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.borderStrong,
  },
  exportPickerTitle: {
    color: modernColors.text,
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
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  exportOptionBody: {
    flex: 1,
    gap: 4,
  },
  exportOptionName: {
    color: modernColors.text,
    fontWeight: "800",
  },
  exportOptionMeta: {
    color: modernColors.muted,
    lineHeight: 18,
  },
  exportPickerCloseButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  exportPickerCloseButtonLabel: {
    color: modernColors.textSoft,
    fontWeight: "800",
  },
  syncDialogCard: {
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    gap: 16,
    padding: 20,
    borderRadius: modernRadii.lg,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: "rgba(98, 184, 123, 0.28)",
  },
  syncDialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  syncStatus: {
    color: modernColors.textSoft,
    fontWeight: "900",
  },
  syncStatusActive: {
    color: modernColors.emerald,
  },
  toast: {
    position: "absolute",
    top: 14,
    left: 16,
    right: 16,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: modernRadii.md,
    backgroundColor: "rgba(12, 22, 32, 0.96)",
    borderWidth: 1,
    borderColor: modernColors.borderStrong,
    zIndex: 20,
  },
  toastText: {
    color: modernColors.text,
    fontWeight: "800",
    textAlign: "center",
  },
});
