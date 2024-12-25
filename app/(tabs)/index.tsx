import { BudgetSummary } from "@/components/budget-summary";
import { DebtSummary } from "@/components/debt-summary";
import { IncomeExpensesSummary } from "@/components/income-expenses-summary";
import { InvestmentSummary } from "@/components/investment-summary";
import { useModalStore } from "@/store/modal-store";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  const { openModal } = useModalStore();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
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
