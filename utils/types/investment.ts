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
  expense_id?: number;  // Add this field
}

export interface InvestmentPerformance {
  id: number;
  investment_id: number;
  value: number;
  return_rate: number;
  date: string;
  created_at?: string;
}

export interface PerformanceMetrics {
  currentValue: number;
  totalReturn: number;
  periodReturn: number;
  averageReturn: number;
  volatility: number;
  lastUpdated: string;
}

export type InvestmentInput = Omit<Investment, 'id' | 'created_at' | 'updated_at'>;
export type ContributionInput = Omit<Contribution, 'id' | 'created_at'>;

export type RecommendationType = 'diversify' | 'rebalance' | 'contribute';
export type RecommendationPriority = 'low' | 'medium' | 'high';

export interface InvestmentRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
}

export interface PortfolioAnalytics {
  bestPerforming: {
    name: string;
    return: number;
  };
  worstPerforming: {
    name: string;
    return: number;
  };
  riskAnalysis: {
    riskScore: number;
    riskLevel: RiskLevel;
    distribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  recommendations: InvestmentRecommendation[];
  pendingContributions?: Array<{
    investmentName: string;
    amount: number;
    status: 'pending' | 'paid';
    dueDate?: string;
  }>;
}
