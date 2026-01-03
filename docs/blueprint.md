
# Blueprint: TrendVentures AI

## Overview
TrendVentures AI is a market intelligence suite generating business blueprints via Gemini/OpenAI.

## Current Architecture
- **Frontend**: React 18 (Vite), TailwindCSS.
- **State**: React Context (`AuthContext`, `PreferencesContext`) + Modular Engines (`useTrendEngine`, `useIdeaEngine`, `useBlueprintEngine`) coordinated by `useResearch`.
- **Hooks (Feature Logic)**: 
  - `useVoiceSummary`: Handles AI text-to-speech audio context and playback.
  - `useBlueprintMedia`: Handles generation of logos and Veo videos.
  - `usePreferences`: Exposes global language and AI provider settings.
  - **`useBlueprintEngine`**: Orchestrates the Blueprint generation lifecycle, including calling AI generation and enriching with business logic (Affiliates).
- **Components**:
  - `BlueprintView` serves as an orchestration container.
  - **Atomic Sub-components**: 
    - `BlueprintCompetitors`, `BlueprintAffiliates`, `BlueprintStrategies`, `BlueprintAgents`.
    - **New**: `CustomerPersonas` (Target Audience Analysis) and `BrandStudio` (Identity Generation).
  - **Research UI**: `TrendSearch` now supports **Region-Aware** searching and displays **Live Date Context** to ensure users know the AI is operating in "Now" time.
  - **Shared UI**: `components/ui/Modal.tsx` handles all overlay dialogs.
- **Data Layer**: 
  - **Modular Supabase Service**: Split into `auth`, `projects`, `community`, `admin`, and **`storage`** modules for scalability.
  - **Storage**: Hybrid model.
    - Structured Data: Supabase (PostgreSQL) + LocalStorage (Cache).
    - Media Assets: **Supabase Storage** (Public Buckets) with **IndexedDB** Fallback (Offline).
  - **Database Schema**: Defined in `supabase/schema.sql` with strict Row Level Security (RLS) policies.
- **AI Layer**: Client-side Service Adapter Pattern (`geminiService` / `openaiService`) with **Zod Schema Validation**.
  - **Purity Principle**: AI services only handle LLM interaction. Business logic injection (like Affiliate Links) is handled by the orchestration layer.
- **Config**: Dynamic System Prompts via `PromptService` (Admin Override).

## New Feature: Agent Workflows
- **Work Mode**: Users can delegate specific tasks to AI agents directly from the UI.
- **Customization**: Agents can be edited (name, role, system prompt) or manually added to the team.
- **Integration**: Task execution utilizes the existing Chat interface but initializes with a specific task context.

## Security & Hardening (New)
- **Input Validation**: `securityUtils` sanitizes all user inputs (Niche search) to prevent buffer overflows and basic prompt injection.
- **API Robustness**: 
  - **Credential Validation**: Strict runtime checks for `process.env.API_KEY` in `getGeminiClient` and OpenAI services to prevent SDK crashes.
  - **Integration Reliability**: `retryOperation` handles transient API failures.
  - **Live Audio Stability**: `liveService` now handles `AudioContext` suspension (Autoplay Policy) by explicitly resuming context on connection.
- **Standard Standards**: Adheres to basic OWASP client-side security practices (Sanitization, Validation).
- **RLS Policies**: Admin-only write access for Affiliates/Leads. Owner-only access for `saved_projects`.

## Data Flow
1. **User Input (Niche + Region)** -> **Sanitization** -> `useTrendEngine` (Fetch).
2. **Analysis** -> `useIdeaEngine` (Generate Options).
3. **Selection** -> `useBlueprintEngine` (Generate + Enrich + Publish).
4. **Validation** -> Zod Schemas ensure AI response integrity before state updates.
5. **Storage** -> LocalStorage (Debounced) + Supabase (On Save/Publish).

## Key Entities
- **Trend**: Market signal with relevance/growth metrics.
- **BusinessIdea**: Generated concept based on trends.
- **Blueprint**: Full execution plan (Roadmap, Tech, SWOT, Revenue).
- **CustomerPersona**: Detailed AI-generated profile of the ideal buyer.
- **PublishedBlueprint**: Public record for the directory.

## Known Limitations
1. **Security**: Client-side API calls expose keys. (See `bug.md`).
2. **Storage**: Heavy media uses Base64, risking LocalStorage quotas. (Mitigated by IndexedDB/Cloud Storage).
3. **State**: Modularized hooks have reduced complexity, but heavy re-renders may still occur in the main `App` component due to shared state lifting.

## Admin System
- **Access**: Hybrid "First-Claim" model (LocalStorage owner check + Supabase backup).
- **Role**: Manage Affiliate Keywords, View Leads, and **Edit System Prompts**.
