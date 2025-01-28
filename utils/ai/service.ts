import { usePreferencesStore } from '../../store/preferences-store';
import { InvestmentInsight } from '../types/investment';
import { HouseholdProfile } from '../types/preferences';
import { AIGoalsResponse, BudgetAnalysisResponse, InvestmentContext, PromptBuilder } from './prompt';
import { searchFinancialNews } from './search';
import { AIClient, DeepSeekClient, GoogleAIClient, OpenAIClient } from './aiClients';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

let aiClient: AIClient;

const initializeAIClient = (provider: 'google' | 'openai' | 'deepseek') => {
  switch (provider) {
    case 'google':
      aiClient = new GoogleAIClient();
      break;
    case 'openai':
      aiClient = new OpenAIClient();
      break;
    case 'deepseek':
      aiClient = new DeepSeekClient();
      break;
    default:
      throw new Error('Unsupported AI provider');
  }
};

// Initialize with default provider
initializeAIClient('deepseek');

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface InvestmentUpdate {
  type: 'market_update' | 'regulatory' | 'risk_alert';
  title: string;
  description: string;
  impact: string;
  action: string;
  urgency: 'high' | 'medium' | 'low';
  source: string;
  affectedInvestments: string[];
  date: string; // ISO date string
}

interface InvestmentInfoResponse {
  updates: InvestmentUpdate[];
}

interface InvestmentEmpowermentResponse {
  insights: InvestmentInsight[];
}

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
      const result = await aiClient.generateContent(prompt);
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
    debt: string;
    investments: string;
    budgetData: string;
  }): Promise<BudgetAnalysisResponse> {
    try {
      const preferences = usePreferencesStore.getState();
      return await this.generateWithRetry(
        async () => {
          const prompt = PromptBuilder.budgetAnalysis({
            ...params,
            country: preferences.country,
            goal: preferences.primaryGoal.value,
          });
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

  private static validateInvestmentInfoResponse(response: any): boolean {
    try {
      if (!response?.updates || !Array.isArray(response.updates)) {
        return false;
      }

      const today = new Date().toISOString().split('T')[0];

      // Filter for today's updates only
      response.updates = response.updates.filter((update: any) => 
        update.date && update.date.startsWith(today)
      );

      if (response.updates.length === 0) {
        return false;
      }

      return response.updates.every((update: any) =>
        update.type && ['market_update', 'regulatory', 'risk_alert'].includes(update.type) &&
        update.title && typeof update.title === 'string' &&
        update.description && typeof update.description === 'string' &&
        update.impact && typeof update.impact === 'string' &&
        update.action && typeof update.action === 'string' &&
        update.urgency && ['high', 'medium', 'low'].includes(update.urgency) &&
        update.source && typeof update.source === 'string' &&
        Array.isArray(update.affectedInvestments) &&
        update.date && update.date.startsWith(today)
      );
    } catch {
      return false;
    }
  }

  private static validateInvestmentEmpowermentResponse(response: any): boolean {
    try {
      if (!response?.insights || !Array.isArray(response.insights)) {
        return false;
      }

      return response.insights.every((insight: any) =>
        insight.type && ['opportunity', 'diversification', 'trend'].includes(insight.type) &&
        insight.title && typeof insight.title === 'string' &&
        insight.description && typeof insight.description === 'string' &&
        insight.rationale && typeof insight.rationale === 'string' &&
        insight.requirements?.minAmount && typeof insight.requirements.minAmount === 'number' &&
        insight.requirements?.riskLevel && ['Low', 'Medium', 'High'].includes(insight.requirements.riskLevel) &&
        insight.requirements?.timeHorizon && ['Short', 'Medium', 'Long'].includes(insight.requirements.timeHorizon) &&
        insight.potentialReturn?.estimated && typeof insight.potentialReturn.estimated === 'number' &&
        insight.potentialReturn?.timeframe && typeof insight.potentialReturn.timeframe === 'string'
      );
    } catch {
      return false;
    }
  }

  private static sanitizeResponse(text: string): string {
    // Remove any leading/trailing non-JSON content
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No valid JSON found in response');
    }
    return text.slice(jsonStart, jsonEnd + 1);
  }

  private static buildSearchQueries(portfolio: any[], country: string): string[] {
    const queries = [];
    const portfolioData = Array.isArray(portfolio) ? portfolio : JSON.parse(portfolio);
    
    // Group investments by type
    const investmentTypes = new Set(portfolioData.map((inv: any) => inv.type));
    
    // Add country-specific market query
    queries.push(`country code ${country} investment news`);
    
    // Add type-specific queries
    investmentTypes.forEach(type => {
      queries.push(`country code ${country} ${type} news`);
    });
    
    // Add specific investment queries for major holdings
    portfolioData
      .filter((inv: any) => parseFloat(inv.value) > 1000) // Only major holdings
      .forEach((inv: any) => {
        queries.push(`country code: ${country} ${inv.name} ${inv.type} news`);
      });
    
    return queries;
  }

  static async getInvestmentUpdates(context: Pick<InvestmentContext, 'riskLevel' | 'portfolio'>): Promise<InvestmentInfoResponse> {
    try {
      const { country } = usePreferencesStore.getState();
      
      // Generate targeted search queries
      const portfolioArray = JSON.parse(context.portfolio);
      const searchQueries = this.buildSearchQueries(portfolioArray, country);

      
      // Get relevant news for each query
      const searchPromises = searchQueries.map(query => searchFinancialNews(query));
      const searchResults = await Promise.all(searchPromises);

      console.log('Search results:', searchResults);
      // Merge and deduplicate news results
      const allNews = searchResults.flat();
      const uniqueNews = Array.from(
        new Map(allNews.map(item => [item.link, item])).values()
      ).slice(0, 10); // Limit to top 10 most relevant results

      return await this.generateWithRetry(
        async () => {
          const prompt = PromptBuilder.investmentInfo({
            ...context,
            country,
            recentNews: uniqueNews,
          });
          const response = await this.generateContent(prompt.prompt);
          const sanitized = this.sanitizeResponse(response.text());
          const parsed = JSON.parse(sanitized);
          return parsed;
        },
        this.validateInvestmentInfoResponse
      );
    } catch (error) {
      console.error('Failed to get investment updates:', error);
      // Return empty updates instead of throwing
      return { updates: [] };
    }
  }

  static async getInvestmentOpportunities(context: Omit<InvestmentContext, 'country' | 'goal'>): Promise<InvestmentEmpowermentResponse> {
    try {
      const { country, primaryGoal } = usePreferencesStore.getState();
      return await this.generateWithRetry(
        async () => {
          const prompt = PromptBuilder.investmentEmpowerment({
            ...context,
            country,
            goal: primaryGoal.value,
          });
          const response = await this.generateContent(prompt.prompt);
          const sanitized = this.sanitizeResponse(response.text());
          const parsed = JSON.parse(sanitized);
          return parsed;
        },
        this.validateInvestmentEmpowermentResponse
      );
    } catch (error) {
      console.error('Failed to get investment opportunities:', error);
      // Return empty insights instead of throwing
      return { insights: [] };
    }
  }
}

export { AIService, initializeAIClient };
