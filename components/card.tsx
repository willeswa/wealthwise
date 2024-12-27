import { colors } from "@/utils/colors";
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

type CardVariant = "default" | "income" | "expense" | "debt" | "investment" | "budget";

type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
};

const skinColors: Record<CardVariant, string> = {
  default: "#FFFFFF",
  income: "#E8F5E9", // Soft green: growth, prosperity, success
  expense: "#FFEBEE", // Soft red: caution, importance, attention
  debt: "#FFF3E0", // Warm orange: urgency, responsibility
  investment: "#E3F2FD", // Soft blue: trust, security, stability
  budget: "#F3E5F5", // Soft purple: wisdom, luxury, planning
};

export const Card = ({ children, variant = "default", style }: CardProps) => (
  <View style={[styles.skinCard, { backgroundColor: skinColors[variant] }, style]}>
    <View style={styles.realCard}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  skinCard: {
    borderRadius: 20,
    padding: 4, 
    elevation: 1,
    marginVertical: 12
  },
  realCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
