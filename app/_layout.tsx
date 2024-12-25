import { AddOptionsMenu } from "@/components/add-options-menu";
import { Stack } from "expo-router";
import React from "react";
import { useDatabase } from '../hooks/useDatabase';
import { ActivityIndicator, View } from 'react-native';

import "../global.css";

export default function RootLayout() {
  const { isReady, error } = useDatabase();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#232D59" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

    </>
  );
}
