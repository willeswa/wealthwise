import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "./card";
import { EmptyState } from "./empty-state";
import { SwitchPill } from "./switch-pill";
import { Action } from "./type";

type Prop = {
  onAddNew: (type: Action) => void; // Updated type
};

export const IncomeExpensesSummary = ({ onAddNew }: Prop) => {
  const [selectedOption, setSelectedOption] = React.useState<"Income" | "Expenses">("Expenses");
  const incomeData: any[] = []; // Replace with actual income data
  const expensesData: any[] = []; // Replace with actual expenses data

  const renderSummary = () => {
    const data = selectedOption === "Income" ? incomeData : expensesData;
    const type = selectedOption;

    if (data.length > 0) {
      return <></>; // Replace with actual data rendering logic
    }

    return (
      <EmptyState
        icon={
          <Ionicons
            name={type === "Income" ? "wallet-outline" : "card-outline"}
            size={38}
            color="#8A8A8A"
          />
        }
        message={`No ${type.toLowerCase()} data available.`}
        encouragement={`Start tracking your ${type.toLowerCase()} to gain better insights and take control of your finances!`}
        ctaText={`Add ${type}`}
        onPress={() => onAddNew(type.toLowerCase() as "income" | "expense")}
      />
    );
  };

  return (
    <Card>
      <SwitchPill
        options={["Income", "Expenses"]}
        selected={selectedOption}
        onSelect={(option) => setSelectedOption(option as "Income" | "Expenses")}
      />
      <View style={styles.content}>{renderSummary()}</View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
  },
});
