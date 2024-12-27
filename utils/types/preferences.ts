export type FinancialGoal = 
  | 'DEBT_FREE'
  | 'SAVE_EMERGENCY'
  | 'INVEST_FUTURE'
  | 'BUILD_WEALTH'
  | 'START_BUSINESS';

export interface UserPreferences {
  country: string;
  currency: string;
  locale: string;
  monthlyIncome: number;
  primaryGoal: FinancialGoal;
  hasCompletedOnboarding: boolean;
  aiEnabled: boolean;
}
