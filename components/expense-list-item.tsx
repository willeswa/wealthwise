import { Ionicons } from "@expo/vector-icons";
import { format } from 'date-fns';
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "../utils/colors";
import { formatCurrency } from "../utils/format";

type ExpenseListItemProps = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  currency?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export const ExpenseListItem = ({
  id,
  name,
  amount,
  category,
  date,
  description,
  currency = "USD",
  onDelete,
  onEdit,
}: ExpenseListItemProps) => {
  console.log({name, category})
  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <Animated.View 
        entering={FadeIn}
        style={[styles.actionButton, styles.editButton]}
      >
        <Ionicons name="pencil" size={16} color={colors.background.main} />
      </Animated.View>
      <Animated.View 
        entering={FadeIn}
        style={[styles.actionButton, styles.deleteButton]}
      >
        <Ionicons name="trash" size={16} color={colors.background.main} />
      </Animated.View>
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={() => onDelete?.(id)}
    >
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.leftSection}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
           
            <View style={styles.metadata}>
              <Text style={styles.date}>
                {format(new Date(date), 'MMM d')}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.time}>
                {format(new Date(date), 'h:mm a')}
              </Text>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            <Text style={styles.amount}>
              {formatCurrency(amount, currency)}
            </Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>
                {getCategoryEmoji(category)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background.main,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
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
  time: {
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tagContainer: {
    backgroundColor: colors.background.highlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tag: {
    fontSize: 12,
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

// Helper function to get category emoji
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    Food: '🍔',
    Transport: '🚗',
    Bills: '📄',
    Rent: '🏠',
    Education: '📚',
    Healthcare: '🏥',
    Entertainment: '🎮',
    Shopping: '🛍️',
    Travel: '✈️',
    // Add more mappings as needed
  };
  return emojiMap[category] || '💰';
};

// Helper function to get category icon
const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    Food: 'fast-food-outline',
    Transport: 'car-outline',
    Bills: 'receipt-outline',
    Rent: 'home-outline',
    Education: 'school-outline',
    Healthcare: 'medical-outline',
    Entertainment: 'game-controller-outline',
    Shopping: 'cart-outline',
    Travel: 'airplane-outline',
    // Add more mappings as needed
  };
  return iconMap[category] || 'cart-outline';
};
