import { MaterialCommunityIcons } from "@expo/vector-icons";

export type GoalType = {
  value: string;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export type FinancialGoal = GoalType;

export type HouseholdComposition = 'single' | 'couple' | 'family';

export type HouseholdSizeRange = '1' | '2' | '3-4' | '5-6' | '7+';

export interface HouseholdProfile {
  composition: HouseholdComposition;
  size: HouseholdSizeRange; // Changed from number to HouseholdSizeRange
  primaryAge: number;
  hasChildren: boolean;
}

export const HOUSEHOLD_PROFILES = [
  {
    id: 'single',
    label: 'Single',
    sublabel: 'Just me',
    icon: 'account',
    illustration: '👤',
    ages: ['18-24', '25-34', '35-44', '45-54', '55+'],
    size: '1' as HouseholdSizeRange,
  },
  {
    id: 'couple',
    label: 'Couple',
    sublabel: 'Me & Partner',
    icon: 'account-multiple',
    illustration: '👥',
    ages: ['25-34', '35-44', '45-54', '55+'],
    size: '2' as HouseholdSizeRange,
  },
  {
    id: 'family',
    label: 'Family',
    sublabel: 'With Children',
    icon: 'account-group',
    illustration: '👨‍👩‍👧‍👦',
    sizes: ['3-4', '5-6', '7+'] as HouseholdSizeRange[],
    ages: ['25-34', '35-44', '45-54', '55+'],
  }
] as const;

export interface UserPreferences {
  country: string;
  currency: string;
  locale: string;
  monthlyIncome: number;
  primaryGoal: FinancialGoal;
  hasCompletedOnboarding: boolean;
  aiEnabled: boolean;
  householdProfile: HouseholdProfile | null;
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