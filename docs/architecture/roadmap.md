
# Roadmap

## Phase 1-6: MVP to Advanced Features (Completed)
- [x] Basic UI & AI Integration (Gemini/OpenAI)
- [x] Visualization, Export, & Persistence
- [x] Community Features (Supabase, Directory, Voting)
- [x] Monetization (Affiliate Engine, Admin Panel)
- [x] Advanced Media (Veo Video, TTS Audio, Image Gen)
- [x] Live Pitch & Strategic Analysis Tools
- [x] **Agent Playground**: Interactive chat with generated AI Agents.

## Phase 7: Interactive Execution (Completed)
- [x] **Interactive Roadmap**: Track task completion directly within the blueprint view. Progress is saved automatically.

## Phase 8: Security & Infrastructure Hardening (CRITICAL - IN PROGRESS)
- [ ] **Secure API Proxy (P0)**: Move `services/gemini` and `services/openai` calls to Supabase Edge Functions. Remove `process.env.API_KEY` from client.
- [ ] **Strict RLS (P0)**: Implement and Verify Row Level Security policies in Supabase for `published_blueprints`, `saved_projects`, and `affiliate_products`.
- [ ] **Cloud Asset Storage (P1)**: Replace IndexedDB blob storage with Supabase Storage Buckets for public sharing of generated media.
- [ ] **Admin Migration (P1)**: Deprecate LocalStorage fallback for Admin locking completely.

## Phase 9: Performance & Scalability
- [x] **Render Optimization**: Implemented `React.memo` and `useMemo` for heavy components (`TrendAnalysis`, `BlueprintView`).
- [x] **UX Polish**: Upgraded "Trend Deep Dive" to a dedicated modal.
- [x] **IndexedDB Migration**: Implemented `idb` for local state persistence.
- [ ] **Server-State Management**: Implement TanStack Query (React Query) for efficient data fetching and caching.
- [ ] **Remote Config**: Move AI System Prompts to a database table to allow dynamic prompt engineering updates.

## Phase 10: Collaboration
- [ ] Shared workspaces for blueprint iteration.
- [ ] Real-time multiplayer editing of blueprints.
