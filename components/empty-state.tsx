import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export const EmptyState = ({
  icon,
  message,
  encouragement,
  ctaText,
  onPress,
}: {
  icon: React.ReactNode;
  message: string;
  encouragement: string;
  ctaText: string;
  onPress: () => void;
}) => (
  <View style={styles.emptyState}>
    {icon}
    <Text style={styles.emptyStateText}>{message}</Text>
    <Text style={styles.encouragementText}>{encouragement}</Text>
    <Pressable onPress={onPress} style={{
        borderColor: "#232D59",
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 32,
    }}>
      <Text style={styles.ctaButtonText}>{ctaText}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    marginTop: 16,
  },
  emptyStateText: {
    color: "#8A8A8A",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  encouragementText: {
    color: "#6C757D",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  ctaButtonText: {
    color: "#232D59",
    fontWeight: "600",
    fontSize: 14,
  },
});
