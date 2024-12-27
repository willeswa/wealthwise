import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Card } from "../../components/card";
import { colors } from "../../utils/colors";
import { AIBudgetInsights } from "../../components/ai-budget-insights";
import { ExpensesList } from "../../components/expenses-list";
import { IncomeList } from "../../components/income-list";
import { useBudgetStore } from "../../store/budget-store";
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/screen-background';
import { AppBar } from "@/components/app-bar";

const BudgetInsights = () => {
  const { insights, fetchInsights, loading } = useBudgetStore();

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading || !insights) {
    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>This Month</Text>
        <View style={[styles.insightsGrid, styles.loadingState]}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>This Month</Text>
      <View style={styles.insightsGrid}>
        <View style={styles.insightItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background.success }]}>
            <Ionicons 
              name={insights.monthlyChange >= 0 ? "trending-up" : "trending-down"} 
              size={20} 
              color={insights.monthlyChange >= 0 ? colors.success : colors.warning} 
            />
          </View>
          <Text style={styles.insightValue}>{insights.monthlyChange.toFixed(1)}%</Text>
          <Text style={styles.insightDesc}>vs. Last Month</Text>
        </View>

        <View style={styles.insightItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background.warning }]}>
            <Ionicons name="warning" size={20} color={colors.warning} />
          </View>
          <Text style={styles.insightValue}>{insights.highestIncrease.category}</Text>
          <Text style={styles.insightDesc}>+{insights.highestIncrease.percentage.toFixed(1)}% this month</Text>
        </View>

        <View style={styles.insightItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background.accent }]}>
            <Ionicons name="time" size={20} color={colors.accent} />
          </View>
          <Text style={styles.insightValue}>{insights.upcomingBills}</Text>
          <Text style={styles.insightDesc}>Due this week</Text>
        </View>

        <View style={styles.insightItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background.success }]}>
            <Ionicons name="trophy" size={20} color={colors.success} />
          </View>
          <Text style={styles.insightValue}>{insights.savingsProgress}%</Text>
          <Text style={styles.insightDesc}>Savings Goal</Text>
        </View>
      </View>
    </View>
  );
};

export default function Budget() {
  return (
    <View style={styles.container}>
      <ScreenBackground color1={colors.success} color2={colors.accent} />
      <AppBar title="Budget" subtitle="Track your spending" />
      <ScrollView style={[styles.scrollView, { marginTop: 60 }]} contentContainerStyle={styles.scrollContent}>
        <Card>
          <BudgetInsights />
        </Card>
        <AIBudgetInsights onOptimize={() => console.log("Optimize budget")} />
        <Card>
          <IncomeList />
        </Card>
        <Card>
          <ExpensesList />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,  // Reduced gap
    justifyContent: 'space-between',
  },
  insightItem: {
    width: '48.5%',  // Slightly adjusted for tighter spacing
    padding: 12,     // Reduced padding
    alignItems: 'flex-start',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.01)',
  },
  iconContainer: {
    width: 36,      // Slightly smaller
    height: 36,     // Slightly smaller
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,  // Reduced margin
  },
  insightLabel: {
    fontSize: 12,
    color: colors.text.light,
    marginTop: 8,
  },
  insightValue: {
    fontSize: 18,    // Slightly smaller
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,  // Reduced margin
  },
  insightDesc: {
    fontSize: 12,    // Smaller
    color: colors.text.secondary,
    fontWeight: '500',
  },
  loadingState: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});