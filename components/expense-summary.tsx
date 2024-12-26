import { Expense } from "@/utils/types/expense";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from 'date-fns';
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View, Pressable } from "react-native";
import { colors } from '../utils/colors';
import { formatCurrency } from "../utils/format";
import { EmptyState } from "./empty-state";

type Props = {
  expenses: Array<Expense>;
  totalIncome: number;
  loading: boolean;
  error: string | null;
  defaultCurrency: string;
  onAddNew: () => void;
};

const ProgressBar = ({ percentage }: { percentage: number }) => {
  const isOverBudget = percentage > 100;
  const barColor = isOverBudget ? "rgba(139, 0, 0, 0.8)" : "rgba(34, 197, 94, 0.8)"; // rgba(34, 197, 94) is a deep green color
  
  return (
    <View style={styles.progressContainer}>
      <View 
        style={[
          styles.progressBar, 
          { 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: barColor 
          }
        ]} 
      />
      <Text style={[
        styles.progressText,
        { color: percentage > 75 ? "white" : colors.text.primary }
      ]}>
        {percentage.toFixed(1)}% of Income
      </Text>
    </View>
  );
};

export const ExpenseSummary = ({ expenses, totalIncome, loading, error, defaultCurrency, onAddNew }: Props) => {
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (loading) return <ActivityIndicator size="large" color="#232D59" />;
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={<Ionicons name="card-outline" size={38} color="#8A8A8A" />}
        message="No expenses data available."
        encouragement="Start tracking your expenses to gain better insights!"
        ctaText="Add Expense"
        onPress={onAddNew}
      />
    );
  }

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const incomePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Calculate category totals and percentages
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryStats = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100
    }))
    .sort((a, b) => b.amount - a.amount);

  const largestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];

  return (
    <View style={styles.summaryWrapper}>
      <View style={styles.headerSection}>
        <ProgressBar percentage={incomePercentage} />
        <Text style={styles.subtext}>
          {Object.keys(categoryTotals).length} categories
        </Text>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Top Categories</Text>
        {categoryStats.slice(0, 3).map(({ category, amount, percentage }) => (
          <View key={category} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>
                {formatCurrency(amount, defaultCurrency)}
              </Text>
            </View>
       
          </View>
        ))}
        {categoryStats.length > 0 && (
          <Pressable 
            style={styles.showAllButton}
            onPress={() => console.log('Show all expenses pressed')}
          >
            <Text style={styles.showAllText}>Show All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        )}
      </View>

      {largestExpense && (
        <>
          <Text style={styles.sectionTitle}>Largest Expense</Text>
          <View style={styles.largestExpenseCard}>
            <MaterialCommunityIcons 
              name="arrow-collapse-down"
              size={20} 
              color={colors.accent}
              style={styles.icon}
            />
            <View style={styles.largestExpenseDetails}>
              <Text style={styles.expenseAmount}>
                {formatCurrency(largestExpense.amount, defaultCurrency)}
              </Text>
              <Text style={styles.expenseCategory}>
                {largestExpense.category}
              </Text>
              <Text style={styles.expenseDate}>
                {format(new Date(largestExpense.date), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  comment: {
    fontSize: 12,
    color: colors.text.light,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  progressContainer: {
    height: 32,
    backgroundColor: 'rgba(35, 45, 89, 0.1)', // Faded primary (232D59) color
    borderRadius: 16,
    width: '100%',
    marginVertical: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 16,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 32, // Match container height for vertical centering
    zIndex: 1,
  },
  categoriesSection: {
    gap: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(26, 26, 26, 0.6)', // Darker primary (1A1A1A) color
  },
  categoryItem: {
    gap: 2,
    paddingHorizontal: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text.primary,
  },
  categoryAmount: {
    fontSize: 14,
    color: colors.text.primary,
  },
  categoryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.card,
    borderRadius: 3,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: colors.text.light,
    width: 45,
  },
  largestExpenseSection: {
    // marginTop: 24,
  },
  largestExpenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.highlight,
    borderRadius: 16,
    gap: 16,
  },
  largestExpenseDetails: {
    gap: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  expenseCategory: {
    fontSize: 14,
    color: colors.text.primary,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.text.light,
  }
});
