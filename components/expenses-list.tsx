import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useExpenseStore } from '../store/expense-store';
import { colors } from '../utils/colors';
import { CategoryGroup } from './category-group';
import { EmptyState } from './empty-state';

export const ExpensesList = () => {
  const { 
    expenses, 
    loading, 
    error, 
    defaultCurrency,
    fetchExpenses, 
    initialized, 
    removeExpense,
    updateStatus 
  } = useExpenseStore();


  const groupedExpenses = React.useMemo(() => {
    const groups = expenses.reduce((acc, expense) => {
      if (!acc[expense.category_name]) {
        acc[expense.category_name] = {
          total: 0,
          items: [],
        };
      }
      acc[expense.category_name].items.push(expense);
      acc[expense.category_name].total += expense.amount;
      return acc;
    }, {} as Record<string, { total: number; items: typeof expenses }>);

    // Sort categories by total amount
    return Object.entries(groups)
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([category, data]) => ({
        category,
        total: data.total,
        items: data.items.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
  }, [expenses]);

  useEffect(() => {
    if (!initialized) {
      fetchExpenses();
    }
  }, [initialized]);

  const handleDelete = async (id: string) => {
    try {
      await removeExpense(Number(id));
      // Refetch will happen automatically through the store
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Optionally show an error toast/alert here
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const expense = expenses.find(e => e.id?.toString() === id);
      if (expense) {
        await updateStatus(
          Number(id), 
          expense.status === 'paid' ? 'pending' : 'paid',
          expense.status === 'paid' ? undefined : new Date().toISOString()
        );
      }
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  if (loading && !initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!expenses.length) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<Ionicons name="receipt-outline" size={34} color="#8A8A8A" />}
          message="No expenses recorded yet"
          encouragement="Start tracking your expenses to better manage your finances!"
          ctaText="Add Expense"
          onPress={() => console.log('Navigate to add expense screen')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Expenses</Text>
        <Text style={styles.subtitle}>
          {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
        </Text>
      </View>
      
      <View style={styles.listContainer}>
        <FlashList
          data={groupedExpenses}
          renderItem={({ item }) => (
            <CategoryGroup
              category={item.category}
              total={item.total}
              items={item.items}
              currency={defaultCurrency}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.highlight,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.light,
  },
  listContainer: {
    flex: 1, // This is crucial for FlashList
    height: '100%', // Ensure the container takes full height
  },
  separator: {
    height: 1,
    backgroundColor: colors.background.highlight,
    marginLeft: 68, // Align with content, not icon
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  }
});
