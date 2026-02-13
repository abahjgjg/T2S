// Client-side service to proxy AI requests through Supabase Edge Functions
// This eliminates the need for API keys in the client bundle

import { getEnv } from "../utils/envUtils";

// These are public values safe for client-side use
const SUPABASE_URL = getEnv("VITE_SUPABASE_URL", getEnv("SUPABASE_URL", ""));
const SUPABASE_ANON_KEY = getEnv("VITE_SUPABASE_ANON_KEY", getEnv("SUPABASE_ANON_KEY", ""));

export interface EdgeFunctionResponse<T = unknown> {
  data?: T;
  error?: string;
}

/**
 * Call a Supabase Edge Function
 */
async function callEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `Edge function error: ${response.status}`);
  }

  return response.json();
}

/**
 * Gemini Edge Function Client
 * Mirrors the GoogleGenAI interface but routes through edge functions
 */
export const geminiEdgeClient = {
  async generateContent(params: {
    model: string;
    contents: unknown[];
    config?: {
      temperature?: number;
      responseMimeType?: string;
      responseSchema?: unknown;
      maxOutputTokens?: number;
      systemInstruction?: unknown;
    };
  }) {
    return callEdgeFunction("gemini-proxy", {
      operation: "generateContent",
      params,
    });
  },

  async generateContentStream(params: {
    model: string;
    contents: unknown[];
    config?: {
      temperature?: number;
      maxOutputTokens?: number;
      systemInstruction?: unknown;
    };
  }) {
    const url = `${SUPABASE_URL}/functions/v1/gemini-proxy`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        operation: "generateContentStream",
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Edge function error: ${response.status}`);
    }

    return response.body;
  },

  async generateImage(params: {
    model: string;
    prompt: string;
    config?: {
      numberOfImages?: number;
    };
  }) {
    return callEdgeFunction("gemini-proxy", {
      operation: "generateImage",
      params,
    });
  },
};

/**
 * OpenAI Edge Function Client
 * Mirrors the OpenAI API interface but routes through edge functions
 */
export const openaiEdgeClient = {
  async chatCompletion(params: {
    model: string;
    messages: unknown[];
    temperature?: number;
    tools?: unknown[];
    tool_choice?: unknown;
    response_format?: { type: string };
  }) {
    return callEdgeFunction("openai-proxy", {
      operation: "chatCompletion",
      params,
    });
  },

  async chatCompletionStream(params: {
    model: string;
    messages: unknown[];
    temperature?: number;
  }) {
    const url = `${SUPABASE_URL}/functions/v1/openai-proxy`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        operation: "chatCompletionStream",
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Edge function error: ${response.status}`);
    }

    return response.body;
  },

  async generateImage(params: {
    prompt: string;
    model?: string;
    size?: string;
    quality?: string;
    n?: number;
  }) {
    return callEdgeFunction("openai-proxy", {
      operation: "generateImage",
      params,
    });
  },
};
