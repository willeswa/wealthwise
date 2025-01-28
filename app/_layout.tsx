import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useDatabase } from "../hooks/useDatabase";
import { usePreferencesStore } from "../store/preferences-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { initializeBackgroundTasks, checkBackgroundStatus } from "@/utils/background/task-manager";
import * as Sentry from "@sentry/react-native";
import { initializeAnalytics } from "@/utils/analytics";

initializeAnalytics()

function RootLayout() {
  const { isReady } = useDatabase();
  const aiEnabled = usePreferencesStore((state) => state.aiEnabled);
  const hasCompletedOnboarding = usePreferencesStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    if (isReady && aiEnabled) {
      initializeBackgroundTasks()
        .then(() => checkBackgroundStatus())
        .catch(console.error);
    }
  }, [isReady, aiEnabled]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#232D59" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" redirect={hasCompletedOnboarding} />
        <Stack.Screen name="(tabs)" redirect={!hasCompletedOnboarding} />
        <Stack.Screen
          name="modals/settings"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

// Conditionally wrap the root component with Sentry
const App = __DEV__ ? RootLayout : Sentry.wrap(RootLayout);

export default App;
