export type CurrencyType = {
  symbol: string;
  code: string;
  name: string;
};

export type CategoryType = {
  id: string;
  name: string;
  icon: string;
};

export const CURRENCIES: CurrencyType[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: 'KES', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

export const CATEGORIES: CategoryType[] = [
  { id: '1', name: 'Salary', icon: 'cash' },
  { id: '2', name: 'Business', icon: 'store' },
  { id: '3', name: 'Investment', icon: 'chart-line' },
  { id: '4', name: 'Freelance', icon: 'laptop' },
  { id: '5', name: 'Gift', icon: 'gift' },
];
