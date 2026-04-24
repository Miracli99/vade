import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { HistoryContentBlock, HistoryPage, historyPages } from "../data/historyContent";

type HistoryScreenProps = {
  onOpenHome: () => void;
};

export function HistoryScreen({ onOpenHome }: HistoryScreenProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 760;
  const [activePageId, setActivePageId] = useState<HistoryPage["id"]>("lore");

  const activePage = useMemo<HistoryPage>(() => {
    const matchedPage = historyPages.find((page) => page.id === activePageId);
    return matchedPage ?? historyPages[0]!;
  }, [activePageId]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, isPhone ? styles.contentPhone : styles.contentWide]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, isPhone ? styles.headerPhone : null]}>
        <Pressable onPress={onOpenHome} style={styles.backButton}>
          <Text style={styles.backButtonLabel}>← Accueil</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Codex</Text>
        <Text style={[styles.title, isPhone ? styles.titlePhone : null]}>Bibliotheque de campagne</Text>
        <Text style={styles.description}>
          Le manuel sert de base, mais l&apos;app expose maintenant trois lectures separees: lore,
          personnages et prise en main.
        </Text>
      </View>

      <View style={[styles.pagePicker, isPhone ? styles.pagePickerPhone : null]}>
        {historyPages.map((page) => {
          const active = page.id === activePage.id;

          return (
            <Pressable
              key={page.id}
              onPress={() => setActivePageId(page.id)}
              style={[styles.pageCard, active ? styles.pageCardActive : null]}
            >
              <Text style={[styles.pageCardEyebrow, active ? styles.pageCardEyebrowActive : null]}>
                {page.eyebrow}
              </Text>
              <Text style={[styles.pageCardTitle, active ? styles.pageCardTitleActive : null]}>
                {page.title}
              </Text>
              <Text style={[styles.pageCardDescription, active ? styles.pageCardDescriptionActive : null]}>
                {page.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.heroCard, isPhone ? styles.heroCardPhone : null]}>
        {activePage.heroImageModule ? (
          <Image
            source={activePage.heroImageModule}
            style={[styles.heroImage, isPhone ? styles.heroImagePhone : null]}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.heroBody}>
          <Text style={styles.heroEyebrow}>{activePage.eyebrow}</Text>
          <Text style={[styles.heroTitle, isPhone ? styles.heroTitlePhone : null]}>{activePage.title}</Text>
          <Text style={styles.heroDescription}>{activePage.description}</Text>
        </View>
      </View>

      <View style={styles.sectionList}>
        {activePage.sections.map((section) => (
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
            <View style={styles.contentList}>
              {section.content.map((block, index) => (
                <HistoryBlock key={`${section.id}-${index}`} block={block} isPhone={isPhone} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
    maxWidth: 1180,
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
  headerPhone: {
    padding: 18,
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
  titlePhone: {
    fontSize: 24,
  },
  description: {
    color: "#fed7aa",
    lineHeight: 22,
  },
  pagePicker: {
    flexDirection: "row",
    gap: 14,
  },
  pagePickerPhone: {
    flexDirection: "column",
  },
  pageCard: {
    flex: 1,
    gap: 6,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  pageCardActive: {
    backgroundColor: "rgba(61, 32, 7, 0.92)",
    borderColor: "rgba(251, 191, 36, 0.34)",
  },
  pageCardEyebrow: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pageCardEyebrowActive: {
    color: "#fbbf24",
  },
  pageCardTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  pageCardTitleActive: {
    color: "#fff7ed",
  },
  pageCardDescription: {
    color: "#94a3b8",
    lineHeight: 20,
  },
  pageCardDescriptionActive: {
    color: "#fed7aa",
  },
  heroCard: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "rgba(12, 17, 28, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  heroCardPhone: {
    borderRadius: 24,
  },
  heroImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#111827",
  },
  heroImagePhone: {
    height: 180,
  },
  heroBody: {
    gap: 8,
    padding: 22,
  },
  heroEyebrow: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#fff7ed",
    fontSize: 28,
    fontWeight: "900",
  },
  heroTitlePhone: {
    fontSize: 22,
  },
  heroDescription: {
    color: "#cbd5e1",
    lineHeight: 22,
    maxWidth: 760,
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
  sectionCardGold: {
    borderColor: "rgba(251, 191, 36, 0.22)",
    backgroundColor: "rgba(33, 24, 14, 0.92)",
  },
  sectionCardViolet: {
    borderColor: "rgba(196, 181, 253, 0.22)",
    backgroundColor: "rgba(22, 15, 38, 0.92)",
  },
  sectionCardAzure: {
    borderColor: "rgba(96, 165, 250, 0.2)",
    backgroundColor: "rgba(14, 24, 42, 0.92)",
  },
  sectionCardCrimson: {
    borderColor: "rgba(248, 113, 113, 0.18)",
    backgroundColor: "rgba(38, 15, 20, 0.92)",
  },
  sectionCardEmerald: {
    borderColor: "rgba(74, 222, 128, 0.18)",
    backgroundColor: "rgba(13, 28, 24, 0.92)",
  },
  sectionCardPhone: {
    padding: 16,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  sectionTitleGold: {
    color: "#fde68a",
  },
  sectionTitleViolet: {
    color: "#d8b4fe",
  },
  sectionTitleAzure: {
    color: "#93c5fd",
  },
  sectionTitleCrimson: {
    color: "#fca5a5",
  },
  sectionTitleEmerald: {
    color: "#86efac",
  },
  sectionTitlePhone: {
    fontSize: 18,
  },
  quote: {
    color: "#fbbf24",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
  },
  contentList: {
    gap: 10,
  },
  paragraph: {
    color: "#cbd5e1",
    lineHeight: 24,
    fontSize: 15,
  },
  imageBlock: {
    gap: 8,
  },
  entryCard: {
    gap: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(10, 15, 26, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  entryHeader: {
    gap: 4,
  },
  entryTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  entrySubtitle: {
    color: "#fbbf24",
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
    backgroundColor: "rgba(15, 23, 42, 0.8)",
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
    backgroundColor: "rgba(15, 23, 42, 0.8)",
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
