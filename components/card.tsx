import { colors } from "@/utils/colors";
import React from "react";
import { View, StyleSheet } from "react-native";

export const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.skinCard}>
    <View style={styles.realCard}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  skinCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 12,
  },
  realCard: {
    backgroundColor: colors.secondary, // Example color for inner card
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
