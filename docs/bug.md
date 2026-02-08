
# Known Issues & Bugs

## Critical (Security)
- [/] **API Key Exposure**: `process.env.API_KEY` is currently used in client-side code (`services/gemini/shared.ts`, etc.). In a production build, this key is exposed to users. **Fix Required**: Migrate AI interactions to a backend proxy (e.g., Supabase Edge Functions). **STATUS**: BLOCKED - Environment Limitation.
  - Affected files: `services/gemini/shared.ts:5`, `services/gemini/media.ts:104`, `services/openai/shared.ts:49`, `services/openai/media.ts:7,42`
- [/] **API Key in URL**: `services/gemini/media.ts:105` appends API key directly to video download URL via `fetch(${downloadLink}&key=${process.env.API_KEY})`, exposing it in browser network logs, server logs, and request history. **Fix Required**: Route video downloads through Supabase Edge Function proxy to hide API key. **STATUS**: BLOCKED - Depends on Secure API Proxy implementation.

## Performance
- [x] bug: `useResearch` hook - `executeFreshAIResearch` and `executeSearchSequence` are not wrapped in `useCallback`, causing excessive re-renders. **FIXED**: Already wrapped in useCallback in useResearch.ts:80,108
- [x] bug: `useResearchPersistence.ts` - `Date.now()` used for asset keys can lead to collisions. **FIXED**: Replaced with crypto.randomUUID() for guaranteed uniqueness
- [x] bug: `vite.config.ts` is missing `SUPABASE_URL` and `SUPABASE_KEY` in the `define` object, breaking Supabase integration. **FIXED**: Already present in vite.config.ts:16-17
- [x] **Memory Usage**: Large generated assets (Veo Videos, Base64 Images) are stored in React State/LocalStorage, causing UI lag and potential crashes on low-memory devices. **STATUS**: Mitigated - Assets now stored in IndexedDB, Base64 conversion minimized.
- [x] **Render Cycles**: The `useResearch` hook triggers re-renders on the main `App` component frequently. **STATUS**: Fixed via useMemo in useResearch.ts

## Minor
- **Markdown Parsing**: Occasional styling inconsistencies if AI returns non-standard markdown tables.
- [x] **Bug: Toast timeout storage fails**: In `ToastNotifications.tsx:48`, attempting to store timeout ID on string ID `(id as any)._timeoutId = dismissTimeout` fails because strings are immutable. This prevents proper cleanup of toast timeouts. **FIXED**: Replaced with Map-based storage in ToastNotifications.tsx:35,55-61
- [x] **Bug: Missing dependency in useCallback**: `App.tsx:68` uses `uiText` inside `handleReset` callback but only includes `language` in dependency array. If `uiText` updates without `language` changing, callback uses stale closure. **FIXED**: Updated dependency array in App.tsx:68
- [x] **Bug: Error state race condition**: `useResearch.ts:73-75` sets errors from three engines without checking if other errors exist, causing them to overwrite each other. **FIXED**: Improved error collection logic in useResearch.ts:72-82
- [/] **Accessibility: Missing aria-labels**: Added aria-labels to key icon-only buttons (Modal close, ToastNotifications dismiss, AgentChatModal send, ResearchChat send). More buttons may need attention. **FIXED**: Added labels to critical buttons in Modal.tsx:99, ToastNotifications.tsx:111, AgentChatModal.tsx:90, ResearchChat.tsx:152
- [ ] **Accessibility: Icon-only buttons**: Several icon-only buttons throughout codebase still lack `aria-label` attributes for screen readers.
- [x] bug: `index.html` is missing entry point script tag (`index.tsx`).
- [x] bug: `App.tsx` has incorrect import path for `supabaseService` (`../services/supabaseService` instead of `./services/supabaseService`).
- [x] bug: Strict TypeScript errors in `SafeMarkdown.tsx` and AI service core files preventing successful production builds.
- [x] bug: Memory bloat in React state and IndexedDB due to large Base64 search images.
- [x] bug: Missing Vitest configuration for React 19 `act` causing console warnings during tests.
- [x] bug: ReferenceError: Cannot access 'handleSearch' before initialization in `App.tsx`.
- [x] bug: `handleRouting` in `App.tsx` does not wait for `isRestoring` to be false, potentially causing routing based on unhydrated state.
- [x] bug: ReferenceError: `initialImage` is not defined in `TrendSearch.tsx`.
- [x] bug: `SafeMarkdown` fails to render tables (missing `remark-gfm`).
- [x] bug: Unstable return objects/actions in `useResearch`, `useTrendEngine`, `useIdeaEngine`, and `useBlueprintEngine` causing excessive re-renders.
- [x] bug: Duplicate "Scroll to Top" buttons in `App.tsx` and `BlueprintView.tsx`.