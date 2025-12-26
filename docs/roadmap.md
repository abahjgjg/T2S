


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
- [x] **Revenue Simulator**: Interactive financial modeling with growth scenarios.
- [x] **One-Click Pivot**: Apply audit suggestions to automatically rewrite the blueprint.
- [x] **Presentation Mode**: Auto-generate a slide deck from the blueprint for investor pitching.

## Phase 8: Security & Infrastructure Hardening
- [ ] **Secure API Proxy (P0)**: Move all AI calls (`geminiService`, `openaiService`) to Supabase Edge Functions. Remove `process.env.API_KEY` from client. (BLOCKED)
- [x] **Strict RLS (P0)**: Implement Row Level Security policies in Supabase for Admin and User data protection.
- [x] **Local Telemetry (P1)**: Implemented client-side error logging visible in Admin Panel.
- [x] **Asset Offloading (P1)**: Upload generated assets (Images/Videos) to Supabase Storage Buckets.

## Phase 9: Performance & Scalability (Completed)
- [x] **Render Optimization**: Implemented `React.memo` and `useMemo` for heavy components (`TrendAnalysis`, `BlueprintView`).
- [x] **UX Polish**: Upgraded "Trend Deep Dive" to a dedicated modal.
- [x] **IndexedDB Migration**: Implemented `idb` for local state persistence.
- [x] **Server-State Management**: Implement TanStack Query (React Query) for efficient data fetching and caching.
- [x] **Remote Config**: System Prompts can be managed via Supabase `system_prompts` table.
- [x] **Library Management**: Implemented Smart Search and Filtering for Saved Projects.

## Phase 10: Collaboration (Future)
- [ ] Shared workspaces for blueprint iteration.
- [ ] Real-time multiplayer editing of blueprints.

## Phase 11: Code Generation (Completed)
- [x] **Prototype Coder**: Generate React/Tailwind code for landing pages based on Launch Assets.

## Phase 12: Growth Operations (Completed)
- [x] **Content Calendar**: AI generates a 30-day marketing plan with platform-specific posts.

## Phase 13: Brand Strategy (Active)
- [x] **Brand Studio**: AI-powered generation of Business Names, Slogans, Color Palettes, and Brand Tone.