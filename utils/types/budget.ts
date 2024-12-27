export type CategoryType = 'want' | 'need' | 'savings' | 'debt';

export interface BudgetCategory {
  id?: number;
  name: string;
  allocated: number;
  type: CategoryType;
  created_at?: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  unallocatedAmount: number;
  categories: Array<{
    name: string;
    allocated: number;
    percentage: number;
    spent: number;
    type: CategoryType;
    color: string;
  }>;
  distribution: {
    wants: number;
    needs: number;
    savings: number;
    debt: number;
  };
  currency: string;
}

export interface BudgetInsight {
  monthlyChange: number;
  highestIncrease: {
    category: string;
    percentage: number;
  };
  upcomingBills: number;
  savingsProgress: number;
}
