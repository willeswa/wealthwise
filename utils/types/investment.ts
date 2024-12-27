export type Frequency = 'One-time' | 'Weekly' | 'Monthly' | 'Yearly';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Liquidity = 'Liquid' | 'Illiquid';

export interface InvestmentType {
  id: number;
  name: string;
  description?: string;
  risk_level: RiskLevel;
  liquidity: Liquidity;
  created_at?: string;
}

export interface Investment {
  id: number;
  name: string;
  type: string;
  current_value: number;
  liquidity: Liquidity;
  risk_level: RiskLevel;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  investment_type?: InvestmentType;
}

export interface Contribution {
  id?: number;
  investment_id: number;
  amount: number;
  contribution_date: string;
  frequency: Frequency;
  notes?: string;
  created_at?: string;
}

export type InvestmentInput = Omit<Investment, 'id' | 'created_at' | 'updated_at'>;
export type ContributionInput = Omit<Contribution, 'id' | 'created_at'>;
