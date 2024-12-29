import { FinancialGoal } from '../types/preferences';
import { ADVICE_TEMPLATE, BUDGET_ANALYSIS_TEMPLATE, GOALS_TEMPLATE } from './templates';

// Add new interface for budget insights
export interface BudgetAnalysisResponse {
  insights: {
    icon: string;
    title: string;
    message: string;
    iconColor?: string;
    iconBackground?: string;
  }[];
}

export interface AIGoalsResponse {
  goals: FinancialGoal[];
}

export interface AIPrompt {
  type: string;
  prompt: string;
}

export class PromptBuilder {
  static goals(countryCode: string): AIPrompt {
    return {
      type: 'goals',
      prompt: GOALS_TEMPLATE.replaceAll('{country}', countryCode)
    };
  }

  static advice(context: string): AIPrompt {
    return {
      type: 'advice',
      prompt: ADVICE_TEMPLATE.replace('{context}', context)
    };
  }

  static budgetAnalysis(params: {
    country: string;
    goal: string;
    debt: string;
    investments: string;
    budgetData: string;
  }): AIPrompt {
    return {
      type: 'budget-analysis',
      prompt: BUDGET_ANALYSIS_TEMPLATE
        .replace('{country}', params.country)
        .replace('{goal}', params.goal)
        .replace('{debt}', params.debt)
        .replace('{investments}', params.investments)
        .replace('{budgetData}', params.budgetData)
    };
  }
}
