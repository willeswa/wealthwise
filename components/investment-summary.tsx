import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "./empty-state";
import { Card } from "./card";

export const InvestmentSummary = () => {
  const investmentsData = []; // Replace with actual investment data

  const renderSummary = () => {
    if (investmentsData.length > 0) {
      return (
        <View style={styles.summaryContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>Next Dividend: Ksh 10,000</Text>
            <Text style={styles.detailText}>Payout Date: Jan 15, 2025</Text>
            <Text style={styles.detailText}>Goal: Invested Ksh 500,000 by 2026</Text>
          </View>
        </View>
      );
    }

    return (
      <EmptyState
        icon={<Ionicons name="trending-up-outline" size={34} color="#8A8A8A" />}
        message="No investment data available."
        encouragement="Start tracking your investments to understand your growth and achieve your financial goals!"
        ctaText="Add Investments"
        onPress={() => console.log("Navigate to add investments screen")}
      />
    );
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Investment Summary</Text>
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
