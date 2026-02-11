# Task List

## Security & Infrastructure (Priority: P0 - Critical)
- [ ] **[ARCH] Secure API Proxy**: Move `services/gemini` and `services/openai` calls to Supabase Edge Functions. Remove `process.env.API_KEY` from client. **(BLOCKED: Environment Limitation)**

## Active Tasks
- [ ] **[A11Y] Icon-only buttons**: Add aria-label attributes to remaining icon-only buttons throughout the codebase.
- [ ] **[A11Y] Markdown table styling**: Improve handling of non-standard markdown tables from AI responses.

---

## Completed Tasks Archive

### Optimization & Refinement
- [x] **[UX] Dynamic Market Ticker**: `TrendSearch` ticker now reflects recent user search history for personalization.
- [x] **[AI] Real-Time Prompting**: Strengthened `fetchMarketTrends` system instruction to aggressively prioritize breaking news when using short timeframes.
- [x] **[UX] Modal Focus Trap**: Added focus management to Modal component for accessibility - traps keyboard navigation, restores focus on close, focuses first element on open.
- [x] **[ARCH] Animation Config**: Centralized animation timing constants (`ANIMATION_TIMING`, `ANIMATION_EASING`) in `uiConfig.ts` to eliminate hardcoded values in components (Modal, ToastNotifications).
- [x] **[CONSOLIDATE] Empty State Component**: Created reusable `EmptyState` component to replace duplicate loading state patterns across BrandStudio, BlueprintLaunchpad, and CustomerPersonas.
- [x] **[UX] Skip to Content**: Added accessibility "Skip to Content" link for keyboard navigation in App.tsx.
- [x] **[ARCH] Border Radius Config**: Centralized border radius constants (`BORDER_RADIUS`) in `uiConfig.ts` for design system consistency.

### Documentation
- [x] **[DOCS] User & Developer Guides**: Created comprehensive documentation (`docs/USER_GUIDE.md`, `docs/DEVELOPER_GUIDE.md`).

### Features (Phase 6-14)
- [x] **[FEAT] Customer Personas**: Implemented AI generation of ICP profiles with visual avatars (`components/CustomerPersonas.tsx`).
- [x] **[FEAT] Trend Discovery Categories**: Implemented categories in `TrendSearch` for instant research.
- [x] **[FEAT] Agent Workflows**: Upgraded Autonomous AI Team with Task Delegation, Editing, and Custom Agents.
- [x] **[FEAT] Brand Studio**: Implemented name/slogan/color generation in `BrandStudio.tsx`.
- [x] **[FEAT] Content Calendar**: Implement 30-Day Content Plan Generator in `BlueprintLaunchpad`.
- [x] **[FEAT] Prototype Coder**: Implement `generateLandingPageCode` and code viewer in `BlueprintLaunchpad`.
- [x] **[FEAT] Smart Library Search**: Implemented search and filtering in `ProjectLibrary.tsx`.
- [x] **[FEAT] Presentation Mode**: Implement slide deck viewer in `BlueprintView`.
- [x] **[FEAT] Interactive Roadmap**: Track task completion directly within the blueprint view with automatic progress saving.
- [x] **[FEAT] Revenue Simulator**: Interactive financial modeling with growth scenarios.
- [x] **[FEAT] One-Click Pivot**: Apply audit suggestions to automatically rewrite the blueprint.
- [x] **[FEAT] Business Model Canvas**: Interactive 9-block view.

### Architecture & Infrastructure
- [x] **[ARCH] Strict RLS**: Implemented schema and policies in `supabase/schema.sql`.
- [x] **[ARCH] Local Telemetry**: Implemented `telemetryService` and Admin Viewer.
- [x] **[ARCH] Server-State Management**: TanStack Query implementation.
- [x] **[PERF] Asset Offloading**: IndexedDB/Storage integration.
- [x] **[REFACTOR] Strict Typing**: Cleanup of `any` types.
- [x] **[TEST] Unit Tests**: Comprehensive coverage for utils and hooks.

### Performance Fixes
- [x] Memory usage issues with large assets (Videos/Images in LocalStorage). **STATUS**: Mitigated - Assets now stored in IndexedDB, Base64 conversion minimized.
- [x] `useResearch` saves state too frequently (currently 3s), should be increased to 5s for better performance.
- [x] `useResearch` triggers excessive re-renders in `App.tsx`. (Fixed via useMemo in useResearch.ts)
- [x] Missing environment variables in Vite `define` config for Supabase. **FIXED**: Already present in vite.config.ts:16-17
- [x] Potential memory leak/performance issue in `useResearchPersistence` due to `JSON.parse(JSON.stringify(state))`. **FIXED**: Replaced with structuredClone() for better performance
- [x] Excessive re-renders in `App.tsx` due to unstable hook return objects.
