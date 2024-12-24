import React, { useState } from "react";
import { ScrollView, View, Modal, Pressable, Text, StyleSheet } from "react-native";
import { BudgetSummary } from "@/components/budget-summary";
import { DebtSummary } from "@/components/debt-summary";
import { IncomeExpensesSummary } from "@/components/income-expenses-summary";
import { InvestmentSummary } from "@/components/investment-summary";
import { AddIncomeScreen } from "@/components/temp-income-screen";

export type Action = "add-income" | "add-expense" | "add-investment" | "add-debt";

export default function HomeScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action | null>(null);

  const openModal = (action: Action) => {
    setCurrentAction(action);
    setModalVisible(true);
  };

  const closeModal = () => {
    setCurrentAction(null);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Main Home Screen Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <IncomeExpensesSummary onAddNew={(type) => openModal(type === "income" ? "add-income" : "add-expense")} />
        <BudgetSummary />
        <DebtSummary />
        <InvestmentSummary />
      </ScrollView>

      {/* Modal for Add Actions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            {/* Dynamic Content Based on Action */}
            {currentAction === "add-income" && <AddIncomeScreen />}
            {/* Add corresponding components for other actions (e.g., AddExpenseScreen) */}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    height: "95%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
