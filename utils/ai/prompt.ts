import { FinancialGoal, HouseholdProfile } from '../types/preferences';
import { ADVICE_TEMPLATE, BUDGET_ANALYSIS_TEMPLATE, GOALS_TEMPLATE, INVESTMENT_EMPOWERMENT_TEMPLATE, INVESTMENT_INFO_TEMPLATE } from './templates';

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

interface InvestmentContext {
  country: string;
  goal?: string;
  riskLevel: string;
  experience?: string;
  income?: number;
  portfolio: string;
}

export class PromptBuilder {
  static goals(
    countryCode: string,
    householdProfile?: HouseholdProfile
  ): AIPrompt {
    let prompt = GOALS_TEMPLATE.replaceAll('{country}', countryCode);
    
    if (householdProfile) {
      prompt = prompt
        .replace('{household.composition}', householdProfile.composition)
        .replace('{household.size}', householdProfile.size.toString())
        .replace('{household.primaryAge}', householdProfile.primaryAge.toString())
        .replace('{household.hasChildren}', householdProfile.hasChildren.toString());
    }
    
    return {
      type: 'goals',
      prompt
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

  static investmentInfo(context: Pick<InvestmentContext, 'country' | 'riskLevel' | 'portfolio'>): AIPrompt {
    return {
      type: 'investment-info',
      prompt: INVESTMENT_INFO_TEMPLATE
        .replace('{country}', context.country)
        .replace('{riskLevel}', context.riskLevel)
        .replace('{portfolio}', context.portfolio)
    };
  }

  static investmentEmpowerment(context: InvestmentContext): AIPrompt {
    return {
      type: 'investment-empowerment',
      prompt: INVESTMENT_EMPOWERMENT_TEMPLATE
        .replace('{country}', context.country)
        .replace('{goal}', context.goal || 'general growth')
        .replace('{riskLevel}', context.riskLevel)
        .replace('{experience}', context.experience || 'intermediate')
        .replace('{income}', (context.income || 0).toString())
        .replace('{portfolio}', context.portfolio)
    };
  }
}
