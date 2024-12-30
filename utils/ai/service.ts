import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGoalsResponse, BudgetAnalysisResponse, PromptBuilder } from './prompt';
import { HouseholdProfile } from '../types/preferences';

const AI_KEY = "AIzaSyCp42_RObJYxTLVYbWBPzYmLVfVHPYmr0o";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

let aiClient: GoogleGenerativeAI;

if (AI_KEY) {
  aiClient = new GoogleGenerativeAI(AI_KEY);
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AIService {
  private static validateBudgetAnalysisResponse(response: any): boolean {
    try {
      if (!response?.insights || !Array.isArray(response.insights)) {
        return false;
      }

      return response.insights.every((insight: any) => 
        insight.icon && 
        typeof insight.icon === 'string' &&
        insight.title && 
        typeof insight.title === 'string' &&
        insight.message && 
        typeof insight.message === 'string' &&
        insight.category && 
        ['urgent', 'optimization', 'growth'].includes(insight.category) &&
        insight.iconColor &&
        insight.iconBackground
      );
    } catch {
      return false;
    }
  }

  private static async generateWithRetry<T>(
    operation: () => Promise<T>, 
    validator: (data: any) => boolean,
    retries = MAX_RETRIES
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await operation();
        if (validator(result)) {
          return result;
        }
        console.warn(`Attempt ${attempt}: Invalid response format`);
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        if (attempt === retries) throw error;
      }
      
      if (attempt < retries) {
        await wait(RETRY_DELAY * attempt); // Exponential backoff
      }
    }
    throw new Error('Failed to generate valid response after retries');
  }

  private static async generateContent(prompt: string) {
    if(!aiClient) {
        throw new Error('AI client not initialized');
    }
    try {
      const model = aiClient.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      return result.response;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate AI content');
    }
  }

  static async getCountrySpecificGoals(
    countryCode: string,
    householdProfile?: HouseholdProfile
  ): Promise<AIGoalsResponse> {
    try {
      const prompt = PromptBuilder.goals(countryCode, householdProfile);
      const response = await this.generateContent(prompt.prompt);
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Failed to get country goals:', error);
      throw new Error('Failed to generate country-specific goals');
    }
  }

  static async getFinancialAdvice(context: string): Promise<string> {
    try {
      const prompt = PromptBuilder.advice(context);
      const response = await this.generateContent(prompt.prompt);
      return response.text();
    } catch (error) {
      console.error('Failed to get financial advice:', error);
      throw new Error('Failed to generate financial advice');
    }
  }

  static async analyzeBudget(params: {
    country: string;
    goal: string;
    debt: string;
    investments: string;
    budgetData: string;
  }): Promise<BudgetAnalysisResponse> {
    try {
      return await this.generateWithRetry(
        async () => {
          const prompt = PromptBuilder.budgetAnalysis(params);
          const response = await this.generateContent(prompt.prompt);
          const parsed = JSON.parse(response.text());
          return parsed;
        },
        this.validateBudgetAnalysisResponse
      );
    } catch (error) {
      console.error('Failed to analyze budget:', error);
      throw new Error('Failed to generate budget insights');
    }
  }
}

export { AIService };
