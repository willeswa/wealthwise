import 'dotenv/config'; // For local environment variables
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'wealthwise',
  slug: 'wealthwise',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.monkpadapps.wealthwise',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icon-logo.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.monkpadapps.wealthwise',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-sqlite',
    'expo-localization',
    [
      "@sentry/react-native/expo",
      {
        "organization": "dheemonk",
        "project": "wealthwise",
        // If you are using a self-hosted instance, update the value of the url property
        // to point towards your self-hosted instance. For example, https://self-hosted.example.com/.
        "url": "https://sentry.io/"
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '00e6efb9-bfae-4f83-8e26-df813d194330',
    },
    deepseekApiKey: process.env.DEEPSEEK_API_KEY, // Inject Deepseek API key
  },
  owner: 'monkpadapps',
};

export default config;