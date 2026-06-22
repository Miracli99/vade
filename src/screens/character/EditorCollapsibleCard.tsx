import { ReactNode } from "react";
import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

import { styles } from "./styles";

type EditorCollapsibleCardProps = {
  title: string;
  subtitle?: string;
  expanded: boolean;
  cardStyle: StyleProp<ViewStyle>;
  titleStyle: StyleProp<TextStyle>;
  removeButtonStyle: StyleProp<ViewStyle>;
  removeButtonLabelStyle: StyleProp<TextStyle>;
  children: ReactNode;
  onRemove: () => void;
  onToggle: () => void;
};

export function EditorCollapsibleCard({
  title,
  subtitle,
  expanded,
  cardStyle,
  titleStyle,
  removeButtonStyle,
  removeButtonLabelStyle,
  children,
  onRemove,
  onToggle,
}: EditorCollapsibleCardProps) {
  return (
    <View style={cardStyle}>
      <View style={styles.editorCardHeader}>
        <Pressable
          onPress={onToggle}
          style={styles.editorCardSummary}
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? "Replier" : "Ouvrir"} ${title}`}
        >
          <View
            style={[
              styles.editorCardDisclosure,
              expanded ? styles.editorCardDisclosureOpen : null,
            ]}
          >
            <Text style={styles.editorCardDisclosureLabel}>{expanded ? "-" : "+"}</Text>
          </View>
          <View style={styles.editorCardSummaryText}>
            <Text style={titleStyle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.editorCardSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.editorCardHeaderActions}>
          <Pressable onPress={onToggle} style={styles.editorFoldButton}>
            <Text style={styles.editorFoldButtonLabel}>
              {expanded ? "Replier" : "Ouvrir"}
            </Text>
          </Pressable>
          <Pressable onPress={onRemove} style={removeButtonStyle}>
            <Text style={removeButtonLabelStyle}>Supprimer</Text>
          </Pressable>
        </View>
      </View>
      {expanded ? <View style={styles.editorCardBody}>{children}</View> : null}
    </View>
  );
}
