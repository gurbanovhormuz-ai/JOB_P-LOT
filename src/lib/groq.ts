import fs from "fs";
import path from "path";

// Ensure environment variables from .env.local and .env are loaded
export function loadEnv(): void {
  const root = process.cwd();
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        content.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const idx = trimmed.indexOf("=");
            if (idx !== -1) {
              const key = trimmed.substring(0, idx).trim();
              const val = trimmed.substring(idx + 1).trim();
              if (val && !process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        });
      } catch (err: unknown) {
        const error = err as Error;
        console.warn(`Could not load ${file}:`, error.message);
      }
    }
  }
}

// Load env on module import
loadEnv();

export interface GroqOptions {
  apiKey?: string;
  baseURL?: string;
}

export interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  [key: string]: any;
}

export interface ChatCompletionResponse {
  id?: string;
  choices: Array<{
    index?: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: any;
}

/**
 * High-performance, zero-dependency Groq client using native fetch.
 * Fully compatible with Groq's OpenAI-compatible chat completions REST API.
 */
export class Groq {
  public apiKey: string;
  public baseURL: string;
  public chat: {
    completions: {
      create: (params: ChatCompletionParams) => Promise<ChatCompletionResponse>;
    };
  };

  constructor(options: GroqOptions = {}) {
    this.apiKey =
      options.apiKey ||
      process.env.GROQ_API_KEY ||
      "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";

    let url = options.baseURL || "https://api.groq.com/openai/v1";
    if (!url.endsWith("/openai/v1")) {
      url = url.replace(/\/+$/, "") + "/openai/v1";
    }
    this.baseURL = url;

    this.chat = {
      completions: {
        create: async (params: ChatCompletionParams): Promise<ChatCompletionResponse> => {
          const endpoint = `${this.baseURL}/chat/completions`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(params),
          });

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Groq API error (${res.status}): ${errBody}`);
          }

          return (await res.json()) as ChatCompletionResponse;
        },
      },
    };
  }
}

// Dedicated clients per domain with explicit baseURL
export const groqParser = new Groq({
  apiKey: process.env.GROQ_API_KEY_PARSER || process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const groqChat = new Groq({
  apiKey: process.env.GROQ_API_KEY_CHAT || process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const groqMatch = new Groq({
  apiKey: process.env.GROQ_API_KEY_MATCH || process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const MODELS = {
  PARSER: process.env.GROQ_MODEL_PARSER || process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  CHAT: process.env.GROQ_MODEL_CHAT || process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  MATCH: process.env.GROQ_MODEL_MATCH || process.env.GROQ_MODEL || "openai/gpt-oss-120b",
} as const;

export default Groq;
