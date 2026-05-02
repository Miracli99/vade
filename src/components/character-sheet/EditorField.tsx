import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type EditorFieldTheme = {
  label: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
};

const defaultTheme: EditorFieldTheme = {
  label: "#9caec8",
  inputBg: "#0d1426",
  inputBorder: "rgba(148, 163, 184, 0.14)",
  inputText: "#f8fafc",
  placeholder: "#6f84a7",
};

const EditorFieldThemeContext = createContext<EditorFieldTheme>(defaultTheme);

export function EditorFieldThemeProvider({
  value,
  children,
}: {
  value: EditorFieldTheme;
  children: ReactNode;
}) {
  return (
    <EditorFieldThemeContext.Provider value={value}>
      {children}
    </EditorFieldThemeContext.Provider>
  );
}

type EditorFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
};

export function EditorField({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
}: EditorFieldProps) {
  const theme = useContext(EditorFieldThemeContext);

  return (
    <View style={styles.editorField}>
      <Text style={[styles.editorFieldLabel, { color: theme.label }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={[
          styles.editorInput,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            color: theme.inputText,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
      />
    </View>
  );
}

type TagEditorFieldProps = {
  label?: string;
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  placeholder?: string;
};

export function TagEditorField({
  label = "Tags",
  tags,
  onChangeTags,
  placeholder,
}: TagEditorFieldProps) {
  const theme = useContext(EditorFieldThemeContext);
  const [draftValue, setDraftValue] = useState(formatTagInput(tags));
  const [isFocused, setIsFocused] = useState(false);
  const tagSignature = tags.join("\u0001");

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(formatTagInput(tags));
    }
  }, [isFocused, tagSignature]);

  function handleChange(value: string) {
    setDraftValue(value);
    onChangeTags(parseTagInput(value));
  }

  function handleBlur() {
    setIsFocused(false);
    setDraftValue(formatTagInput(parseTagInput(draftValue)));
  }

  return (
    <View style={styles.editorField}>
      <Text style={[styles.editorFieldLabel, { color: theme.label }]}>{label}</Text>
      <TextInput
        value={draftValue}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        keyboardType="default"
        style={[
          styles.editorInput,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            color: theme.inputText,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
      />
    </View>
  );
}

function parseTagInput(rawValue: string) {
  return rawValue
    .split(/[,\n;]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTagInput(tags: string[]) {
  return tags.join(", ");
}

const styles = StyleSheet.create({
  editorField: {
    flexGrow: 1,
    flexBasis: 180,
    gap: 6,
  },
  editorFieldLabel: {
    color: "#9caec8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  editorInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#0d1426",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    color: "#f8fafc",
  },
});
