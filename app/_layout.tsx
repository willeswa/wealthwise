import { Stack, Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useDatabase } from "../hooks/useDatabase";
import { usePreferencesStore } from "../store/preferences-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  const { isReady, error } = useDatabase();
  const hasCompletedOnboarding = usePreferencesStore((state) => state.hasCompletedOnboarding);

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
        <Stack.Screen 
          name="onboarding" 
          redirect={hasCompletedOnboarding}
        />
        <Stack.Screen 
          name="(tabs)" 
          redirect={!hasCompletedOnboarding}
        />
        <Stack.Screen 
          name="modals/settings"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
