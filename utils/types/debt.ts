export interface Debt {
  id?: number;
  creditor: string;
  amount: number;
  interestRate: number;
  currency: string;
  startDate: string;
  dueDate: string;
  frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  paymentAmount: number;
  notes?: string;
  created_at?: string;
}

export interface DebtInput extends Omit<Debt, 'id' | 'created_at'> {}

export interface DebtSummary {
  totalOutstanding: number;
  activeDebts: number;
  highestInterestDebt: Debt | null;
  upcomingPayment: {
    debt: Debt;
    dueDate: string;
    amount: number;
  } | null;
  debtToIncomeRatio: number;
  monthlyPaymentTotal: number;
  debts: Debt[];
  chartData: {
    barData: Array<{
      value: number;
      label: string;
      frontColor: string;
    }>;
    lineData: Array<{
      value: number;
      dataPointText: string;
      label: string;
    }>;
  };
}
