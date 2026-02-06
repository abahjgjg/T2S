
# Task List

## Security & Infrastructure (Priority: P0 - Critical)
- [ ] **[ARCH] Secure API Proxy**: Move `services/gemini` and `services/openai` calls to Supabase Edge Functions. Remove `process.env.API_KEY` from client. **(BLOCKED: Environment Limitation)**

## Optimization & Refinement (Active)
- [x] **[UX] Dynamic Market Ticker**: `TrendSearch` ticker now reflects recent user search history for personalization.
- [x] **[AI] Real-Time Prompting**: Strengthened `fetchMarketTrends` system instruction to aggressively prioritize breaking news when using short timeframes.
- [x] **[UX] Modal Focus Trap**: Added focus management to Modal component for accessibility - traps keyboard navigation, restores focus on close, focuses first element on open.
- [x] **[ARCH] Animation Config**: Centralized animation timing constants (`ANIMATION_TIMING`, `ANIMATION_EASING`) in `uiConfig.ts` to eliminate hardcoded values in components (Modal, ToastNotifications).
- [x] **[CONSOLIDATE] Empty State Component**: Created reusable `EmptyState` component to replace duplicate loading state patterns across BrandStudio, BlueprintLaunchpad, and CustomerPersonas.

## Completed
- [x] **[DOCS] User & Developer Guides**: Created comprehensive documentation (`docs/USER_GUIDE.md`, `docs/DEVELOPER_GUIDE.md`).
- [x] **[FEAT] Customer Personas**: Implemented AI generation of ICP profiles with visual avatars (`components/CustomerPersonas.tsx`).
- [x] **[FEAT] Trend Discovery Categories**: Implemented categories in `TrendSearch` for instant research.
- [x] **[FEAT] Agent Workflows**: Upgraded Autonomous AI Team with Task Delegation, Editing, and Custom Agents.
- [x] **[FEAT] Brand Studio**: Implemented name/slogan/color generation in `BrandStudio.tsx`.
- [x] **[FEAT] Content Calendar**: Implement 30-Day Content Plan Generator in `BlueprintLaunchpad`.
- [x] **[FEAT] Prototype Coder**: Implement `generateLandingPageCode` and code viewer in `BlueprintLaunchpad`.
- [x] **[FEAT] Smart Library Search**: Implemented search and filtering in `ProjectLibrary.tsx`.
- [x] **[FEAT] Presentation Mode**: Implement slide deck viewer in `BlueprintView`.
- [x] **[ARCH] Strict RLS**: Implemented schema and policies in `supabase/schema.sql`.
- [x] **[ARCH] Local Telemetry**: Implemented `telemetryService` and Admin Viewer.
- [x] **[FEAT] Cloud Asset Storage**: Implemented `uploadPublicAsset`.
- [x] **[UI/UX] Provider Consistency**: Dynamic provider attribution.
- [x] **[FEAT] Revenue Simulator**: Interactive modeling.
- [x] **[FEAT] One-Click Pivot**: AI Chat pivot execution.
- [x] **[FEAT] Business Model Canvas**: Interactive 9-block view.
- [x] **[ARCH] Server-State Management**: TanStack Query implementation.
- [x] **[PERF] Asset Offloading**: IndexedDB/Storage integration.
- [x] **[REFACTOR] Strict Typing**: Cleanup of `any` types.
- [x] **[TEST] Unit Tests**: Comprehensive coverage for utils and hooks.
- [x] error: Memory usage issues with large assets (Videos/Images in LocalStorage). **STATUS**: Mitigated - Assets now stored in IndexedDB, Base64 conversion minimized.
- [x] error: `useResearch` saves state too frequently (currently 3s), should be increased to 5s for better performance.
- [x] error: `useResearch` triggers excessive re-renders in `App.tsx`. (Fixed via useMemo in useResearch.ts)