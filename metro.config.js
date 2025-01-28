const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// Get the default Metro config from Expo
const defaultConfig = getDefaultConfig(__dirname);

// Apply Sentry's configuration
const sentryConfig = getSentryExpoConfig(defaultConfig);

// Apply NativeWind configuration
module.exports = withNativeWind(sentryConfig, { input: "./global.css" });
