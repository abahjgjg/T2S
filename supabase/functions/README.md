# Supabase Edge Functions Configuration

This directory contains Supabase Edge Functions that securely proxy AI API requests.

## Purpose

These edge functions eliminate the security risk of exposing AI provider API keys (Gemini, OpenAI) in the client-side JavaScript bundle.

## Functions

### gemini-proxy
Proxies all Google Gemini API requests through the server.

**Operations:**
- `generateContent` - Generate text content
- `generateContentStream` - Stream text generation
- `generateImage` - Generate images using Gemini

### openai-proxy
Proxies all OpenAI API requests through the server.

**Operations:**
- `chatCompletion` - Create chat completions
- `chatCompletionStream` - Stream chat completions
- `generateImage` - Generate images using DALL-E

## Deployment

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link to your project: `supabase link --project-ref <your-project-ref>`

### Environment Variables

Set these in your Supabase project dashboard (Settings > Functions):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Deploy

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy gemini-proxy
supabase functions deploy openai-proxy
```

## Client Configuration

Ensure these environment variables are set in your client `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Migration from Direct API Calls

The client-side services have been updated to use `edgeFunctionService.ts` which routes requests through these edge functions instead of calling APIs directly.

### Before (Client-side with exposed keys):
```typescript
const apiKey = process.env.API_KEY; // Vulnerable!
const ai = new GoogleGenAI({ apiKey });
```

### After (Secure via edge functions):
```typescript
import { geminiEdgeClient } from "./edgeFunctionService";
const result = await geminiEdgeClient.generateContent(params);
```

## Security Benefits

1. **No API keys in bundle** - Keys only exist in server environment
2. **Rate limiting** - Can implement at edge function level
3. **Request validation** - Validate requests before forwarding to AI APIs
4. **Audit logging** - Log all AI API usage server-side
5. **Cost control** - Can implement usage quotas and monitoring

## Monitoring

View function logs:
```bash
supabase functions logs gemini-proxy
supabase functions logs openai-proxy
```

## Testing

Test functions locally:
```bash
supabase functions serve
```

Then send test requests to `http://localhost:54321/functions/v1/gemini-proxy`
