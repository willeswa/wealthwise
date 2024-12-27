import { Ionicons } from "@expo/vector-icons";
import { format } from 'date-fns';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "../utils/colors";
import { formatCurrency } from "../utils/format";

type IncomeListItemProps = {
  id: number;
  amount: number;
  category: string;
  frequency: string;
  date: string;
  currency?: string;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
};

export const IncomeListItem = ({
  id,
  amount,
  category,
  frequency,
  date,
  currency = "USD",
  onDelete,
  onEdit,
}: IncomeListItemProps) => {
  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <Animated.View 
        entering={FadeIn}
        style={[styles.actionButton, styles.editButton]}
      >
        <Ionicons 
          name="pencil" 
          size={16} 
          color={colors.background.main} 
          onPress={() => onEdit?.(id)}
        />
      </Animated.View>
      <Animated.View 
        entering={FadeIn}
        style={[styles.actionButton, styles.deleteButton]}
      >
        <Ionicons 
          name="trash" 
          size={16} 
          color={colors.background.main} 
          onPress={() => onDelete?.(id)}
        />
      </Animated.View>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.leftSection}>
            <Text style={styles.category}>{category}</Text>
            <View style={styles.metadata}>
              <Text style={styles.date}>
                {format(new Date(date), 'MMM d, yyyy')}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.frequency}>{frequency}</Text>
            </View>
          </View>
          <Text style={styles.amount}>
            {formatCurrency(amount, currency)}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.main,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: colors.text.light,
  },
  frequency: {
    fontSize: 12,
    color: colors.text.light,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text.light,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    backgroundColor: "#FF4040",
  },
});
