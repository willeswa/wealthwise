import { BudgetSummary } from "@/components/budget-summary";
import { DebtSummary } from "@/components/debt-summary";
import { IncomeExpensesSummary } from "@/components/income-expenses-summary";
import { InvestmentSummary } from "@/components/investment-summary";
import { useModalStore } from "@/store/modal-store";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/screen-background';
import { colors } from "@/utils/colors";
import { AppBar } from "@/components/app-bar";

export default function HomeScreen() {
  const { openModal } = useModalStore();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScreenBackground 
        color1={colors.accent} 
        color2={colors.success}
      />
      <AppBar title="Overview" subtitle="Your financial summary" />
      <ScrollView style={{ marginTop: 60 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <BudgetSummary />
        <IncomeExpensesSummary 
          onAddNew={(type) => openModal(type === "income" ? "add-income" : "add-expense")} 
        />
        <DebtSummary onAddNew={() => openModal("add-debt")} />
        <InvestmentSummary />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#232D59",
  },
  settingsButton: {
    padding: 8,
  },
});
