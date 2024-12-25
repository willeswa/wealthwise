import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "./card";
import { EmptyState } from "./empty-state";
import { SwitchPill } from "./switch-pill";
import { useIncomeStore } from "../store/income-store";
import { useExpenseStore } from "../store/expense-store";
import { formatCurrency } from "../utils/format";
import { format, addWeeks, addMonths, addYears } from 'date-fns';
import { colors } from '../utils/colors';

type Prop = {
  onAddNew: (type: "income" | "expense") => void;
};

const getNextPaymentDate = (frequency: string, date: string) => {
  const currentDate = new Date(date);
  const today = new Date();
  
  let nextDate = currentDate;
  while (nextDate <= today) {
    switch (frequency) {
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
    }
  }
  
  return format(nextDate, 'MMM d, yyyy');
};

const FrequencyBadge = ({ frequency }: { frequency: string }) => (
  <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
    <Text style={styles.badgeText}>
      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
    </Text>
  </View>
);

export const IncomeExpensesSummary = ({ onAddNew }: Prop) => {
  const [selectedOption, setSelectedOption] = useState<"Income" | "Expenses">("Income");
  const { 
    incomes, 
    loading: incomeLoading, 
    error: incomeError, 
    fetchIncomes, 
    initialized: incomeInitialized,
    defaultCurrency 
  } = useIncomeStore();

  const {
    expenses,
    loading: expenseLoading,
    error: expenseError,
    fetchExpenses,
    initialized: expenseInitialized
  } = useExpenseStore();

  useEffect(() => {
    if (!incomeInitialized) {
      fetchIncomes();
    }
    if (!expenseInitialized) {
      fetchExpenses();
    }
  }, [incomeInitialized, expenseInitialized]);

  const getIconForItem = (item: any, type: "Income" | "Expenses") => {
    if (type === "Income") {
      return "wallet-outline";
    }
    // Return appropriate icon based on expense category
    // const category = CATEGORIES.find(c => c.id === item.category_id);
    return "card-outline";
  };

  const renderSummaryContent = (data: any[]) => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const numberOfSources = data.length;

    return (
      <View style={styles.summaryWrapper}>
        <View style={styles.headerSection}>
          <Text style={styles.totalAmount}>
            {formatCurrency(totalAmount, defaultCurrency)}
          </Text>
          <Text style={styles.subtext}>
            {`${numberOfSources} ${selectedOption === "Income" ? "source" : "transaction"}${numberOfSources !== 1 ? 's' : ''}`}
          </Text>
        </View>

        <View style={styles.listSection}>
          {data.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.incomeItem}>
              <View style={styles.itemMain}>
                <MaterialCommunityIcons 
                  name={getIconForItem(item, selectedOption)} 
                  size={20} 
                  color={colors.accent}
                  style={styles.icon}
                />
                <View>
                  <Text style={styles.itemPrimary}>
                    {formatCurrency(item.amount, item.currency)}
                  </Text>
                  <Text style={styles.itemSecondary}>
                    {selectedOption === "Income" 
                      ? getNextPaymentDate(item.frequency, item.date)
                      : format(new Date(item.date), 'MMM d, yyyy')}
                  </Text>
                </View>
              </View>
              {selectedOption === "Income" ? (
                <FrequencyBadge frequency={item.frequency} />
              ) : (
                item.comment && (
                  <Text style={styles.comment} numberOfLines={1}>
                    {item.comment}
                  </Text>
                )
              )}
            </View>
          ))}
          {data.length > 3 && (
            <Pressable 
              style={styles.showAllButton}
              onPress={() => console.log(`Show all ${selectedOption.toLowerCase()} pressed`)}
            >
              <Text style={styles.showAllText}>Show All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    const isIncome = selectedOption === "Income";
    const data = isIncome ? incomes : expenses;
    const loading = isIncome ? incomeLoading : expenseLoading;
    const error = isIncome ? incomeError : expenseError;

    if (error) {
      return <Text style={styles.error}>{error}</Text>;
    }

    if (loading) {
      return <ActivityIndicator size="large" color="#232D59" />;
    }

    if (data.length > 0) {
      return renderSummaryContent(data);
    }

    return (
      <EmptyState
        icon={
          <Ionicons
            name={isIncome ? "wallet-outline" : "card-outline"}
            size={38}
            color="#8A8A8A"
          />
        }
        message={`No ${selectedOption.toLowerCase()} data available.`}
        encouragement={`Start tracking your ${selectedOption.toLowerCase()} to gain better insights and take control of your finances!`}
        ctaText={`Add ${selectedOption}`}
        onPress={() => onAddNew(selectedOption.toLowerCase() as "income" | "expense")}
      />
    );
  };

  return (
    <Card>
      <SwitchPill
        options={["Income", "Expenses"]}
        selected={selectedOption}
        onSelect={(option) => setSelectedOption(option as "Income" | "Expenses")}
      />
      {renderSummary()}
    </Card>
  );
};

const additionalStyles = StyleSheet.create({
  comment: {
    fontSize: 12,
    color: colors.text.light,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 16,
  },
  switchPill: {
    marginBottom: 8,
  },
  summaryWrapper: {
    gap: 24,
  },
  headerSection: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 16,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  subtext: {
    fontSize: 12,
    color: colors.text.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listSection: {
    gap: 8,
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 12,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    backgroundColor: colors.background.card,
    padding: 8,
    borderRadius: 8,
  },
  itemPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  itemSecondary: {
    fontSize: 12,
    color: colors.text.light,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.background.card,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  error: {
    color: 'red',
    fontSize: 13,
    textAlign: 'center',
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
  ...additionalStyles
});
