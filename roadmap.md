
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

## Phase 8: Security & Infrastructure Hardening (CRITICAL PRIORITY)
- [ ] **Secure API Proxy (P0)**: Move all AI calls (`geminiService`, `openaiService`) to Supabase Edge Functions to hide API Keys.
- [ ] **Strict RLS (P0)**: Implement Row Level Security policies in Supabase for Admin and User data protection.
- [ ] **Asset Offloading (P1)**: Stop storing Base64 media in LocalStorage. Upload generated assets (Images/Videos) to Supabase Storage Buckets.
- [ ] **Admin Migration (P1)**: Move Admin "Owner" logic from LocalStorage to a protected database table.
- [ ] **State Optimization**: Refactor `useResearch` hook into smaller, domain-specific hooks to reduce re-renders.

## Phase 9: Performance & Scalability
- [x] **Render Optimization**: Implemented `React.memo` and `useMemo` for heavy components (`TrendAnalysis`, `BlueprintView`) to reduce main-thread blocking.
- [x] **UX Polish**: Upgraded "Trend Deep Dive" to a dedicated modal with visual timelines and sentiment badges.
- [ ] **Server-State Management**: Implement TanStack Query (React Query) for efficient data fetching and caching.
- [ ] **IndexedDB Migration**: Move local fallback storage from LocalStorage (5MB limit) to IndexedDB for offline capability.
- [ ] **Remote Config**: Move AI System Prompts to a database table to allow dynamic prompt engineering updates.

## Phase 10: Collaboration
- [ ] Shared workspaces for blueprint iteration.
- [ ] Real-time multiplayer editing of blueprints.
