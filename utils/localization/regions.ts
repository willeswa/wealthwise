import * as Localization from 'expo-localization';

export interface RegionalDefaults {
  currency: string;
  locale: string;
  emergencyFundMonths: number;
  minInvestmentAmount: number;
  maxDebtServiceRatio: number;
  investmentTypes: string[];
}

const REGIONAL_DEFAULTS: Record<string, RegionalDefaults> = {
  KE: {
    currency: 'KES',
    locale: 'sw-KE',
    emergencyFundMonths: 6,
    minInvestmentAmount: 5000,
    maxDebtServiceRatio: 0.4,
    investmentTypes: ['SACCO', 'T-BILLS', 'NSE'],
  },
  US: {
    currency: 'USD',
    locale: 'en-US',
    emergencyFundMonths: 3,
    minInvestmentAmount: 100,
    maxDebtServiceRatio: 0.36,
    investmentTypes: ['401K', 'IRA', 'STOCKS'],
  },
  // Add more regions as needed
};

export const getRegionalDefaults = (): RegionalDefaults => {
  const region = Localization.region || 'US';
  return REGIONAL_DEFAULTS[region] || REGIONAL_DEFAULTS.US;
};
