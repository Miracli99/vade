import { PropsWithChildren, ReactNode } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

type SectionProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  theme?: {
    sectionBg: string;
    sectionBorder: string;
    title: string;
    subtitle: string;
    cardBackgroundImage?: ImageSourcePropType;
  };
}>;

export function Section({ title, subtitle, rightSlot, children, theme }: SectionProps) {
  const hasCardBackground = Boolean(theme?.cardBackgroundImage);
  const content = (
    <>
      {hasCardBackground ? <View style={styles.textureOverlay} /> : null}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, theme ? { color: theme.title } : null]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, theme ? { color: theme.subtitle } : null]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot}
      </View>
      <View style={styles.content}>{children}</View>
    </>
  );

  const sectionStyle = [
    styles.section,
    theme ? { backgroundColor: theme.sectionBg, borderColor: theme.sectionBorder } : null,
  ];

  if (theme?.cardBackgroundImage) {
    if (Platform.OS === "web") {
      const source = resolveAssetSource(theme.cardBackgroundImage);

      return (
        <View
          style={[
            sectionStyle,
            styles.webCardBackground,
            {
              backgroundImage: `url("${source.uri}")`,
            } as object,
          ]}
        >
          {content}
        </View>
      );
    }

    return (
      <ImageBackground
        source={theme.cardBackgroundImage}
        style={sectionStyle}
        imageStyle={styles.cardBackground}
        resizeMode="repeat"
      >
        {content}
      </ImageBackground>
    );
  }

  return <View style={sectionStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  section: {
    position: "relative",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(10, 14, 28, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.14)",
    overflow: "hidden",
  },
  cardBackground: {
    borderRadius: 24,
  },
  webCardBackground: {
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    backgroundPosition: "top left",
  } as object,
  textureOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  header: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#f8fafc",
    fontSize: 19,
    fontWeight: "700",
  },
  subtitle: {
    color: "#a5b4cc",
    fontSize: 13,
  },
  content: {
    position: "relative",
    zIndex: 1,
    gap: 12,
  },
});
