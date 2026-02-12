
# Developer Guide: TrendVentures AI

## 🏗️ Architecture Overview

TrendVentures AI is a **Client-Side Heavy** React application that leverages modern browser capabilities and direct API integrations.

### Tech Stack
-   **Frontend**: React 19, TypeScript, Vite.
-   **Styling**: Tailwind CSS.
-   **State Management**: React Query (TanStack Query) + React Context.
-   **Database/Auth**: Supabase (PostgreSQL, GoTrue, Storage).
-   **Local Storage**: IndexedDB (via `idb` wrapper) for heavy assets.
-   **AI Providers**: 
    -   Google Gemini (via `@google/genai`).
    -   OpenAI (via REST API).

### Key Directories
-   `components/`: UI components (Atomic design principles).
-   `services/`: API adapters and business logic.
    -   `gemini/`: Gemini-specific implementation.
    -   `openai/`: OpenAI-specific implementation.
    -   `supabase/`: Modularized Supabase interactions.
-   `hooks/`: Custom React hooks (`useTrendEngine`, `useBlueprintEngine`).
-   `utils/`: Helpers for security, formatting, and storage.
-   `constants/`: Configuration and System Prompts.

---

## 🚀 Setup & Installation

### Prerequisites
-   Node.js 22+ (as specified in `.node-version`).
-   Supabase Project (for Cloud features).
-   Google AI Studio API Key.
-   OpenAI API Key (Optional).

### Environment Variables
Create a `.env` file in the root (though currently, the app expects keys via `process.env` injection or user input depending on the build configuration).

**Critical Variables:**
```env
GEMINI_API_KEY=your_google_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** `API_KEY` is deprecated. Use `GEMINI_API_KEY` instead.

### Installation
```bash
npm install
npm run dev
```

---

## 🧩 Core Concepts

### 1. The "Engine" Pattern
The application logic is split into three distinct engines handled by custom hooks:
1.  **`useTrendEngine`**: Manages fetching news, deeply analyzing trends, and handling the "Search" state.
2.  **`useIdeaEngine`**: Handles the synthesis of trends into business ideas.
3.  **`useBlueprintEngine`**: Manages the generation, modification, and publishing of the final Blueprint.

These are orchestrated by the parent hook **`useResearch.ts`**, which manages the global state machine (IDLE -> RESEARCHING -> ANALYZING -> BLUEPRINTING -> VIEWING).

### 2. Service Layer & Registry
AI calls are abstracted behind the `AIService` interface (`types.ts`).
-   `services/aiRegistry.ts`: A factory that returns either `geminiService` or `openaiService` based on user preference.
-   **Contribution**: To add a new provider (e.g., Anthropic), implement `AIService` and register it here.

### 3. Storage Strategy (Hybrid)
-   **Small Data (User Prefs)**: `localStorage` (Language, Provider settings).
-   **Structured Data (Blueprints)**: `IndexedDB` (Local Cache) + `Supabase` (Cloud Sync).
-   **Binary Assets (Images/Video)**: 
    -   **IndexedDB** (`assets` store) for offline/local usage.
    -   **Supabase Storage** (`public-assets` bucket) for public sharing.

### 4. Security
-   **Input Sanitization**: All user inputs pass through `utils/securityUtils.ts` to strip XSS vectors and potential prompt injection patterns.
-   **Safe Rendering**: Markdown is rendered via `SafeMarkdown.tsx` which whitelists allowed URL protocols.
-   **RLS**: Supabase tables are protected by Row Level Security policies (see `docs/blueprint.md` for schema details).

---

## 🛠️ Common Tasks

### Modifying System Prompts
Prompts are stored in `constants/systemPrompts.ts`.
-   **Local Dev**: Edit the file directly.
-   **Runtime**: Use the **Admin Panel** (`/admin`) to override prompts without code changes. These overrides persist in LocalStorage/Supabase.

### Adding a New AI Feature
1.  Define the method in `types.ts` (`AIService` interface).
2.  Implement the method in `services/gemini/` and `services/openai/`.
3.  Update `services/*Service.ts` exports.
4.  Create a UI component to trigger the feature.

### Working with Supabase
The app uses a modular service structure for Supabase:
-   `services/supabase/client.ts`: Initialization.
-   `services/supabase/auth.ts`: Authentication wrappers.
-   `services/supabase/community.ts`: Public directory logic.
-   `services/supabase/admin.ts`: Privileged operations.

---

## 🧪 Testing
The project uses **Vitest** for unit testing.
```bash
npm run test
```
**Key Test Files:**
-   `utils/securityUtils.test.ts`: Validates sanitization logic.
-   `services/promptService.test.ts`: Validates prompt interpolation and overrides.
-   `hooks/*.test.tsx`: Integration tests for the engine hooks.

---

## 📦 Deployment
The app is built as a static SPA.
```bash
npm run build
```
Deploy the `dist/` folder to Vercel, Netlify, or any static host.
**Note**: Ensure environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) are configured in your hosting provider.
