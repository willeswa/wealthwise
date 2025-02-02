export type ExpenseCategoryType = 'general' | 'investment' | 'debt';

export interface ExpenseCategory {
  id: number;
  name: string;
  type: ExpenseCategoryType;
  icon: string;
  description?: string;
  created_at?: string;
}

export type ExpenseStatus = 'pending' | 'paid' | 'missed';

export interface Expense {
  id?: number;
  name: string;
  amount: number;
  currency: string;
  category_name: string;
  category_id: number;
  category?: ExpenseCategory;
  linked_item_id?: number;
  linked_item_type?: 'investment' | 'debt';
  comment?: string;
  date: string;
  created_at?: string;
  status: ExpenseStatus;
  due_date?: string;
  paid_date?: string;
}

export interface ExpenseInput extends Omit<Expense, 'id' | 'created_at' | 'category'> {
  status: ExpenseStatus;
}
