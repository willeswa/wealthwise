import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from 'date-fns';
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from '../utils/colors';
import { formatCurrency } from "../utils/format";
import { EmptyState } from "./empty-state";

type Props = {
  incomes: any[];
  loading: boolean;
  error: string | null;
  defaultCurrency: string;
  onAddNew: () => void;
};

const FrequencyBadge = ({ frequency }: { frequency: string }) => (
  <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
    <Text style={styles.badgeText}>
      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
    </Text>
  </View>
);

export const IncomeSummary = ({ incomes, loading, error, defaultCurrency, onAddNew }: Props) => {
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#232D59" />;
  }

  if (incomes.length === 0) {
    return (
      <EmptyState
        icon={<Ionicons name="wallet-outline" size={38} color="#8A8A8A" />}
        message="No income data available."
        encouragement="Start tracking your income to gain better insights and take control of your finances!"
        ctaText="Add Income"
        onPress={onAddNew}
      />
    );
  }

  const totalAmount = incomes.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.summaryWrapper}>
      <View style={styles.headerSection}>
        <Text style={styles.totalAmount}>
          {formatCurrency(totalAmount, defaultCurrency)}
        </Text>
        <Text style={styles.subtext}>
          {`${incomes.length} source${incomes.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      <View style={styles.listSection}>
        {incomes.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.incomeItem}>
            <View style={styles.itemMain}>
              <MaterialCommunityIcons 
                name="wallet-outline"
                size={20} 
                color={colors.accent}
                style={styles.icon}
              />
              <View>
                <Text style={styles.itemPrimary}>
                  {formatCurrency(item.amount, item.currency)}
                </Text>
                {/* <Text style={styles.itemSecondary}>
                  {format(item.frequency, item.date)}
                </Text> */}
              </View>
            </View>
            <FrequencyBadge frequency={item.frequency} />
          </View>
        ))}
        {incomes.length > 0 && (
          <Pressable 
            style={styles.showAllButton}
            onPress={() => console.log('Show all income pressed')}
          >
            <Text style={styles.showAllText}>Show All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        )}
      </View>
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
  }
});
