export interface Expense {
  id?: number;
  amount: number;
  currency: string;
  category: string;
  comment?: string;
  date: string;
  created_at?: string;
}

export interface ExpenseInput extends Omit<Expense, 'id' | 'created_at'> {}
