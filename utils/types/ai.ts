export interface AIInsight {
  id: number;
  type: string;
  title: string;
  message: string;
  category?: string;
  amount?: number;
  impact_score: number;
  created_at: string;
  valid_until: string;
  dismissed: boolean;
}
