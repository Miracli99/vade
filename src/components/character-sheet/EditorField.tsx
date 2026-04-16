import { ReactNode, createContext, useContext } from "react";
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
