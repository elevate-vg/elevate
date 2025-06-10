const variant = process.env.APP_VARIANT;

const getPackageName = () => {
  if (variant === 'dev') return 'com.simonwjackson.elevate.dev';
  if (variant === 'preview') return 'com.simonwjackson.elevate.preview';
  return 'com.simonwjackson.elevate';
};

const getAppName = () => {
  if (variant === 'dev') return 'Elevate (Dev)';
  if (variant === 'preview') return 'Elevate (Preview)';
  return 'Elevate';
};

export default {
  expo: {
    name: getAppName(),
    slug: "elevate",
    version: "1.0.0",
    orientation: "landscape",
    icon: "./src/apps/android/assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./src/apps/android/assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/apps/android/assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: getPackageName()
    },
    androidNavigationBar: {
      visible: false,
      barStyle: "dark-content",
      backgroundColor: "#000000"
    },
    androidStatusBar: {
      hidden: true,
      translucent: true,
      backgroundColor: "#00000000",
      barStyle: "dark-content"
    },
    web: {
      favicon: "./src/apps/android/assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "167f340d-5049-4079-a173-8a680aed40ed"
      }
    }
  }
};