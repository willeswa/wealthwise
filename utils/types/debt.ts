export type RepaymentFrequency = 'One-time' | 'Weekly' | 'Monthly' | 'Yearly';

export type RepaymentPeriodUnit = 'Weeks' | 'Months' | 'Years';

export interface Debt {
  id?: number;
  creditor: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  currency: string;
  start_date: string;
  expected_end_date: string;
  frequency: RepaymentFrequency;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DebtRepayment {
  id?: number;
  debt_id: number;
  amount: number;
  repayment_date: string;
  frequency: RepaymentFrequency;
  notes?: string;
  created_at?: string;
}

export type DebtInput = Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'remaining_amount'> & {
  repayment_period?: number;
  period_unit?: RepaymentPeriodUnit;
  manual_end_date?: boolean;
};

export type DebtRepaymentInput = Omit<DebtRepayment, 'id' | 'created_at'>;

export interface DebtPaymentStatus {
  id?: number;
  debt_id: number;
  month: string; // YYYY-MM format
  status: 'paid' | 'missed';
  penalty_rate: number;
  created_at?: string;
}

export interface DebtSummary {
  totalOutstanding: number;
  activeDebts: number;
  highestInterestDebt: Debt | null;
  upcomingRepayment: {
    debt: Debt;
    repayment: DebtRepayment;
  } | null;
  debtToIncomeRatio: number;
  monthlyRepaymentTotal: number;
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
  missedPayments: number;
  totalPenalties: number;
  paymentHistory: {
    month: string;
    status: 'paid' | 'missed';
    originalAmount: number;
    penaltyAmount: number;
  }[];
}
