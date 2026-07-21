const { calculateVersionCode, readPackageVersion } = require("./scripts/versioning");

const version = readPackageVersion(__dirname);

module.exports = {
  expo: {
    name: "Vade Retro Companion",
    slug: "vade-retro-companion",
    scheme: "vaderetro",
    version,
    icon: "./assets/vade-retro-logo.png",
    orientation: "default",
    userInterfaceStyle: "dark",
    assetBundlePatterns: ["**/*"],
    platforms: ["android", "web"],
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/vade-retro-logo.png",
        backgroundColor: "#0b1020",
      },
      versionCode: calculateVersionCode(version),
      package: "com.vaderetro.companion",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/vade-retro-logo.png",
    },
    extra: {
      updateManifestUrl: "https://miracli99.github.io/vade/app-update.json",
    },
    plugins: ["expo-sharing", "expo-status-bar"],
  },
};
