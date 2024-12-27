import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "./card";
import { colors } from "../utils/colors";

interface InsightItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  iconColor?: string;
  iconBackground?: string;
}

interface Props {
  insights?: InsightItem[];
  onOptimize?: () => void;
}

const defaultInsights: InsightItem[] = [
  {
    icon: "trending-down",
    title: "Spending Pattern",
    message: "Your food expenses have increased by 15% compared to last month. Consider meal planning to reduce costs.",
    iconColor: colors.accent,
    iconBackground: 'rgba(0, 200, 83, 0.1)',
  },
  {
    icon: "save",
    title: "Savings Opportunity",
    message: "You could save $200 more by reducing entertainment expenses. This would help reach your savings goal faster.",
    iconColor: colors.primary,
    iconBackground: 'rgba(0, 150, 136, 0.1)',
  },
  {
    icon: "warning",
    title: "Budget Alert",
    message: "You're close to exceeding your shopping budget. Consider postponing non-essential purchases.",
    iconColor: "#FF4040",
    iconBackground: "rgba(255, 64, 64, 0.1)",
  },
];

export const AIBudgetInsights = ({ insights = defaultInsights, onOptimize }: Props) => {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="bulb" size={24} color={colors.accent} />
          <Text style={styles.title}>AI Budget Insights</Text>
        </View>
        <TouchableOpacity 
          style={styles.optimizeButton}
          onPress={onOptimize}
        >
          <Ionicons name="flash" size={16} color={colors.background.card} />
          <Text style={styles.optimizeButtonText}>Optimize</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.insightsList}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={[
              styles.insightIcon,
              { backgroundColor: insight.iconBackground }
            ]}>
              <Ionicons 
                name={insight.icon} 
                size={20} 
                color={insight.iconColor} 
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.message}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  optimizeButtonText: {
    color: colors.background.main,
    fontSize: 14,
    fontWeight: '600',
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.background.highlight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
