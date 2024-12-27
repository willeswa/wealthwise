import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useIncomeStore } from '../store/income-store';
import { colors } from '../utils/colors';
import { EmptyState } from './empty-state';
import { IncomeListItem } from './income-list-item';
import { Ionicons } from '@expo/vector-icons';

export const IncomeList = () => {
  const { incomes, loading, error, removeIncome, initialized, defaultCurrency } = useIncomeStore();

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

  if (!incomes.length) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<Ionicons name="cash-outline" size={34} color="#8A8A8A" />}
          message="No income recorded yet"
          encouragement="Start tracking your income to better manage your finances!"
          ctaText="Add Income"
          onPress={() => console.log('Navigate to add income screen')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Income Sources</Text>
        <Text style={styles.subtitle}>
          {incomes.length} {incomes.length === 1 ? 'source' : 'sources'}
        </Text>
      </View>
      
      <View style={styles.listContainer}>
        <FlashList
          data={incomes.filter((income): income is typeof income & { id: number } => income.id !== undefined)}
          renderItem={({ item }) => (
            <IncomeListItem
              {...item}
              onDelete={removeIncome}
              onEdit={(id) => console.log('Edit income:', id)}
              currency={defaultCurrency}
            />
          )}
          estimatedItemSize={72}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
});
