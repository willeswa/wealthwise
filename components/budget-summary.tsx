import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import { EmptyState } from "./empty-state";
import { Card } from "./card";
import { useBudgetStore } from "../store/budget-store";
import { colors } from "../utils/colors";
import { formatCurrency } from "../utils/format";

const Legend = ({ categories }: { categories: Array<any> }) => {
  return (
    <View style={styles.legendContainer}>
      {categories.map((category, index) => (
        <View
          key={index}
          style={[styles.legendItem, { borderLeftColor: category.color }]}
        >
          <View>
            <Text style={styles.legendLabel}>{category.name}</Text>
            <Text style={styles.legendValue}>
              {category.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Get screen width for calculations
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = Math.min(SCREEN_WIDTH - 64, 300); // Max width of 300, with padding
const CHART_RADIUS = CHART_WIDTH * 0.4; // 40% of container width

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

  const pieData = summary.categories.map((category) => ({
    value: category.spent,
    color: category.color,
    text: "", // Remove text from pie slices
    label: category.name,
  }));

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        <Pressable
          style={styles.showAllButton}
          onPress={() => console.log("Show all expenses pressed")}
        >
          <Text style={styles.showAllText}>Deeper Analysis</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.chartSection}>
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            donut
            radius={CHART_RADIUS}
            textSize={12}
            focusOnPress
            innerRadius={CHART_RADIUS * 0.65}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerAmount}>
                  {formatCurrency(summary.unallocatedAmount, summary.currency)}
                </Text>
                <Text style={styles.centerText}>Unallocated</Text>
              </View>
            )}
          />
        </View>
        <Legend categories={summary.categories} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Budget</Text>
          <Text style={styles.statValue}>
            {formatCurrency(summary.totalIncome, summary.currency)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>
            {formatCurrency(summary.totalExpenses, summary.currency)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  viewAll: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "500",
  },
  chartSection: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
    maxWidth: CHART_WIDTH + 32, // Add some padding
    alignSelf: "center",
  },
  chartContainer: {
    width: CHART_WIDTH,
    height: CHART_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    alignItems: "center",
  },
  centerAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  centerText: {
    fontSize: 12,
    color: colors.text.light,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.light,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
    gap: 4,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  categoryName: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
  categoryStats: {
    alignItems: "flex-end",
  },
  allocatedAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  spentAmount: {
    fontSize: 12,
    color: colors.text.light,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 20,
  },
  legendContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.background.highlight,
    borderRadius: 4,
    minWidth: 70, // Minimum width to ensure readable content
    marginBottom: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: "black",
    fontWeight: "900",
  },
  legendValue: {
    fontSize: 11,
    color: colors.text.primary,
  },
});
