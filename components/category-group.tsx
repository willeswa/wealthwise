import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../utils/colors";
import { formatCurrency } from "../utils/format";
import { ExpenseListItem } from "./expense-list-item";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { AmountCurrencyView } from "./amount-currency-view";

interface CategoryGroupProps {
  category: string;
  total: number;
  items: any[];
  currency: string;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const CategoryGroup = ({ 
  category, 
  total, 
  items, 
  currency,
  onDelete,
  onToggleStatus
}: CategoryGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.header,
          // Move dynamic style here instead of in StyleSheet
          { marginBottom: isExpanded ? 12 : 0 }
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.titleContainer}>
          <Ionicons 
            name={isExpanded ? "remove-circle" : "add-circle"} 
            size={20} 
            color={colors.accent}
          />
          <Text style={styles.title}>{category}</Text>
        </View>
       
        <AmountCurrencyView
          amount={total}
          currency={currency}
          style={styles.total}
          />
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.content}
        >
          {items.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              id={expense.id?.toString() || ''}
              amount={expense.amount}
              category={expense.category}
              date={expense.date}
              description={expense.comment || ''}
              currency={currency}
              onDelete={(id) => onDelete(id)}
              onEdit={(id) => console.log('Edit:', id)}
              name={expense.name}
              status={expense.status}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  total: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.light,
  },
  content: {
    gap: 1,
    backgroundColor: colors.background.highlight,
  },
});
