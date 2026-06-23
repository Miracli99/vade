import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { CharacterThemePreset } from "./presets";
import { styles } from "./styles";
import { EditorSection } from "./types";
import { getEditorSectionSubtitle, getEditorSectionTitle } from "./editorHelpers";

type EditorModalProps = {
  characterName: string;
  children: ReactNode;
  editorSection: EditorSection;
  ghostButtonLabelStyle: StyleProp<TextStyle>;
  ghostButtonStyle: StyleProp<ViewStyle>;
  primaryButtonLabelStyle: StyleProp<TextStyle>;
  primaryButtonStyle: StyleProp<ViewStyle>;
  theme: CharacterThemePreset;
  onCancel: () => void;
  onRequestClose: () => void;
  onSave: () => void;
  onSuppressReopen: () => void;
};

export function EditorModal({
  characterName,
  children,
  editorSection,
  ghostButtonLabelStyle,
  ghostButtonStyle,
  primaryButtonLabelStyle,
  primaryButtonStyle,
  theme,
  onCancel,
  onRequestClose,
  onSave,
  onSuppressReopen,
}: EditorModalProps) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onRequestClose}>
      <KeyboardAvoidingView
        style={styles.editorModalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPressIn={onSuppressReopen}
          onPress={onCancel}
        />
        <View style={styles.editorModalWrap}>
          <View
            style={[
              styles.editorModalHeader,
              { backgroundColor: theme.panelBg, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.editorModalHeaderText}>
              <Text style={[styles.editorModalEyebrow, { color: theme.accent }]}>
                {characterName}
              </Text>
              <Text style={[styles.editorModalTitle, { color: theme.title }]}>
                {getEditorSectionTitle(editorSection)}
              </Text>
              <Text style={[styles.editorModalSubtitle, { color: theme.subtitle }]}>
                {getEditorSectionSubtitle(editorSection)}
              </Text>
            </View>
            <View style={styles.editorActions}>
              <Pressable onPressIn={onSuppressReopen} onPress={onCancel} style={ghostButtonStyle}>
                <Text style={ghostButtonLabelStyle}>Annuler</Text>
              </Pressable>
              <Pressable onPressIn={onSuppressReopen} onPress={onSave} style={primaryButtonStyle}>
                <Text style={primaryButtonLabelStyle}>Sauvegarder</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView
            style={styles.editorModalScroll}
            contentContainerStyle={styles.editorModalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
