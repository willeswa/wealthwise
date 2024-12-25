import { AddOptionsMenu } from "@/components/add-options-menu";
import { Stack } from "expo-router";
import React from "react";

import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

    </>
  );
}
