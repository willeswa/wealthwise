import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGoalsResponse, PromptBuilder } from './prompt';

const AI_KEY = process.env.GEMINI_KEY;


let aiClient: GoogleGenerativeAI;

if (AI_KEY) {
  aiClient = new GoogleGenerativeAI(AI_KEY);
}

class AIService {
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

  static async getCountrySpecificGoals(countryCode: string): Promise<AIGoalsResponse> {
    try {
      const prompt = PromptBuilder.goals(countryCode);
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
}

export { AIService };
