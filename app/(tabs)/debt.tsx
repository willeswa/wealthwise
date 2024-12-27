import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Card } from "../../components/card";
import { colors } from "../../utils/colors";
import { useDebtStore } from "../../store/debt-store";
import { formatCurrency } from "@/utils/format";
import { ContextMenu } from '../../components/context-menu';
import { EmptyState } from "../../components/empty-state";
import { getDefaultCurrency } from '../../utils/db/utils/settings';
import { useInvestmentStore } from "@/store/investment-store";
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/screen-background';
import { AppBar } from "@/components/app-bar";

const DebtSummaryCards = () => {
  const { summary, loading } = useDebtStore();
  const {defaultCurrency} = useInvestmentStore()

  if (loading || !summary) {
    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Debt Summary</Text>
        <View style={[styles.insightsGrid, styles.loadingState]}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </View>
    );
  }

  const insights = [
    {
      icon: "wallet-outline" as const,
      value: `${defaultCurrency} ${summary.totalOutstanding.toLocaleString()}`,
      label: "Total Debt",
      color: colors.warning,
      bgColor: colors.background.warning,
    },
    {
      icon: "calendar-outline" as const,
      value: formatCurrency(summary.upcomingRepayment?.repayment.amount || 0, defaultCurrency),
      label: "Monthly Payment",
      color: colors.accent,
      bgColor: colors.background.accent,
    },
    {
      icon: "trending-up-outline" as const,
      value: `${summary.debtToIncomeRatio.toFixed(1)}%`,
      label: "Debt-to-Income",
      color: summary.debtToIncomeRatio > 40 ? colors.warning : colors.success,
      bgColor: summary.debtToIncomeRatio > 40 ? colors.background.warning : colors.background.success,
    },
    {
      icon: "documents-outline" as const,
      value: summary.activeDebts.toString(),
      label: "Active Debts",
      color: colors.success,
      bgColor: colors.background.success,
    },
  ];

  return (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Your Debt</Text>
      <View style={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={[styles.iconContainer, { backgroundColor: insight.bgColor }]}>
              <Ionicons name={insight.icon} size={20} color={insight.color} />
            </View>
            <Text style={styles.insightValue}>{insight.value}</Text>
            <Text style={styles.insightDesc}>{insight.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const DebtList = () => {
  const { debts, loading, markAsPaidOff, deleteDebt } = useDebtStore();
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, right: number }>({ top: 0, right: 0 });
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    const loadDefaultCurrency = async () => {
      const defaultCurrency = await getDefaultCurrency();
      setCurrency(defaultCurrency);
    };
    loadDefaultCurrency();
  }, []);

  if (loading) {
    return <ActivityIndicator size="small" color={colors.accent} />;
  }

  if (!debts.length) {
    return (
      <Card>
        <Text style={styles.sectionTitle}>Active Debts</Text>
        <EmptyState
          icon={<Ionicons name="document-text-outline" size={48} color={colors.text.secondary} />}
          message="No active debts"
          encouragement="Track your loans and credit card debts to stay on top of your finances"
          ctaText="Add New Debt"
          onPress={() => {}} // You'll need to implement this
        />
      </Card>
    );
  }

  const handleShowMenu = (debtId: number, event: any) => {
    // Get the position of the touch
    const { pageY, pageX } = event.nativeEvent;
    setMenuPosition({
      top: pageY - 20, // Adjust these values as needed
      right: 20,
    });
    setMenuVisible(debtId);
  };

  const getMenuItems = (debtId: number) => [
    {
      label: 'Mark as Paid Off',
      icon: 'checkmark-circle-outline' as const,
      onPress: () => markAsPaidOff(debtId),
      color: colors.success,
    },
    {
      label: 'Delete',
      icon: 'trash-outline' as const,
      onPress: () => deleteDebt(debtId),
      color: colors.warning,
    },
  ];

  return (
    <Card>     
      <Text style={styles.sectionTitle}>Active Debts</Text>
      <View style={styles.debtList}>
        {debts.map((debt) => (
          <View key={debt.id} style={styles.debtCard}>
            <View style={styles.debtHeader}>
              <View style={styles.debtHeaderLeft}>
                <Text style={styles.creditorName}>{debt.creditor}</Text>
                <Text style={styles.interestRate}>
                  <Ionicons name="trending-up" size={14} color={colors.warning} />
                  {" "}{debt.interest_rate}% APR
                </Text>
              </View>
              <TouchableOpacity 
                onPress={(e) => handleShowMenu(debt.id!, e)}
                style={styles.menuButton}
              >
                <Ionicons 
                  name="ellipsis-horizontal" 
                  size={20} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.debtProgress}>
              <View style={styles.progressInfo}>
                <Text style={styles.remainingAmount}>
                  {currency} {debt.remaining_amount.toLocaleString()}
                </Text>
                <Text style={styles.progressPercent}>
                  {((1 - (debt.remaining_amount / debt.total_amount)) * 100).toFixed(1)}% paid
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(1 - (debt.remaining_amount / debt.total_amount)) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      <ContextMenu
        visible={menuVisible !== null}
        onClose={() => setMenuVisible(null)}
        items={menuVisible ? getMenuItems(menuVisible) : []}
        position={menuPosition}
      />
    </Card>
  );
};

export default function Debt() {
  const { fetchDebts, fetchSummary } = useDebtStore();

  useEffect(() => {
    fetchDebts();
    fetchSummary();
  }, []);

  return (
    <View style={styles.container}>
      <ScreenBackground color1={colors.warning} color2={colors.accent} />
      <AppBar title="Debt" subtitle="Manage your liabilities" />
      <ScrollView style={[styles.scrollView, { marginTop: 60 }]} contentContainerStyle={styles.scrollContent}>
        <Card>
          <DebtSummaryCards />
        </Card>
        <DebtList />
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
    gap: 8,
    justifyContent: 'space-between',
  },
  insightItem: {
    width: '48.5%',
    padding: 12,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  loadingState: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  debtList: {
    flex: 1,
    gap: 8,
    paddingVertical: 16,
  },
  debtCard: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: "white",
  },
  debtHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  debtHeaderLeft: {
    flex: 1,
  },
  creditorName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  interestRate: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  debtProgress: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  progressPercent: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.inactive,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  menuButton: {
    padding: 8,
  },
});