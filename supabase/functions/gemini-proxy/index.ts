// Supabase Edge Function: Gemini Proxy
// Securely proxies requests to Google Gemini API without exposing API keys to clients

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeminiProxyRequest {
  operation: string;
  params: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { operation, params } = await req.json() as GeminiProxyRequest;
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Proxying Gemini operation: ${operation}`);

    // Route to appropriate handler based on operation type
    let result;
    switch (operation) {
      case "generateContent":
        result = await handleGenerateContent(params, apiKey);
        break;
      case "generateContentStream":
        return await handleGenerateContentStream(params, apiKey, corsHeaders);
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
    console.error("Gemini proxy error:", error);
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

async function handleGenerateContent(
  params: Record<string, unknown>, 
  apiKey: string
): Promise<unknown> {
  const { model, contents, config } = params;
  
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;
  
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: config?.temperature ?? 0.7,
      responseMimeType: config?.responseMimeType ?? "text/plain",
      ...(config?.responseSchema && { responseSchema: config.responseSchema }),
      ...(config?.maxOutputTokens && { maxOutputTokens: config.maxOutputTokens }),
    },
  };

  // Add system instruction if present
  if (config?.systemInstruction) {
    body.systemInstruction = config.systemInstruction;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

async function handleGenerateContentStream(
  params: Record<string, unknown>, 
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { model, contents, config } = params;
  
  const url = `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?key=${apiKey}`;
  
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: config?.temperature ?? 0.7,
      ...(config?.maxOutputTokens && { maxOutputTokens: config.maxOutputTokens }),
    },
  };

  if (config?.systemInstruction) {
    body.systemInstruction = config.systemInstruction;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
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
  const { model, prompt, config } = params;
  
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["Text", "Image"],
      ...(config?.numberOfImages && { numberOfImages: config.numberOfImages }),
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}
