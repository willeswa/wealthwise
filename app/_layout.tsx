import { AddOptionsMenu } from "@/components/add-options-menu";
import { Stack } from "expo-router";
import React from "react";
import { useDatabase } from "../hooks/useDatabase";
import { ActivityIndicator, View } from "react-native";

import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { isReady, error } = useDatabase();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#232D59" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
