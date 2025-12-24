

# Blueprint: TrendVentures AI

## Overview
TrendVentures AI is a market intelligence suite generating business blueprints via Gemini/OpenAI.

## Current Architecture
- **Frontend**: React 18 (Vite), TailwindCSS.
- **State**: React Context (`AuthContext`) + Modular Engines (`useTrendEngine`, `useIdeaEngine`, `useBlueprintEngine`) coordinated by `useResearch`.
- **Hooks (Feature Logic)**: 
  - `useVoiceSummary`: Handles AI text-to-speech audio context and playback.
  - `useBlueprintMedia`: Handles generation of logos and Veo videos.
- **Components**:
  - `BlueprintView` serves as an orchestration container.
  - **Atomic Sub-components**: `BlueprintCompetitors`, `BlueprintAffiliates`, `BlueprintStrategies` (extracted for modularity).
  - **Research UI**: `TrendSearch` now supports **Region-Aware** searching and displays **Live Date Context** to ensure users know the AI is operating in "Now" time.
- **Data Layer**: 
  - **Modular Supabase Service**: Split into `auth`, `projects`, `community`, and `admin` modules for scalability.
  - **Storage**: Hybrid model using Supabase (PostgreSQL) with LocalStorage fallback.
- **AI Layer**: Client-side Service Adapter Pattern (`geminiService` / `openaiService`) with **Zod Schema Validation**.
- **Config**: Dynamic System Prompts via `PromptService` (Admin Override).

## Security & Hardening (New)
- **Input Validation**: `securityUtils` sanitizes all user inputs (Niche search) to prevent buffer overflows and basic prompt injection.
- **Integration Robustness**: 
  - `retryOperation` handles transient API failures.
  - `liveService` sanitized to follow strict `@google/genai` guidelines (Transcription Config).
- **Standard Standards**: Adheres to basic OWASP client-side security practices (Sanitization, Validation).

## Data Flow
1. **User Input (Niche + Region)** -> **Sanitization** -> `useTrendEngine` (Fetch).
2. **Analysis** -> `useIdeaEngine` (Generate Options).
3. **Selection** -> `useBlueprintEngine` (Deep Dive + Publish).
4. **Validation** -> Zod Schemas ensure AI response integrity before state updates.
5. **Storage** -> LocalStorage (Debounced) + Supabase (On Save/Publish).

## Key Entities
- **Trend**: Market signal with relevance/growth metrics.
- **BusinessIdea**: Generated concept based on trends.
- **Blueprint**: Full execution plan (Roadmap, Tech, SWOT, Revenue).
- **PublishedBlueprint**: Public record for the directory.

## Known Limitations
1. **Security**: Client-side API calls expose keys. (See `bug.md`).
2. **Storage**: Heavy media uses Base64, risking LocalStorage quotas.
3. **State**: Modularized hooks have reduced complexity, but heavy re-renders may still occur in the main `App` component due to shared state lifting.

## Admin System
- **Access**: Hybrid "First-Claim" model (LocalStorage owner check + Supabase backup).
- **Role**: Manage Affiliate Keywords, View Leads, and **Edit System Prompts**.
