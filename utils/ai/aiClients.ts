import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { OpenAI, ClientOptions } from 'openai';

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export interface AIClient {
  generateContent(prompt: string): Promise<{ response: any }>;
}

export class DeepSeekClient implements AIClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY!;
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  }

  async generateContent(prompt: string): Promise<{ response: any }> {
    try {
      const normalizedPrompt = normalizeText(prompt);

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat', 
          messages: [
            {
              role: 'user',
              content: normalizedPrompt,
            },
          ],
          max_tokens: 1000, 
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { response: response.data.choices[0].message.content };
    } catch (error) {
      console.error('Error generating content with DeepSeek API:', error);
      throw error;
    }
  }
}

export class GoogleAIClient implements AIClient {
  private client: GoogleGenerativeAI;

  constructor() {
    const AI_KEY = process.env.GOOGLE_AI_KEY!;
    this.client = new GoogleGenerativeAI(AI_KEY);
  }

  async generateContent(prompt: string): Promise<{ response: any }> {
    // Normalize the prompt before sending
    const normalizedPrompt = normalizeText(prompt);

    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(normalizedPrompt);
    return { response: result.response };
  }
}

export class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor() {
    const configuration: ClientOptions = {
      apiKey: process.env.OPENAI_API_KEY!,
    };
    this.client = new OpenAI(configuration);
  }

  async generateContent(prompt: string): Promise<{ response: any }> {
    // Normalize the prompt before sending
    const normalizedPrompt = normalizeText(prompt);

    const result = await this.client.completions.create({
      model: 'text-davinci-003',
      prompt: normalizedPrompt,
      max_tokens: 1000,
    });
    return { response: result.choices[0].text };
  }
}