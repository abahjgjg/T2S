// Supabase Edge Function: Gemini Proxy
// Securely proxies requests to Google Gemini API without exposing API keys to clients

import {
  HTTP_STATUS,
  MIME_TYPES,
  HTTP_HEADERS,
  AI_CONFIG,
  createCorsHeaders,
  createJsonResponse,
  createErrorResponse,
} from '../shared/config.ts';

interface GeminiConfig {
  temperature?: number;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  maxOutputTokens?: number;
  systemInstruction?: unknown;
}

interface GeminiProxyRequest {
  operation: string;
  params: {
    model?: string;
    contents?: unknown;
    prompt?: string;
    config?: GeminiConfig;
  };
}

const corsHeaders = createCorsHeaders();

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { operation, params } = await req.json() as GeminiProxyRequest;
    const apiKey = Deno.env.get(AI_CONFIG.GEMINI.API_KEY_ENV);

    if (!apiKey) {
      console.error(`${AI_CONFIG.GEMINI.API_KEY_ENV} not configured`);
      return createErrorResponse(
        'Server configuration error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    console.log(`Proxying Gemini operation: ${operation}`);

    // Route to appropriate handler based on operation type
    switch (operation) {
      case 'generateContent': {
        const result = await handleGenerateContent(params, apiKey);
        return createJsonResponse(result);
      }
      case 'generateContentStream':
        return await handleGenerateContentStream(params, apiKey, corsHeaders);
      case 'generateImage': {
        const result = await handleGenerateImage(params, apiKey);
        return createJsonResponse(result);
      }
      default:
        return createErrorResponse(
          `Unknown operation: ${operation}`,
          HTTP_STATUS.BAD_REQUEST
        );
    }

  } catch (error) {
    console.error('Gemini proxy error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
});

async function handleGenerateContent(
  params: GeminiProxyRequest['params'],
  apiKey: string
): Promise<unknown> {
  const { model, contents, config } = params;
  
  if (!model) {
    throw new Error('Model is required');
  }
  
  const url = `${AI_CONFIG.GEMINI.API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
  
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: config?.temperature ?? AI_CONFIG.GEMINI.DEFAULT_TEMPERATURE,
      responseMimeType: config?.responseMimeType ?? AI_CONFIG.GEMINI.DEFAULT_MIME_TYPE,
      ...(config?.responseSchema && { responseSchema: config.responseSchema }),
      ...(config?.maxOutputTokens && { maxOutputTokens: config.maxOutputTokens }),
    },
  };

  // Add system instruction if present
  if (config?.systemInstruction) {
    body.systemInstruction = config.systemInstruction;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON },
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
  params: GeminiProxyRequest['params'],
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { model, contents, config } = params;
  
  if (!model) {
    throw new Error('Model is required');
  }
  
  const url = `${AI_CONFIG.GEMINI.API_BASE_URL}/models/${model}:streamGenerateContent?key=${apiKey}`;
  
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: config?.temperature ?? AI_CONFIG.GEMINI.DEFAULT_TEMPERATURE,
      ...(config?.maxOutputTokens && { maxOutputTokens: config.maxOutputTokens }),
    },
  };

  if (config?.systemInstruction) {
    body.systemInstruction = config.systemInstruction;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON },
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
    headers: { ...corsHeaders, [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.EVENT_STREAM },
  });
}

async function handleGenerateImage(
  params: GeminiProxyRequest['params'],
  apiKey: string
): Promise<unknown> {
  const { model, prompt, config } = params;
  
  if (!model) {
    throw new Error('Model is required');
  }
  
  const url = `${AI_CONFIG.GEMINI.API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['Text', 'Image'],
      ...(config?.maxOutputTokens && { numberOfImages: config.maxOutputTokens }),
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}
