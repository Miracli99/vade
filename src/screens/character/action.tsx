import { Pressable, StyleSheet, Text, View } from "react-native";

export { AdjustButton, AttackBonusCard, ResourceMeter } from "../../components/character-sheet/ResourceCards";

type CharacterActionTheme = {
  panelBg: string;
  border: string;
  subtitle: string;
  title: string;
  buttonBg: string;
  buttonText: string;
  chipBg: string;
  accent: string;
};

type CharacterAction = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: "primary" | "secondary";
  value?: string;
  onPress: () => void;
};

type CharacterActionsProps = {
  actions: CharacterAction[];
  columns: number;
  theme: CharacterActionTheme;
};

export function CharacterActions({ actions, columns, theme }: CharacterActionsProps) {
  return (
    <View
      style={[
        styles.quickActionsCard,
        { backgroundColor: theme.panelBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.quickActionsHeader}>
        <View style={styles.quickActionsHeaderText}>
          <Text style={[styles.quickActionsHint, { color: theme.subtitle }]}>
            Actions rapides
          </Text>
          <Text style={[styles.quickActionsTitle, { color: theme.title }]}>
            Raccourcis de tour
          </Text>
        </View>
        <Text style={[styles.quickActionsMeta, { color: theme.subtitle }]}>
          {columns} colonne{columns > 1 ? "s" : ""}
        </Text>
      </View>
      <View style={styles.quickActionsButtons}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            style={[
              styles.quickActionButton,
              columns === 1
                ? styles.quickActionButtonSingle
                : columns === 2
                  ? styles.quickActionButtonDouble
                  : styles.quickActionButtonTriple,
              action.tone === "primary"
                ? { backgroundColor: theme.buttonBg, borderColor: theme.buttonBg }
                : { backgroundColor: theme.chipBg, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.quickActionIconWrap,
                action.tone === "primary"
                  ? {
                      backgroundColor: "rgba(255,255,255,0.16)",
                      borderColor: "rgba(255,255,255,0.2)",
                    }
                  : {
                      backgroundColor: theme.panelBg,
                      borderColor: theme.border,
                    },
              ]}
            >
              <Text
                style={[
                  styles.quickActionIcon,
                  {
                    color:
                      action.tone === "primary" ? theme.buttonText : theme.accent,
                  },
                ]}
              >
                {action.icon}
              </Text>
            </View>
            <View style={styles.quickActionBody}>
              <Text
                style={[
                  styles.quickActionButtonLabel,
                  {
                    color:
                      action.tone === "primary" ? theme.buttonText : theme.title,
                  },
                ]}
              >
                {action.title}
              </Text>
              {action.value ? (
                <Text style={[styles.quickActionValue, { color: theme.title }]}>
                  {action.value}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.quickActionDescription,
                  {
                    color:
                      action.tone === "primary"
                        ? "rgba(255,255,255,0.86)"
                        : theme.subtitle,
                  },
                ]}
              >
                {action.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsCard: {
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  quickActionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  quickActionsHeaderText: {
    flex: 1,
    gap: 4,
  },
  quickActionsHint: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  quickActionsMeta: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quickActionsButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionButton: {
    minWidth: 220,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickActionButtonSingle: {
    width: "100%",
    minWidth: 0,
  },
  quickActionButtonDouble: {
    flexGrow: 1,
    flexBasis: 260,
  },
  quickActionButtonTriple: {
    flexGrow: 1,
    flexBasis: 220,
  },
  quickActionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIcon: {
    fontSize: 16,
    fontWeight: "900",
  },
  quickActionBody: {
    flex: 1,
    gap: 4,
  },
  quickActionButtonLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  quickActionDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  quickActionValue: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
