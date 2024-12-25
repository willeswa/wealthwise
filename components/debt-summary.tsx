import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useDebtStore } from "../store/debt-store";
import { Card } from "./card";
import { EmptyState } from "./empty-state";
import { Legend } from "./legend";
import { colors } from "@/utils/colors";

type Props = {
  onAddNew: () => void;
};
const width = Dimensions.get("window").width;

export const DebtSummary = ({ onAddNew }: Props) => {
  const { summary, loading, fetchSummary } = useDebtStore();

  useEffect(() => {
    fetchSummary();
  }, []);

  const chartColors = [
    "#4B7BE5", // blue
    "#FF6B6B", // red
    "#4ECDC4", // teal
    "#45B7D1", // cyan
    "#96CEB4", // green
    "#FF9F1C", // orange
    "#9D4EDD", // purple
    "#2AB7CA", // light blue
  ];

  const getChartData = () => {
    if (!summary?.debts) return { barData: [], lineData: [] };

    return {
      barData: summary.debts.map((debt, index) => ({
        value: debt.amount,
        label: debt.creditor,
        frontColor: chartColors[index % chartColors.length],
      })),
      lineData: summary.debts.map((debt) => ({
        value: debt.interestRate,
        dataPointText: `${debt.interestRate}%`,
        label: debt.creditor,
      })),
    };
  };

  const { barData, lineData } = getChartData();

  const renderCharts = () => {
    const chartWidth = width * 0.75; // Reduced from 0.85
    const dataLength = barData.length;
    const dynamicSpacing = Math.max(
      12,
      Math.min(24, chartWidth / (dataLength * 4))
    );
    const dynamicBarWidth = Math.max(
      15,
      Math.min(20, chartWidth / (dataLength * 3))
    );

    const legendItems = barData.map((item) => ({
      color: item.frontColor,
      label: item.label,
      value: `$${item.value.toLocaleString()}`,
    }));

    return (
      <View style={styles.chartsContainer}>
        <ScrollView showsHorizontalScrollIndicator={false}>
          <View style={styles.chartWrapper}>
            <BarChart
              data={barData}
              width={chartWidth}
              height={200}
              barWidth={dynamicBarWidth}
              spacing={dynamicSpacing}
              hideRules
              yAxisTextStyle={styles.chartLabel}
            />
          </View>
        </ScrollView>
        <Legend items={legendItems} />
      </View>
    );
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Debt Summary</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : !summary || summary.activeDebts === 0 ? (
        <EmptyState
          icon={<Ionicons name="cash-outline" size={34} color="#8A8A8A" />}
          message="No debt data available."
          encouragement="Add your debts to start managing them effectively!"
          ctaText="Add Debt"
          onPress={onAddNew}
        />
      ) : (
        <>
          {renderCharts()}
          <View style={styles.summarySection}>
            {/* Total Debt Overview */}
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatLabel}>Total Debt</Text>
              <Text style={styles.mainStatValue}>
                ${summary.totalOutstanding.toLocaleString()}
              </Text>
              <View style={styles.subStatsRow}>
                <Text style={styles.subStatLabel}>
                  {summary.activeDebts} Active Debts
                </Text>
                <View style={styles.divider} />
                <Text style={styles.subStatLabel}>
                  DTI: {summary.debtToIncomeRatio.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Highlighted Insights */}
            <View style={styles.insightsContainer}>
              {/* Highest Interest Rate Debt */}
              <View style={[styles.insightCard]}>
            
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Highest Interest</Text>
                  <Text style={styles.insightTitle}>
                    {summary.highestInterestDebt?.creditor || "N/A"}
                  </Text>
                  <Text style={styles.insightValue}>
                    {summary.highestInterestDebt?.interestRate || 0}% APR
                  </Text>
                </View>
              </View>

              {/* Next Payment */}
              <View style={[styles.insightCard]}>
               
                <View style={styles.insightContent}>
                  <Text style={styles.insightLabel}>Next Payment</Text>
                  <Text style={styles.insightTitle}>
                    ${summary.upcomingPayment?.amount || 0}
                  </Text>
                  <Text style={styles.insightValue}>
                    Due{" "}
                    {new Date(
                      summary.upcomingPayment?.dueDate || new Date()
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#232D59",
    marginBottom: 12,
  },
  chartsContainer: {
   
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    width: "100%",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#232D59",
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: "center",
    width: "100%",
  },
  chartLabel: {
    color: "#666",
    fontSize: 11,
    transform: [{ rotate: "-45deg" }],
  },
  summarySection: {
    width: "100%",
  },
  mainStatCard: {
    backgroundColor: colors.background.highlight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  mainStatLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#232D59",
    marginBottom: 4,
  },
  subStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  subStatLabel: {
    fontSize: 13,
    color: "#666",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "#DDE1E6",
    marginHorizontal: 12,
  },
  insightsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  insightCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background.highlight,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  blueBackground: {
    backgroundColor: "#4B7BE5",
  },
  orangeBackground: {
    backgroundColor: "#FF6B6B",
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#232D59",
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 13,
    color: "#666",
  },
});
