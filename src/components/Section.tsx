import { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type SectionProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  theme?: {
    sectionBg: string;
    sectionBorder: string;
    title: string;
    subtitle: string;
  };
}>;

export function Section({ title, subtitle, rightSlot, children, theme }: SectionProps) {
  return (
    <View
      style={[
        styles.section,
        theme
          ? { backgroundColor: theme.sectionBg, borderColor: theme.sectionBorder }
          : null,
      ]}
    >
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(10, 14, 28, 0.74)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.14)",
  },
  header: {
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
    gap: 12,
  },
});
