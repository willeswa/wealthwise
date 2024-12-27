import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { useInvestmentStore } from "@/store/investment-store";
import { useModalStore } from "@/store/modal-store";
import { colors } from "@/utils/colors";
import { formatCurrency } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/screen-background';
import { AppBar } from "@/components/app-bar";

const PortfolioOverview = () => {
  const { investments, loading, analytics, defaultCurrency } = useInvestmentStore();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  if (!investments?.length) {
    return (
      <EmptyState
        icon={<Ionicons name="bar-chart-outline" size={48} color={colors.text.secondary} />}
        message="No investments yet"
        encouragement="Start building your portfolio by adding your first investment"
        ctaText="Add Investment"
        onPress={() => useModalStore.getState().openModal("add-investment")}
      />
    );
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Portfolio Overview</Text>
      <View style={styles.portfolioGrid}>
        <View style={styles.portfolioItem}>
          <Text style={styles.portfolioLabel}>Total Value</Text>
          <Text style={styles.portfolioValue}>
            {formatCurrency(investments.reduce((sum, inv) => sum + inv.current_value, 0), defaultCurrency)}
          </Text>
        </View>
        <View style={styles.portfolioItem}>
          <Text style={styles.portfolioLabel}>Investments</Text>
          <Text style={styles.portfolioValue}>{investments.length}</Text>
        </View>
      </View>
    </>
  );
};

const PerformanceCard = () => {
  const { analytics, loading } = useInvestmentStore();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  if (!analytics) return null;

  return (
    <>
      <Text style={styles.sectionTitle}>Portfolio Performance</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiItem}>
          <Ionicons name="trending-up" size={24} color={colors.success} />
          <Text style={styles.kpiLabel}>Best Performer</Text>
          <Text style={styles.kpiValue}>{analytics.bestPerforming.name}</Text>
          <Text style={[styles.kpiReturn, styles.positive]}>
            +{analytics.bestPerforming.return.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.kpiItem}>
          <Ionicons name="trending-down" size={24} color={colors.warning} />
          <Text style={styles.kpiLabel}>Needs Attention</Text>
          <Text style={styles.kpiValue}>{analytics.worstPerforming.name}</Text>
          <Text style={[styles.kpiReturn, styles.negative]}>
            {analytics.worstPerforming.return.toFixed(1)}%
          </Text>
        </View>
      </View>
    </>
  );
};

export default function Investment() {
  const { fetchInvestments, analytics, investments } = useInvestmentStore();

  useEffect(() => {
    fetchInvestments();
  }, []);

  return (
    <View style={styles.container}>
      <ScreenBackground color1={colors.accent} color2="#4CAF50" />
      <AppBar title="Investments" subtitle="Grow your wealth" />
      <ScrollView style={[styles.scrollView, { marginTop: 60 }]} contentContainerStyle={styles.scrollContent}>
        <Card>
          <PortfolioOverview />
        </Card>

        {investments.length > 0 && <Card>
          <PerformanceCard />
        </Card>}

        {analytics?.pendingContributions && analytics.pendingContributions.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Pending Contributions</Text>
            <View style={styles.pendingList}>
              {analytics.pendingContributions?.map((contribution, index) => (
                <View key={index} style={styles.pendingItem}>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingTitle}>{contribution.investmentName}</Text>
                    <Text style={styles.pendingAmount}>
                      {formatCurrency(contribution.amount, defaultCurrency)}
                    </Text>
                  </View>
                  <Text style={[styles.pendingStatus, 
                    { color: contribution.status === 'pending' ? colors.warning : colors.success }]}>
                    {contribution.status}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

    
        {investments.length > 0 && analytics ? <Card>
          <Text style={styles.sectionTitle}>Risk Analysis</Text>
          <View style={styles.riskContainer}>
            <View style={styles.riskItem}>
              <Text style={styles.riskLabel}>Portfolio Risk Level</Text>
              <View style={styles.riskMeter}>
                <View style={[styles.riskFill, { width: `${analytics.riskAnalysis.riskScore}%` }]} />
              </View>
              <Text style={styles.riskText}>{analytics.riskAnalysis.riskLevel}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.riskTip}>
              Distribution: {analytics.riskAnalysis.distribution.low.toFixed(0)}% Low Risk, 
              {analytics.riskAnalysis.distribution.medium.toFixed(0)}% Medium Risk, 
              {analytics.riskAnalysis.distribution.high.toFixed(0)}% High Risk
            </Text>
          </View>
        </Card> : null}

        {analytics  && analytics?.recommendations.length > 0 ? <Card>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          <View style={styles.actionsList}>
            {analytics?.recommendations.map((rec, index) => (
              <TouchableOpacity key={index} style={styles.actionItem}>
                <View style={[styles.actionIcon, { 
                  backgroundColor: rec.priority === 'high' ? 
                    colors.background.warning : colors.background.accent 
                }]}>
                  <Ionicons 
                    name={
                      rec.type === 'rebalance' ? "repeat" :
                      rec.type === 'contribute' ? "trending-up" : "pie-chart"
                    } 
                    size={24} 
                    color={rec.priority === 'high' ? colors.warning : colors.accent} 
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{rec.title}</Text>
                  <Text style={styles.actionDesc}>{rec.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </Card> : null}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
  },
  insightsContainer: {
    gap: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  performancePlaceholder: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
  },
  allocationContainer: {
    gap: 12,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allocationLabel: {
    fontSize: 14,
    color: colors.text.primary,
  },
  projectedNote: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  chartPlaceholderText: {
    textAlign: 'center',
    color: colors.text.primary,
    marginTop: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  kpiItem: {
    flex: 1,
    backgroundColor: colors.background.highlight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 4,
  },
  kpiReturn: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.warning,
  },
  riskContainer: {
    gap: 16,
    marginTop: 12,
  },
  riskItem: {
    gap: 8,
  },
  riskLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  riskMeter: {
    height: 8,
    backgroundColor: colors.background.inactive,
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  riskText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.inactive,
  },
  riskTip: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionsList: {
    gap: 12,
    marginTop: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 12,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pendingList: {
    marginTop: 12,
    gap: 8,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  pendingAmount: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pendingStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  portfolioGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  portfolioItem: {
    flex: 1,
    backgroundColor: colors.background.highlight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
