import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "./empty-state";
import { Card } from "./card";
import { useInvestmentStore } from "../store/investment-store";
import { useModalStore } from "@/store/modal-store";
import { formatCurrency } from "@/utils/format";
import { colors } from "@/utils/colors";
import { Investment } from "@/utils/types/investment";

const width = Dimensions.get("window").width;
const CARD_WIDTH = width * 0.4;

const MetricCard = ({ label, value, icon, color }: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) => (
  <View style={[styles.metricCard]}>
    <View style={styles.metricHeader}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const InvestmentCard = ({ investment }: { investment: Investment }) => {
  
  return (
    <View style={styles.investmentCard}>
      <View style={styles.investmentHeader}>
        <Text style={styles.investmentType}>{investment.type}</Text>
        <View style={[styles.riskPill, styles[`risk${investment.risk_level}`]]}>
          <Text style={styles.riskText}>{investment.risk_level}</Text>
        </View>
      </View>
      <Text style={styles.investmentName} numberOfLines={1}>{investment.name}</Text>
      <View style={styles.investmentMetrics}>
        <Text style={styles.investmentValue}>
          {formatCurrency(investment.current_value, 'KES')}
        </Text>
        <View style={styles.liquidityPill}>
          <Text style={styles.liquidityText}>{investment.liquidity}</Text>
        </View>
      </View>
    </View>
  );
};

export const InvestmentSummary = () => {
  const { investments, fetchInvestments, loading, defaultCurrency } = useInvestmentStore();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const calculateMetrics = () => {
    const total = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const riskDistribution = investments.reduce((acc: any, inv) => {
      acc[inv.risk_level] = (acc[inv.risk_level] || 0) + inv.current_value;
      return acc;
    }, {});
    const liquidityBreakdown = investments.reduce((acc: any, inv) => {
      acc[inv.liquidity] = (acc[inv.liquidity] || 0) + inv.current_value;
      return acc;
    }, {});

    return {
      total,
      riskDistribution,
      liquidityBreakdown
    };
  };

  if (loading) {
    return <Text>Loading investments...</Text>;
  }

  if (!investments.length) {
    return (
      <Card>
        <View style={styles.header}>
          <Text style={styles.cardTitle}>Investment Overview</Text>
        </View>
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

  const metrics = calculateMetrics();

  return (
    <Card variant="investment">
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

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Total Portfolio"
          value={formatCurrency(metrics.total, defaultCurrency)}
          icon="wallet-outline"
          color="#4CAF50"
        />
        <MetricCard
          label="Liquid Assets"
          value={formatCurrency(metrics.liquidityBreakdown.Liquid || 0, defaultCurrency)}
          icon="water-outline"
          color="#2196F3"
        />
        <MetricCard
          label="High Risk"
          value={`${Math.round((metrics.riskDistribution.High || 0) / metrics.total * 100)}%`}
          icon="trending-up-outline"
          color="#FF6B6B"
        />
        <MetricCard
          label="Low Risk"
          value={`${Math.round((metrics.riskDistribution.Low || 0) / metrics.total * 100)}%`}
          icon="shield-outline"
          color="#6BCB77"
        />
      </View>

      <Text style={styles.sectionTitle}>Your Investments</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {investments.map((investment) => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#232D59",
    letterSpacing: -0.5,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    padding: 14,
    backgroundColor: colors.background.highlight,
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#232D59',
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  scrollContainer: {
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  investmentCard: {
    width: CARD_WIDTH,
    padding: 12,
    marginRight: 10,
    backgroundColor: colors.background.highlight,
    borderRadius: 16,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  investmentType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  riskHigh: {
    backgroundColor: '#FFE5E5',
  },
  riskMedium: {
    backgroundColor: '#FFF5E5',
  },
  riskLow: {
    backgroundColor: '#E5FFE9',
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#232D59', // Add color to make text visible
  },
  investmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#232D59',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  investmentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#232D59',
    letterSpacing: -0.2,
  },
  liquidityPill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liquidityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  investmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
