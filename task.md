
# Task List

## Security & Infrastructure (Priority: P0 - Critical)
- [ ] **Secure API Proxy**: Create Supabase Edge Functions to handle `generateContent` and `chat` requests. Remove `process.env.API_KEY` from client bundle.
- [ ] **Strict RLS**: Apply RLS policies to `published_blueprints`, `saved_projects`, and `affiliate_products`.
- [x] **Admin Security**: Refactored Admin ownership to use a `profiles` table with an `is_admin` flag, rather than LocalStorage locking.

## Performance & Optimization (Priority: P1 - High)
- [x] **Asset Offloading**: Implemented `indexedDBService` for local asset storage (`assets` store) and `asset://` protocol resolution for Veo videos to prevent data loss on reload.
- [x] **IndexedDB**: Implemented `idb` based storage for `trendventures_state_v1` and `trendventures_library_v1`.
- [ ] **Caching**: Replace manual `useEffect` fetching with `useQuery` (TanStack Query) for `fetchMarketTrends` and directory listings.

## Completed
- [x] **Research Accuracy**: Inject live date context into OpenAI prompts and UI to ensure "Latest News" relevance.
- [x] **Refactor**: Split `useResearch.ts` into `useTrendEngine.ts`, `useIdeaEngine.ts`, and `useBlueprintEngine.ts`.
- [x] **Refactor**: Modularize `supabaseService.ts` into domain-specific modules.
- [x] **Refactor**: Extract `BlueprintView.tsx` logic into `useVoiceSummary` and `useBlueprintMedia` hooks.
- [x] **Refactor**: Live Pitch Service now uses centralized PromptService and safe AI client initialization.
- [x] **Componentization**: Extracted atomic sub-components (`BlueprintCompetitors`, `BlueprintStrategies`, `BlueprintAffiliates`) from `BlueprintView`.
- [x] **Sanitize AI Configs**: Ensure strict adherence to Live API SDK guidelines for transcription and modalities.
- [x] **Region-Aware Research**: Added "Target Market" selector to focus AI on specific geographical trends.
- [x] **Agent Playground**: Implemented interactive chat for testing AI Agents.
- [x] **Validation**: Add `zod` schema validation for all AI JSON responses.
- [x] **Prompt Management**: Create an Admin UI to edit System Prompts dynamically.
- [x] **Live News Visualization**: Added News Ticker and enhanced News Wire feed for better research UX.
- [x] **Interactive Roadmap**: Added checkboxes and progress tracking to the Execution Roadmap.
- [x] **Quick Trend Search**: Added "Global Trends" button for rapid research initiation.
- [x] **Core Features**: Trends, Blueprints, Affiliates, Directory, Admin, Live Pitch.
- [x] **Modules**: Gemini/OpenAI Service separation.
- [x] **Visuals**: Charts, Markdown rendering, UI Components.