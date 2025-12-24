
# Task List

## Security & Infrastructure (Priority: P0 - Critical)
- [ ] **[ARCH] Secure API Proxy**: Move `services/gemini` and `services/openai` calls to Supabase Edge Functions. Remove `process.env.API_KEY` from client.
- [ ] **[ARCH] Strict RLS**: Implement and Verify Row Level Security policies.
- [x] **[FIX] Input Sanitization**: Hardened `utils/securityUtils.ts` against XSS and Prompt Injection vectors.
- [x] **[FIX] Output Hardening**: Implemented Safe Markdown rendering to prevent XSS via AI links.
- [x] **[FIX] Chat Module Security**: Replaced raw `react-markdown` with `SafeMarkdown` in all chat/modal components.
- [x] **[ARCH] Centralize Markdown Rendering**: Refactored `BlueprintView` and `PublicBlogView` to use `SafeMarkdown` (DRY compliance).

## Performance & Optimization (Priority: P2 - Medium)
- [x] **[ARCH] Server-State Management**: Implement TanStack Query foundation and migrate `Directory` and `UserDashboard`.
- [x] **[ARCH] Server-State Management (Phase 2)**: Migrate `TrendSearch` (Trend Engine) to `useQuery` for unified state.
- [x] **[PERF] Asset Offloading**: Completed offloading for both Video (Veo) and Images (Imagen/DALL-E) to IndexedDB using `asset://` protocol.

## Completed
- [x] **[PERF] Image Asset Offloading**: Refactored `useBlueprintMedia` to store generated logos as Blobs in IndexedDB.
- [x] **[PERF] Trend Engine Migration**: Refactored `hooks/useTrendEngine.ts` to use TanStack Query.
- [x] **[UI/FE] I18n Consistency**: Externalize hardcoded loading texts and search triggers in `TrendSearch.tsx` to `constants/translations.tsx`.
- [x] **[ARCH] Config Centralization**: Refactor `TrendSearch.tsx` to use `constants/searchConfig.ts`.
- [x] **[UI] Accessibility**: Add `aria-label` to interactive elements in `TrendSearch`.
- [x] **[FIX] Admin Hardening**: Remove `localStorage` fallback in `services/supabase/admin.ts`.
- [x] **[ARCH] Asset Offloading**: Implemented `indexedDBService`.
- [x] **[ARCH] IndexedDB**: Implemented `idb` based storage.
- [x] **[PERF] Dashboard Migration**: Migrated `UserDashboard.tsx` to TanStack Query for optimistic updates and caching.
