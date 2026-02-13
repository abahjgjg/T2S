// Supabase Edge Function: OpenAI Proxy
// Securely proxies requests to OpenAI API without exposing API keys to clients

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OpenAIProxyRequest {
  operation: string;
  params: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { operation, params } = await req.json() as OpenAIProxyRequest;
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Proxying OpenAI operation: ${operation}`);

    // Route to appropriate handler based on operation type
    let result;
    switch (operation) {
      case "chatCompletion":
        result = await handleChatCompletion(params, apiKey);
        break;
      case "chatCompletionStream":
        return await handleChatCompletionStream(params, apiKey, corsHeaders);
      case "generateImage":
        result = await handleGenerateImage(params, apiKey);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("OpenAI proxy error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handleChatCompletion(
  params: Record<string, unknown>, 
  apiKey: string
): Promise<unknown> {
  const { model, messages, temperature, tools, tool_choice, response_format } = params;
  
  const url = `${OPENAI_API_BASE}/chat/completions`;
  
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: temperature ?? 0.7,
  };

  if (tools) {
    body.tools = tools;
  }
  
  if (tool_choice) {
    body.tool_choice = tool_choice;
  }
  
  if (response_format) {
    body.response_format = response_format;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

async function handleChatCompletionStream(
  params: Record<string, unknown>, 
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { model, messages, temperature } = params;
  
  const url = `${OPENAI_API_BASE}/chat/completions`;
  
  const body = {
    model,
    messages,
    temperature: temperature ?? 0.7,
    stream: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  // Stream the response through
  const { readable, writable } = new TransformStream();
  response.body?.pipeTo(writable);

  return new Response(readable, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function handleGenerateImage(
  params: Record<string, unknown>, 
  apiKey: string
): Promise<unknown> {
  const { prompt, model, size, quality, n } = params;
  
  const url = `${OPENAI_API_BASE}/images/generations`;
  
  const body: Record<string, unknown> = {
    prompt: prompt as string,
    model: model ?? "dall-e-3",
  };

  if (size) {
    body.size = size;
  }
  
  if (quality) {
    body.quality = quality;
  }
  
  if (n) {
    body.n = n;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}
