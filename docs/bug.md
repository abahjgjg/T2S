
# Known Issues & Bugs

## Critical (Security)
- **API Key Exposure**: `process.env.API_KEY` is currently used in client-side code (`services/gemini/shared.ts`, etc.). In a production build, this key is exposed to users. **Fix Required**: Migrate AI interactions to a backend proxy (e.g., Supabase Edge Functions).

## Performance
- **Memory Usage**: Large generated assets (Veo Videos, Base64 Images) are stored in React State/LocalStorage, causing UI lag and potential crashes on low-memory devices.
- **Render Cycles**: The `useResearch` hook triggers re-renders on the main `App` component frequently.

## Minor
- **Markdown Parsing**: Occasional styling inconsistencies if AI returns non-standard markdown tables.
- [x] bug: `index.html` is missing entry point script tag (`index.tsx`).
- [x] bug: `App.tsx` has incorrect import path for `supabaseService` (`../services/supabaseService` instead of `./services/supabaseService`).
- [x] bug: Strict TypeScript errors in `SafeMarkdown.tsx` and AI service core files preventing successful production builds.
- [x] bug: Memory bloat in React state and IndexedDB due to large Base64 search images.
- [x] bug: Missing Vitest configuration for React 19 `act` causing console warnings during tests.
- [x] bug: ReferenceError: Cannot access 'handleSearch' before initialization in `App.tsx`.
- [x] bug: `handleRouting` in `App.tsx` does not wait for `isRestoring` to be false, potentially causing routing based on unhydrated state.
- [x] bug: ReferenceError: `initialImage` is not defined in `TrendSearch.tsx`.