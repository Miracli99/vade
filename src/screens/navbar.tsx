import type React from "react";
import { useState } from "react";
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

const APP_LOGO = require("../../assets/vade-retro-logo.png");

export type AppNavbarRoute = "home" | "history" | "character";

type AppNavbarProps = {
  activeRoute: AppNavbarRoute;
  compact: boolean;
  titleColor: string;
  subtitleColor: string;
  panelColor: string;
  borderColor: string;
  accentColor: string;
  onOpenHome?: () => void;
  onOpenHistory?: () => void;
  onOpenCharacter?: () => void;
  rightSlot?: React.ReactNode;
};

type NavbarBrandProps = {
  logo: ImageSourcePropType;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  compact: boolean;
  onPress?: () => void;
};

export function AppNavbar({
  activeRoute,
  compact,
  titleColor,
  subtitleColor,
  panelColor,
  borderColor,
  accentColor,
  onOpenHome,
  onOpenHistory,
  onOpenCharacter,
  rightSlot,
}: AppNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { id: "home" as const, label: "Accueil", onPress: onOpenHome },
    { id: "history" as const, label: "Histoire", onPress: onOpenHistory },
    { id: "character" as const, label: "Fiche perso", onPress: onOpenCharacter },
  ];

  return (
    <View
      style={[
        styles.appNavbar,
        compact ? styles.appNavbarCompact : null,
        { backgroundColor: panelColor, borderColor },
      ]}
    >
      <View style={styles.appNavbarTopRow}>
        <NavbarBrand
          logo={APP_LOGO}
          title="Vade Retro"
          subtitle={compact ? "" : "Compagnon de campagne"}
          titleColor={titleColor}
          subtitleColor={subtitleColor}
          compact={compact}
          onPress={onOpenHome}
        />
        {compact ? (
          <Pressable
            onPress={() => setMenuOpen((current) => !current)}
            style={[styles.menuButton, { borderColor, backgroundColor: "rgba(255,255,255,0.06)" }]}
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
            accessibilityState={{ expanded: menuOpen }}
          >
            <Text style={[styles.menuButtonLabel, { color: titleColor }]}>☰</Text>
          </Pressable>
        ) : null}
      </View>
      {!compact ? (
        <View style={styles.appNavbarRight}>
          <View style={styles.appNavItems}>
            {navItems.map((item) => {
              const active = item.id === activeRoute;
              const disabled = !item.onPress || active;

              return (
                <Pressable
                  key={item.id}
                  disabled={disabled}
                  onPress={item.onPress}
                  style={[
                    styles.appNavItem,
                    active ? styles.appNavItemActive : null,
                    {
                      borderColor: active ? accentColor : borderColor,
                      backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvrir ${item.label}`}
                  accessibilityState={{ selected: active, disabled }}
                >
                  <Text
                    style={[
                      styles.appNavItemLabel,
                      { color: active ? titleColor : subtitleColor },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {rightSlot ? <View style={styles.appNavbarSlot}>{rightSlot}</View> : null}
        </View>
      ) : null}
      {compact && menuOpen ? (
        <View style={[styles.mobileMenuPanel, { backgroundColor: panelColor, borderColor }]}>
          {navItems.map((item) => {
            const active = item.id === activeRoute;
            const disabled = !item.onPress || active;

            return (
              <Pressable
                key={item.id}
                disabled={disabled}
                onPress={() => {
                  setMenuOpen(false);
                  item.onPress?.();
                }}
                style={[
                  styles.mobileMenuItem,
                  {
                    borderColor: active ? accentColor : borderColor,
                    backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir ${item.label}`}
                accessibilityState={{ selected: active, disabled }}
              >
                <Text style={[styles.mobileMenuItemLabel, { color: active ? titleColor : subtitleColor }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          {rightSlot ? <View style={styles.mobileMenuSlot}>{rightSlot}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

export function NavbarBrand({
  logo,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  compact,
  onPress,
}: NavbarBrandProps) {
  return (
    <View style={styles.navBrandBlock}>
      <Pressable
        disabled={!onPress}
        onPress={onPress}
        style={styles.navBrandPressable}
        accessibilityRole="button"
        accessibilityLabel="Retourner a l'accueil"
      >
        <View style={styles.navBrandRow}>
          <Image
            source={logo}
            style={[styles.navLogo, compact ? styles.navLogoCompact : null]}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.navBrand,
              compact ? styles.navBrandCompact : null,
              { color: titleColor },
            ]}
          >
            {title}
          </Text>
        </View>
      </Pressable>
      {subtitle ? (
        <Text
          style={[
            styles.navSubtle,
            compact ? styles.navSubtleCompact : null,
            { color: subtitleColor },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appNavbar: {
    position: "relative",
    width: "100%",
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1,
    overflow: "visible",
    zIndex: 10000,
    elevation: 100,
  },
  appNavbarCompact: {
    minHeight: 0,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 0,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  appNavbarTopRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  appNavbarRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  appNavbarRightCompact: {
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  appNavItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  appNavItemsCompact: {
    alignItems: "stretch",
  },
  appNavItem: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  appNavItemActive: {
    borderWidth: 1,
  },
  appNavItemLabel: {
    fontSize: 13,
    fontWeight: "900",
  },
  appNavbarSlot: {
    minWidth: 220,
  },
  menuButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  menuButtonLabel: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 24,
  },
  mobileMenuPanel: {
    position: "absolute",
    top: 58,
    left: 12,
    right: 12,
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: 14,
    zIndex: 10001,
    elevation: 101,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  mobileMenuItem: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  mobileMenuItemLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  mobileMenuSlot: {
    marginTop: 4,
  },
  navBrandBlock: {
    flexShrink: 1,
  },
  navBrandPressable: {
    alignSelf: "flex-start",
  },
  navBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navLogo: {
    width: 42,
    height: 42,
  },
  navLogoCompact: {
    width: 34,
    height: 34,
  },
  navBrand: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  navBrandCompact: {
    fontSize: 22,
  },
  navSubtle: {
    marginTop: 4,
  },
  navSubtleCompact: {
    fontSize: 12,
  },
});
