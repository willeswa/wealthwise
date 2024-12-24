import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "./empty-state";
import { Card } from "./card";

export const BudgetSummary = () => {
  const budgetData = []; // Replace with actual budget data

  const renderSummary = () => {
    if (budgetData.length > 0) {
      return (
        <View style={styles.summaryContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Remaining: Ksh 30,000</Text>
            <Text style={styles.detailText}>Spent: Ksh 50,000</Text>
            <Text style={styles.detailText}>Reset Date: Dec 31, 2024</Text>
          </View>
        </View>
      );
    }

    return (
      <EmptyState
        icon={<Ionicons name="wallet-outline" size={34} color="#8A8A8A" />}
        message="No budget data available."
        encouragement="Set up a budget to track your expenses and stay in control of your finances!"
        ctaText="Create A Budget"
        onPress={() => console.log("Navigate to add budget screen")}
      />
    );
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Budget Summary</Text>
      <View style={styles.content}>{renderSummary()}</View>
    </Card>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  detailsContainer: {
    flex: 2,
    paddingLeft: 16,
  },
  detailText: {
    color: "#232D59",
    fontSize: 14,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#232D59",
    marginBottom: 12,
  },
  content: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
  },
});
