import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { EmptyState } from "./empty-state";
import { Card } from "./card";
import { useInvestmentStore } from "../store/investment-store";
import { useModalStore } from "@/store/modal-store";
import { formatCurrency } from "@/utils/format";
import { Legend } from "./legend";
import { colors } from "@/utils/colors";

const width = Dimensions.get("window").width;
const CARD_WIDTH = width * 0.4;

const InvestmentCard = ({ investment }) => (
  <View style={styles.investmentCard}>
    <View style={[styles.riskIndicator, styles[`risk${investment.risk_level}`]]} />
    <Text style={styles.investmentType}>{investment.type}</Text>
    <Text style={styles.investmentName}>{investment.name}</Text>
    <Text style={styles.investmentValue}>
      {formatCurrency(investment.current_value, 'KES')}
    </Text>
  </View>
);

const createGrowthData = (investment, totalPoints = 6) => {
  const currentValue = investment.current_value;
  const points = [];
  const createdAt = new Date(investment.created_at || Date.now());
  const now = new Date();
  
  // Calculate time difference in months
  const monthsDiff = (now.getFullYear() - createdAt.getFullYear()) * 12 + 
                    (now.getMonth() - createdAt.getMonth());
  
  // Generate data points starting from 0
  for (let i = 0; i <= totalPoints; i++) {
    const progress = i / totalPoints;
    const value = progress * currentValue;
    
    points.push({
      value: Math.round(value),
      label: `M${i}`,
      dataPointText: formatCurrency(value, 'KES'),
    });
  }
  
  return points;
};

export const InvestmentSummary = () => {
  const { investments, fetchInvestments, loading } = useInvestmentStore();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const chartColors = [
    '#4CAF50',  // green
    '#2196F3',  // blue
    '#FFC107',  // amber
    '#9C27B0',  // purple
    '#00BCD4',  // cyan
  ];

  const getChartData = () => {
    if (!investments.length) return [];

    return investments.map((inv, index) => ({
      data: createGrowthData(inv),
      color: chartColors[index % chartColors.length],
      label: inv.name,
      textColor: chartColors[index % chartColors.length],
    }));
  };

  const renderCharts = () => {
    const chartData = getChartData();
    const chartWidth = width * 0.85;

    const legendItems = chartData.map(dataset => ({
      color: dataset.color,
      label: dataset.label,
      value: formatCurrency(
        dataset.data[dataset.data.length - 1].value, 
        'KES'
      )
    }));

    return (
      <View style={styles.chartsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            height={200}
            width={chartWidth}
            initialSpacing={10}
            spacing={30}
            hideDataPoints={false}
            hideRules
            focusEnabled
            curved
            showStripOnFocus
            adjustToWidth
            thickness={2}
            dataPointsHeight={6}
            dataPointsWidth={6}
            areaChart
            rulesType="solid"
            rulesColor="rgba(0,0,0,0.1)"
            yAxisColor="rgba(0,0,0,0.1)"
            xAxisColor="rgba(0,0,0,0.1)"
            pointerConfig={{
              radius: 5,
              pointerColor: chartColors[0],
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items) => {
                return (
                  <View style={styles.pointerLabel}>
                    <Text style={styles.pointerLabelText}>
                      {items[0].dataPointText}
                    </Text>
                  </View>
                );
              },
            }}
          />
        </ScrollView>
        <Legend items={legendItems} />
      </View>
    );
  };

  const calculateTotalValue = () => 
    investments.reduce((sum, inv) => sum + inv.current_value, 0);

  if (loading) {
    return <Text>Loading investments...</Text>;
  }

  if (!investments.length) {
    return (
      <Card>
        <EmptyState
          icon={<Ionicons name="trending-up-outline" size={34} color="#8A8A8A" />}
          message="No investment data available."
          encouragement="Start tracking your investments!"
          ctaText="Add Investment"
          onPress={() => useModalStore.getState().openModal('add-investment')}
        />
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Investment Summary</Text>
        <Pressable
          style={styles.showAllButton}
          onPress={() => console.log("Show all investments pressed")}
        >
          <Text style={styles.showAllText}>Manage Investments</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {investments.map((investment) => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}
      </ScrollView>

      {renderCharts()}

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Portfolio Value</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(calculateTotalValue(), 'KES')}
        </Text>
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
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
    gap: 4,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },
  scrollContainer: {
    paddingHorizontal: 8,
  },
  investmentCard: {
    width: CARD_WIDTH,
    padding: 16,
    marginRight: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskHigh: {
    backgroundColor: '#FF6B6B',
  },
  riskMedium: {
    backgroundColor: '#FFD93D',
  },
  riskLow: {
    backgroundColor: '#6BCB77',
  },
  investmentType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232D59',
    marginBottom: 8,
  },
  investmentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#232D59',
  },
  chartsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background.highlight,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#232D59",
  },
  totalSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background.highlight,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#232D59',
  },
  yAxisText: {
    color: '#666666',
    fontSize: 10,
  },
  xAxisText: {
    color: '#666666',
    fontSize: 10,
    width: 50,
    transform: [{ rotate: '-45deg' }]
  },
  pointerLabel: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pointerLabelText: {
    color: '#232D59',
    fontSize: 12,
    fontWeight: '600',
  },
});
