import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface GoalType {
  value: string;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export type FinancialGoal = GoalType;

export interface UserPreferences {
  country: string;
  currency: string;
  locale: string;
  monthlyIncome: number;
  primaryGoal: FinancialGoal;
  hasCompletedOnboarding: boolean;
  aiEnabled: boolean;
}

export const GOALS: FinancialGoal[] = [
  {
    value: 'DEBT_FREE',
    label: 'Become Debt Free',
    description: 'Focus on clearing all your debts',
    icon: 'cash-remove'
  },
  {
    value: 'SAVE_EMERGENCY',
    label: 'Build Emergency Fund',
    description: '3-6 months of expenses saved',
    icon: 'umbrella'
  },
  {
    value: 'INVEST_FUTURE',
    label: 'Start Investing',
    description: 'Grow wealth through investments',
    icon: 'trending-up'
  },
  {
    value: 'BUILD_WEALTH',
    label: 'Build Long-term Wealth',
    description: 'Focus on assets and passive income',
    icon: 'bank'
  },
];