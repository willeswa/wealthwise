import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import { EmptyState } from "./empty-state";
import { Card } from "./card";
import { useBudgetStore } from "../store/budget-store";
import { colors } from "../utils/colors";
import { formatCurrency } from "../utils/format";

type CategoryType = 'want' | 'need' | 'saving';

const categoryColors: Record<`${CategoryType}s`, string> = {
  wants: '#FF6B6B',  // coral red
  needs: '#4ECDC4',  // turquoise
  savings: '#45B7D1', // sky blue
};

export const BudgetSummary = () => {
  const { summary, loading, error, fetchSummary } = useBudgetStore();

  console.log(summary);

  useEffect(() => {
    fetchSummary();
  }, []);

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (!summary || summary.categories.length === 0) {
    return (
      <EmptyState
        icon={<Ionicons name="wallet-outline" size={34} color="#8A8A8A" />}
        message="No budget data available."
        encouragement="Set up a budget to track your expenses and stay in control of your finances!"
        ctaText="Create A Budget"
        onPress={() => console.log("Navigate to add budget screen")}
      />
    );
  }

  const pieData = [
    {
      value: summary.distribution.needs,
      color: categoryColors.needs,
      text: `${((summary.distribution.needs / summary.totalIncome) * 100).toFixed(0)}%`,
      label: 'Needs'
    },
    {
      value: summary.distribution.wants,
      color: categoryColors.wants,
      text: `${((summary.distribution.wants / summary.totalIncome) * 100).toFixed(0)}%`,
      label: 'Wants'
    },
    {
      value: summary.distribution.savings,
      color: categoryColors.savings,
      text: `${((summary.distribution.savings / summary.totalIncome) * 100).toFixed(0)}%`,
      label: 'Savings'
    },
  ];

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        <Pressable onPress={() => console.log('Navigate to budget details')}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.chartSection}>
        <PieChart
          data={pieData}
          donut
          showText
          textColor="black"
          radius={90}
          textSize={12}
          focusOnPress
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerAmount}>
                {formatCurrency(summary.unallocatedAmount, 'USD')}
              </Text>
              <Text style={styles.centerText}>Unallocated</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Budget</Text>
          <Text style={styles.statValue}>
            {formatCurrency(summary.totalIncome, 'USD')}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>
            {formatCurrency(summary.totalExpenses, 'USD')}
          </Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        {summary.categories.slice(0, 3).map((category) => (
          <View key={category.name} style={styles.categoryRow}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColors[`${category.type}s` as keyof typeof categoryColors] }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <View style={styles.categoryStats}>
              <Text style={styles.allocatedAmount}>
                {formatCurrency(category.allocated, 'USD')}
              </Text>
              <Text style={[
                styles.spentAmount,
                { color: category.spent > category.allocated ? "red" : colors.text.light }
              ]}>
                {formatCurrency(category.spent, 'USD')} spent
              </Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewAll: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  chartSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  centerText: {
    fontSize: 12,
    color: colors.text.light,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.light,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  allocatedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  spentAmount: {
    fontSize: 12,
    color: colors.text.light,
  },
  error: {
    color: "red",
    textAlign: 'center',
    marginVertical: 20,
  },
});
