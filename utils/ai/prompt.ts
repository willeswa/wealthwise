import { FinancialGoal } from '../types/preferences';

export interface AIGoalsResponse {
  goals: FinancialGoal[];
}

export interface AIPrompt {
  type: string;
  prompt: string;
}

export class PromptBuilder {
  private static readonly GOALS_TEMPLATE = `As a financial advisor, generate 4 distinct and selectable financial goals for people living in {country}. These goals will be presented as options for users to choose their primary financial objective.

Context requirements:
- Make each goal clearly distinguishable from others
- Ensure goals are immediately understandable at first glance
- Goals should represent different financial priorities
- Make goals compelling enough to be chosen as a primary objective
- Consider local economic conditions and opportunities
- Use professionally accepted financial terms in {country}
- Address different levels of financial ambition
- Make each goal worthy of being a primary focus

Return exactly 4 goals in the following JSON format:
{
  "goals": [
    {
      "value": "UNIQUE_IDENTIFIER_IN_CAPS",
      "label": "Short Goal Title",
      "description": "Two line description max",
      "icon": "icon-name"
    }
  ]
}

Formatting Requirements:
- Label: Clear, action-oriented titles (max 4 words)
- Description: Convincing yet concise pitch (40 chars max)
- Each goal should stand strong as a primary objective
- Make goals instantly selectable without need for explanation
- Use financial terminology common in {country}
- Keep goals distinct to aid user selection

Available icons (use exactly as shown):
- cash-remove
- umbrella
- trending-up
- bank
- home
- shopping
- calendar-clock
- shield-check

Requirements:
1. Goals must progress from basic to advanced
2. Use locally recognized financial terminology
3. Value must be in CAPS with underscores
4. Each goal must reflect local financial practices
5. Descriptions must be professional yet relatable
6. Never reference financial systems that don't exist in {country}`;

  private static readonly ADVICE_TEMPLATE = `Provide detailed financial advice considering: {context}

Requirements:
- Be specific and actionable
- Consider risk levels
- Include short and long-term perspectives
- Use clear, simple language`;

  static goals(countryCode: string): AIPrompt {
    return {
      type: 'goals',
      prompt: this.GOALS_TEMPLATE.replaceAll('{country}', countryCode)
    };
  }

  static advice(context: string): AIPrompt {
    return {
      type: 'advice',
      prompt: this.ADVICE_TEMPLATE.replace('{context}', context)
    };
  }
}
