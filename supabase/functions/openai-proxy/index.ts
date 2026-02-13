// Supabase Edge Function: OpenAI Proxy
// Securely proxies requests to OpenAI API without exposing API keys to clients

import {
  HTTP_STATUS,
  MIME_TYPES,
  HTTP_HEADERS,
  AI_CONFIG,
  createCorsHeaders,
  createJsonResponse,
  createErrorResponse,
} from '../shared/config.ts';

interface OpenAIProxyRequest {
  operation: string;
  params: {
    model?: string;
    messages?: unknown;
    prompt?: string;
    temperature?: number;
    tools?: unknown;
    tool_choice?: unknown;
    response_format?: unknown;
    size?: string;
    quality?: string;
    n?: number;
  };
}

const corsHeaders = createCorsHeaders();

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { operation, params } = await req.json() as OpenAIProxyRequest;
    const apiKey = Deno.env.get(AI_CONFIG.OPENAI.API_KEY_ENV);

    if (!apiKey) {
      console.error(`${AI_CONFIG.OPENAI.API_KEY_ENV} not configured`);
      return createErrorResponse(
        'Server configuration error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    console.log(`Proxying OpenAI operation: ${operation}`);

    // Route to appropriate handler based on operation type
    switch (operation) {
      case 'chatCompletion': {
        const result = await handleChatCompletion(params, apiKey);
        return createJsonResponse(result);
      }
      case 'chatCompletionStream':
        return await handleChatCompletionStream(params, apiKey, corsHeaders);
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
    console.error('OpenAI proxy error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
});

async function handleChatCompletion(
  params: OpenAIProxyRequest['params'],
  apiKey: string
): Promise<unknown> {
  const { model, messages, temperature, tools, tool_choice, response_format } = params;
  
  if (!model) {
    throw new Error('Model is required');
  }
  
  const url = `${AI_CONFIG.OPENAI.API_BASE_URL}/chat/completions`;
  
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: temperature ?? AI_CONFIG.OPENAI.DEFAULT_TEMPERATURE,
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
    method: 'POST',
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON,
      [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${apiKey}`,
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
  params: OpenAIProxyRequest['params'],
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const { model, messages, temperature } = params;
  
  if (!model) {
    throw new Error('Model is required');
  }
  
  const url = `${AI_CONFIG.OPENAI.API_BASE_URL}/chat/completions`;
  
  const body = {
    model,
    messages,
    temperature: temperature ?? AI_CONFIG.OPENAI.DEFAULT_TEMPERATURE,
    stream: true,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON,
      [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${apiKey}`,
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
    headers: { ...corsHeaders, [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.EVENT_STREAM },
  });
}

async function handleGenerateImage(
  params: OpenAIProxyRequest['params'],
  apiKey: string
): Promise<unknown> {
  const { prompt, model, size, quality, n } = params;
  
  if (!prompt) {
    throw new Error('Prompt is required');
  }
  
  const url = `${AI_CONFIG.OPENAI.API_BASE_URL}/images/generations`;
  
  const body: Record<string, unknown> = {
    prompt,
    model: model ?? AI_CONFIG.OPENAI.DEFAULT_IMAGE_MODEL,
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
    method: 'POST',
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON,
      [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${apiKey}`,
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
