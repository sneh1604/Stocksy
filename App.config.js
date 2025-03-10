export default {
    expo: {
      name: "Stock Simulator",
      slug: "stock-simulator-app",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      updates: {
        fallbackToCacheTimeout: 0
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#FFFFFF"
        }
      },
      web: {
        favicon: "./assets/favicon.png"
      }
    }
  };