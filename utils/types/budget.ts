export type CategoryType = 'want' | 'need' | 'savings';

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
  }>;
  distribution: {
    wants: number;
    needs: number;
    savings: number;
  };
}
