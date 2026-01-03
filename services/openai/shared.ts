
import { retryOperation } from "../../utils/retryUtils";
import { OPENAI_MODELS } from "../../constants/aiConfig";

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIMessage {
  role: string;
  content: string | null;
  tool_calls?: OpenAIToolCall[];
}

export interface OpenAIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenAIOptions {
  tools?: OpenAIToolDefinition[];
  tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  response_format?: { type: 'json_object' | 'text' };
}

interface OpenAIRequestBody {
  model: string;
  messages: any[];
  temperature?: number;
  tools?: OpenAIToolDefinition[];
  tool_choice?: any;
  response_format?: any;
}

export const callOpenAI = async (
  messages: any[], 
  model: string = OPENAI_MODELS.BASIC,
  options: OpenAIOptions = {}
): Promise<OpenAIMessage> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("OpenAI API Key is missing. Please verify your environment configuration.");
  
  return retryOperation(async () => {
    const body: OpenAIRequestBody = {
      model,
      messages,
      temperature: 0.7,
      ...options
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      const errorObj = new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
      // Attach status so retry logic works correctly (e.g. 429 vs 400)
      (errorObj as any).status = response.status; 
      throw errorObj;
    }

    const data = await response.json();
    return data.choices[0]?.message || { role: "assistant", content: "" };
  });
};
