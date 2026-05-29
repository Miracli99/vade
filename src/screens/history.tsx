import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { modernColors, modernRadii } from "../components/ui/design";
import { HistoryContentBlock, HistoryPage, historyPages } from "../data/historyContent";
import { getResponsiveFlags } from "../utils/responsive";
import { HistoryBlock as HistoryContentBlockView } from "./history/chronique";
import { AppNavbar } from "./navbar";

export type HistoryScreenProps = {
  onOpenHome: () => void;
  onOpenCharacter?: () => void;
};

export function HistoryScreen({ onOpenHome, onOpenCharacter }: HistoryScreenProps) {
  const { width } = useWindowDimensions();
  const { isPhone } = getResponsiveFlags(width);
  const [activePageId, setActivePageId] = useState<HistoryPage["id"]>("lore");

  const activePage = useMemo<HistoryPage>(() => {
    const matchedPage = historyPages.find((page) => page.id === activePageId);
    return matchedPage ?? historyPages[0]!;
  }, [activePageId]);

  return (
    <View style={styles.root}>
      <View testID="history-shell" style={styles.shell}>
        <View style={styles.mainPane}>
          <View style={[styles.historyNavbarWrap, isPhone ? styles.historyNavbarWrapPhone : null]}>
            <AppNavbar
              activeRoute="history"
              compact={isPhone}
              titleColor={modernColors.text}
              subtitleColor={modernColors.muted}
              panelColor={modernColors.panel}
              borderColor={modernColors.border}
              accentColor={modernColors.accent}
              onOpenHome={onOpenHome}
              onOpenHistory={() => undefined}
              onOpenCharacter={onOpenCharacter}
            />
          </View>
          <ScrollView
            horizontal
            style={styles.historyPicker}
            contentContainerStyle={[
              styles.historyPickerContent,
              isPhone ? styles.historyPickerContentPhone : null,
            ]}
            showsHorizontalScrollIndicator={false}
          >
            {historyPages.map((page) => {
              const active = page.id === activePage.id;

              return (
                <Pressable
                  key={page.id}
                  onPress={() => setActivePageId(page.id)}
                  style={[styles.historyTab, active ? styles.historyTabActive : null]}
                  accessibilityRole="button"
                  accessibilityLabel={`Afficher ${page.title}`}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.historyTabLabel, active ? styles.historyTabLabelActive : null]}>
                    {page.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            testID="history-article"
            style={styles.articleScroll}
            contentContainerStyle={[styles.articleContent, isPhone ? styles.articleContentPhone : null]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.heroCard, isPhone ? styles.heroCardPhone : null]}>
              <View style={styles.heroBody}>
                <Text style={styles.heroEyebrow}>{activePage.eyebrow}</Text>
                <Text style={[styles.heroTitle, isPhone ? styles.heroTitlePhone : null]}>{activePage.title}</Text>
                <Text style={styles.heroDescription}>{activePage.description}</Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.heroMetaValue}>{activePage.sections.length}</Text>
                    <Text style={styles.heroMetaLabel}>sections</Text>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.heroMetaValue}>Vade Retro</Text>
                    <Text style={styles.heroMetaLabel}>campagne</Text>
                  </View>
                </View>
              </View>
              {activePage.heroImageModule ? (
                <Image
                  source={activePage.heroImageModule}
                  style={[styles.heroImage, isPhone ? styles.heroImagePhone : null]}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            <View style={styles.sectionList}>
              {activePage.sections.map((section, index) => (
                <View
                  key={section.id}
                  style={[
                    styles.sectionCard,
                    isPhone ? styles.sectionCardPhone : null,
                    section.accent === "gold" ? styles.sectionCardGold : null,
                    section.accent === "violet" ? styles.sectionCardViolet : null,
                    section.accent === "azure" ? styles.sectionCardAzure : null,
                    section.accent === "crimson" ? styles.sectionCardCrimson : null,
                    section.accent === "emerald" ? styles.sectionCardEmerald : null,
                  ]}
                >
                  <View style={styles.sectionHeadingRow}>
                    <Text style={styles.sectionIndex}>{String(index + 1).padStart(2, "0")}</Text>
                    <Text
                      style={[
                        styles.sectionTitle,
                        isPhone ? styles.sectionTitlePhone : null,
                        section.accent === "gold" ? styles.sectionTitleGold : null,
                        section.accent === "violet" ? styles.sectionTitleViolet : null,
                        section.accent === "azure" ? styles.sectionTitleAzure : null,
                        section.accent === "crimson" ? styles.sectionTitleCrimson : null,
                        section.accent === "emerald" ? styles.sectionTitleEmerald : null,
                      ]}
                    >
                      {section.title}
                    </Text>
                  </View>
                  <View style={styles.contentList}>
                    {section.content.map((block, blockIndex) => (
                      <HistoryContentBlockView key={`${section.id}-${blockIndex}`} block={block} isPhone={isPhone} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function HistoryBlock({ block, isPhone }: { block: HistoryContentBlock; isPhone: boolean }) {
  if (block.type === "paragraph") {
    return <Text style={styles.paragraph}>{block.text}</Text>;
  }

  if (block.type === "quote") {
    return <Text style={styles.quote}>“{block.text}”</Text>;
  }

  if (block.type === "entry") {
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{block.title}</Text>
          {block.subtitle ? <Text style={styles.entrySubtitle}>{block.subtitle}</Text> : null}
        </View>
        <Text style={styles.paragraph}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === "classEntry") {
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{block.title}</Text>
          {block.subtitle ? <Text style={styles.entrySubtitle}>{block.subtitle}</Text> : null}
        </View>
        <Text style={styles.paragraph}>{block.text}</Text>
        <View style={[styles.subclassGrid, isPhone ? styles.subclassGridPhone : null]}>
          {block.subclasses.map((subclass) => (
            <View
              key={`${block.title}-${subclass.name}`}
              style={[
                styles.subclassCard,
                subclass.accent === "gold" ? styles.subclassCardGold : null,
                subclass.accent === "crimson" ? styles.subclassCardCrimson : null,
                subclass.accent === "azure" ? styles.subclassCardAzure : null,
                subclass.accent === "emerald" ? styles.subclassCardEmerald : null,
                subclass.accent === "violet" ? styles.subclassCardViolet : null,
              ]}
            >
              <Text
                style={[
                  styles.subclassName,
                  subclass.accent === "gold" ? styles.subclassNameGold : null,
                  subclass.accent === "crimson" ? styles.subclassNameCrimson : null,
                  subclass.accent === "azure" ? styles.subclassNameAzure : null,
                  subclass.accent === "emerald" ? styles.subclassNameEmerald : null,
                  subclass.accent === "violet" ? styles.subclassNameViolet : null,
                ]}
              >
                {subclass.name}
              </Text>
              <Text style={styles.subclassText}>{subclass.text}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (block.type === "imageText") {
    if (!block.imageModule && !block.imageUrl) {
      return null;
    }

    return (
      <View style={[styles.imageTextBlock, isPhone ? styles.imageTextBlockPhone : null]}>
        <Image
          source={block.imageModule ? block.imageModule : { uri: block.imageUrl }}
          style={[styles.imageTextImage, isPhone ? styles.imageTextImagePhone : null]}
          resizeMode="contain"
        />
        <View style={styles.imageTextBody}>
          {block.title ? <Text style={styles.imageTextTitle}>{block.title}</Text> : null}
          <Text style={styles.paragraph}>{block.text}</Text>
          {block.caption ? <Text style={styles.imageCaption}>{block.caption}</Text> : null}
        </View>
      </View>
    );
  }

  if (!block.imageModule && !block.imageUrl) {
    return null;
  }

  return (
    <View style={styles.imageBlock}>
      <Image
        source={block.imageModule ? block.imageModule : { uri: block.imageUrl }}
        style={[
          styles.image,
          block.compact ? styles.imageCompact : null,
          isPhone ? styles.imagePhone : null,
          isPhone && block.compact ? styles.imageCompactPhone : null,
        ]}
        resizeMode="contain"
      />
      {block.caption ? <Text style={styles.imageCaption}>{block.caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: modernColors.page,
  },
  shell: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: modernColors.shell,
    overflow: "visible",
  },
  sideRail: {
    width: 300,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: modernColors.border,
    backgroundColor: "#070f17",
  },
  sideRailCollapsed: {
    width: 76,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  railBackButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  railBackButtonCollapsed: {
    width: 48,
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  railBackIcon: {
    color: modernColors.accent,
    fontSize: 18,
    fontWeight: "900",
  },
  railBackLabel: {
    color: modernColors.text,
    fontWeight: "900",
  },
  railHeader: {
    gap: 4,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: modernColors.border,
  },
  railHeaderCollapsed: {
    alignItems: "center",
  },
  railKicker: {
    color: modernColors.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  railTitle: {
    color: modernColors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  railTitleCollapsed: {
    width: 48,
    height: 48,
    borderRadius: modernRadii.md,
    color: modernColors.accent,
    backgroundColor: modernColors.accentSoft,
    borderWidth: 1,
    borderColor: modernColors.borderStrong,
    textAlign: "center",
    lineHeight: 46,
    fontSize: 20,
    fontWeight: "900",
  },
  railNav: {
    flex: 1,
    gap: 8,
    paddingVertical: 18,
    alignSelf: "stretch",
  },
  railNavItem: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: modernRadii.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  railNavItemCollapsed: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    alignSelf: "center",
  },
  railNavItemActive: {
    backgroundColor: modernColors.accentSoft,
    borderColor: modernColors.borderStrong,
  },
  railNavIndex: {
    color: modernColors.faint,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 20,
  },
  railNavIndexActive: {
    color: modernColors.accent,
  },
  railNavText: {
    flex: 1,
    gap: 4,
  },
  railNavTitle: {
    color: modernColors.textSoft,
    fontSize: 15,
    fontWeight: "900",
  },
  railNavTitleActive: {
    color: modernColors.text,
  },
  railNavDescription: {
    color: modernColors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  railFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    padding: 12,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  railFooterCollapsed: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  railFooterValue: {
    color: modernColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  railFooterLabel: {
    color: modernColors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  mainPane: {
    flex: 1,
    minWidth: 0,
    backgroundColor: modernColors.shell,
  },
  historyNavbarWrap: {
    position: "relative",
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    zIndex: 10000,
    elevation: 100,
  },
  historyNavbarWrapPhone: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  historyPicker: {
    position: "relative",
    flexGrow: 0,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: modernColors.border,
    zIndex: 1,
    elevation: 1,
  },
  historyPickerContent: {
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  historyPickerContentPhone: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  historyTab: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: modernRadii.sm,
    backgroundColor: modernColors.panel,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  historyTabActive: {
    backgroundColor: modernColors.accentSoft,
    borderColor: modernColors.borderStrong,
  },
  historyTabLabel: {
    color: modernColors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  historyTabLabelActive: {
    color: modernColors.accent,
  },
  articleScroll: {
    position: "relative",
    flex: 1,
    zIndex: 0,
    elevation: 0,
  },
  articleContent: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    gap: 18,
    padding: 24,
    paddingBottom: 42,
  },
  articleContentPhone: {
    padding: 14,
    paddingBottom: 28,
  },
  heroCard: {
    minHeight: 300,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: modernRadii.lg,
    backgroundColor: modernColors.panelGlass,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  heroCardPhone: {
    minHeight: 0,
    flexDirection: "column-reverse",
  },
  heroBody: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    padding: 26,
  },
  heroEyebrow: {
    color: modernColors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: modernColors.text,
    fontSize: 36,
    fontWeight: "900",
  },
  heroTitlePhone: {
    fontSize: 26,
  },
  heroDescription: {
    color: modernColors.textSoft,
    lineHeight: 24,
    maxWidth: 650,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  heroMetaItem: {
    minWidth: 112,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: modernRadii.md,
    backgroundColor: modernColors.panelElevated,
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  heroMetaValue: {
    color: modernColors.text,
    fontWeight: "900",
  },
  heroMetaLabel: {
    color: modernColors.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroImage: {
    width: 360,
    height: 300,
    backgroundColor: "transparent",
  },
  heroImagePhone: {
    width: "100%",
    height: 190,
    minHeight: 0,
  },
  sectionList: {
    gap: 14,
  },
  sectionCard: {
    gap: 14,
    padding: 20,
    borderRadius: modernRadii.lg,
    backgroundColor: "rgba(5, 8, 13, 0.32)",
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  sectionCardGold: {
    borderColor: modernColors.borderStrong,
    backgroundColor: modernColors.panelSoft,
  },
  sectionCardViolet: {
    borderColor: "rgba(168, 85, 247, 0.24)",
    backgroundColor: modernColors.panelSoft,
  },
  sectionCardAzure: {
    borderColor: "rgba(93, 157, 255, 0.28)",
    backgroundColor: modernColors.panelSoft,
  },
  sectionCardCrimson: {
    borderColor: "rgba(217, 93, 86, 0.28)",
    backgroundColor: modernColors.panelSoft,
  },
  sectionCardEmerald: {
    borderColor: "rgba(98, 184, 123, 0.28)",
    backgroundColor: modernColors.panelSoft,
  },
  sectionCardPhone: {
    padding: 16,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  sectionIndex: {
    color: modernColors.accent,
    fontSize: 12,
    fontWeight: "900",
  },
  sectionTitle: {
    color: modernColors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  sectionTitleGold: {
    color: modernColors.accent,
  },
  sectionTitleViolet: {
    color: "#d8b4fe",
  },
  sectionTitleAzure: {
    color: modernColors.azure,
  },
  sectionTitleCrimson: {
    color: modernColors.crimson,
  },
  sectionTitleEmerald: {
    color: modernColors.emerald,
  },
  sectionTitlePhone: {
    fontSize: 18,
  },
  quote: {
    color: modernColors.accent,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  contentList: {
    gap: 10,
  },
  paragraph: {
    color: modernColors.textSoft,
    lineHeight: 25,
    fontSize: 15,
  },
  imageBlock: {
    gap: 8,
  },
  entryCard: {
    gap: 8,
    padding: 16,
    borderRadius: modernRadii.md,
    backgroundColor: "rgba(5, 8, 13, 0.38)",
    borderWidth: 1,
    borderColor: modernColors.border,
  },
  entryHeader: {
    gap: 4,
  },
  entryTitle: {
    color: modernColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  entrySubtitle: {
    color: modernColors.accent,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  subclassGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  subclassGridPhone: {
    flexDirection: "column",
  },
  subclassCard: {
    flexBasis: 250,
    flexGrow: 1,
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
  },
  subclassCardGold: {
    backgroundColor: "rgba(64, 45, 9, 0.72)",
    borderColor: "rgba(251, 191, 36, 0.34)",
  },
  subclassCardCrimson: {
    backgroundColor: "rgba(63, 18, 24, 0.72)",
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  subclassCardAzure: {
    backgroundColor: "rgba(16, 42, 67, 0.72)",
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  subclassCardEmerald: {
    backgroundColor: "rgba(13, 47, 38, 0.72)",
    borderColor: "rgba(74, 222, 128, 0.28)",
  },
  subclassCardViolet: {
    backgroundColor: "rgba(43, 22, 66, 0.72)",
    borderColor: "rgba(196, 181, 253, 0.28)",
  },
  subclassName: {
    fontSize: 16,
    fontWeight: "900",
  },
  subclassNameGold: {
    color: "#fde68a",
  },
  subclassNameCrimson: {
    color: "#fca5a5",
  },
  subclassNameAzure: {
    color: "#93c5fd",
  },
  subclassNameEmerald: {
    color: "#86efac",
  },
  subclassNameViolet: {
    color: "#d8b4fe",
  },
  subclassText: {
    color: "#d6deea",
    lineHeight: 20,
    fontSize: 14,
  },
  imageTextBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(10, 15, 26, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  imageTextBlockPhone: {
    flexDirection: "column",
  },
  imageTextImage: {
    width: 240,
    height: 300,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  imageTextImagePhone: {
    width: "100%",
    height: 260,
  },
  imageTextBody: {
    flex: 1,
    gap: 8,
  },
  imageTextTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  image: {
    width: "100%",
    maxWidth: 520,
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: "transparent",
    alignSelf: "center",
  },
  imageCompact: {
    width: 240,
    minHeight: 0,
    height: 320,
    alignSelf: "flex-start",
  },
  imagePhone: {
    minHeight: 180,
  },
  imageCompactPhone: {
    width: 170,
    height: 220,
  },
  imageCaption: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
  },
});
