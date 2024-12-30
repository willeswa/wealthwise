import { AddDebtScreen } from "@/components/add-debt-form";
import { AddExpenseScreen } from "@/components/add-expense-form";
import { AddIncomeScreen } from "@/components/add-income-form";
import { AddInvestmentScreen } from "@/components/add-investment-form";
import { EditProfileModal } from "./edit-profile-modal";
import { EditGoalsModal } from "./edit-goals-modal";
import { useModalStore } from "@/store/modal-store";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function ActionModal() {
  const { isModalVisible, currentAction, closeModal } = useModalStore();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={closeModal}
      hardwareAccelerated={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          (currentAction === "add-debt" || 
           currentAction === "add-investment" ||
           currentAction === "edit-profile" ||
           currentAction === "edit-goals") && styles.modalContentTall
        ]}>
          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          {currentAction === "add-income" && <AddIncomeScreen />}
          {currentAction === "add-expense" && <AddExpenseScreen />}
          {currentAction === "add-debt" && <AddDebtScreen />}
          {currentAction === "add-investment" && <AddInvestmentScreen />}
          {currentAction === "edit-profile" && <EditProfileModal />}
          {currentAction === "edit-goals" && <EditGoalsModal />}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    height: "95%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalContentTall: {
    height: "98%",
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
