import OpenAI from "openai";
import { ChatCompletionOptions, ChatCompletionResult } from "./types.js";

export class OpenAIClient {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("OPENAI_API_KEY is missing");
    this.client = new OpenAI({ apiKey });
  }

  static fromEnv(): OpenAIClient {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN || "";
    return new OpenAIClient(apiKey);
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const completion = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages as any,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens,
      response_format: options.response_format,
    } as any);

    const text = completion?.choices?.[0]?.message?.content ?? "";
    return { text, raw: completion };
  }
}

export const createOpenAIClient = (apiKey?: string) =>
  new OpenAIClient(apiKey || process.env.OPENAI_API_KEY || "");


