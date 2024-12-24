import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EmptyState } from "./empty-state";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./card";

export const DebtSummary = () => {
  const debtsData = []; // Replace with actual debt data

  const renderSummary = () => {
    if (debtsData.length > 0) {
      return (
        <View style={styles.summaryContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Next Payment: Ksh 5,000</Text>
            <Text style={styles.detailText}>Due: Dec 31, 2024</Text>
            <Text style={styles.detailText}>Goal: Debt-free by 2026</Text>
          </View>
        </View>
      );
    }
    return (
      <EmptyState
        icon={<Ionicons name="cash-outline" size={34} color="#8A8A8A" />}
        message="No debt data available."
        encouragement="Add your debts to start managing them effectively and stay on top of your finances!"
        ctaText="Add Debt"
        onPress={() => console.log("Navigate to add debt screen")}
      />
    );
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Debt Summary</Text>
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
