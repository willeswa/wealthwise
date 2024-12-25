export interface Income {
  id?: number;
  amount: number;
  currency: string;
  category_id: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  date: string;
  created_at?: string;
}

export interface IncomeInput extends Omit<Income, 'id' | 'created_at'> {}
