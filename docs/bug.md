
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