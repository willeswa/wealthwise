import { GoogleGenerativeAI } from '@google/generative-ai';
import {OpenAI, ClientOptions} from 'openai';

export interface AIClient {
  generateContent(prompt: string): Promise<{ response: any }>;
}

export class GoogleAIClient implements AIClient {
  private client: GoogleGenerativeAI;

  constructor() {
    const AI_KEY = "AIzaSyAfZ_zvG6WlLhQLS7ATCwhwiiIh1ArVx0E";
    this.client = new GoogleGenerativeAI(AI_KEY);
  }

  async generateContent(prompt: string): Promise<{ response: any }> {
    const model = this.client.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return { response: result.response };
  }
}

export class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor() {
    const configuration: ClientOptions = {
      apiKey: "sk-1234567890",
    };
    this.client = new OpenAI(configuration);
  }

  async generateContent(prompt: string): Promise<{ response: any }> {
    const result = await this.client.completions.create({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1000,
    });
    return { response: result.choices[0].text };
  }
}
