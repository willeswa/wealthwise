import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../../components/card";
import { colors } from "../../utils/colors";
import { AIBudgetInsights } from "../../components/ai-budget-insights";
import { ExpensesList } from "../../components/expenses-list";

export default function Budget() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <AIBudgetInsights onOptimize={() => console.log("Optimize budget")} />

        <Card>
          <ExpensesList />
        </Card>
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
    paddingBottom: 32, // Add extra padding at bottom for better scrolling
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text.primary,
  },
  settingsButton: {
    padding: 8,
  },
  expensesCard: {
    minHeight: 400,
  },
});