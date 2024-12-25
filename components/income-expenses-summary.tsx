import React, { useEffect, useState } from "react";
import { useExpenseStore } from "../store/expense-store";
import { useIncomeStore } from "../store/income-store";
import { Card } from "./card";
import { ExpenseSummary } from "./expense-summary";
import { IncomeSummary } from "./income-summary";
import { SwitchPill } from "./switch-pill";

type Prop = {
  onAddNew: (type: "income" | "expense") => void;
};

export const IncomeExpensesSummary = ({ onAddNew }: Prop) => {
  const [selectedOption, setSelectedOption] = useState<"Income" | "Expenses">("Income");
  const { 
    incomes, 
    loading: incomeLoading, 
    error: incomeError, 
    fetchIncomes, 
    initialized: incomeInitialized,
    defaultCurrency 
  } = useIncomeStore();

  const {
    expenses,
    loading: expenseLoading,
    error: expenseError,
    fetchExpenses,
    initialized: expenseInitialized
  } = useExpenseStore();

  useEffect(() => {
    if (!incomeInitialized) {
      fetchIncomes();
    }
    if (!expenseInitialized) {
      fetchExpenses();
    }
  }, [incomeInitialized, expenseInitialized]);

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <Card>
      <SwitchPill
        options={["Income", "Expenses"]}
        selected={selectedOption}
        onSelect={(option) => setSelectedOption(option as "Income" | "Expenses")}
      />
      {selectedOption === "Income" ? (
        <IncomeSummary
          incomes={incomes}
          loading={incomeLoading}
          error={incomeError}
          defaultCurrency={defaultCurrency}
          onAddNew={() => onAddNew("income")}
        />
      ) : (
        <ExpenseSummary
          expenses={expenses}
          totalIncome={totalIncome}
          loading={expenseLoading}
          error={expenseError}
          defaultCurrency={defaultCurrency}
          onAddNew={() => onAddNew("expense")}
        />
      )}
    </Card>
  );
};
