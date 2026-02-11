
# Agent Context & Decisions

## Context
TrendVentures AI is a "System Generator" that uses Gemini 2.5 Flash for speed and Gemini 3 Pro (Thinking) for deep reasoning.
The goal is to help users generate "Money-Making Systems" (Business Blueprints) based on real-time trends.

## ⚠️ CRITICAL OPERATIONAL RULES (NEW)
1. **NO CLIENT-SIDE SECRETS**: Do **NOT** write code that accesses `process.env.API_KEY` or similar secrets within files meant for the browser (components, hooks, client services). All AI interaction must eventually move to a server-side proxy.
2. **MEDIA HANDLING**: Do **NOT** store large media assets (Video/Images) in LocalStorage or React State as Base64. Use `Blob` URLs for temporary display or upload to Cloud Storage.
3. **AUTH VALIDATION**: Do **NOT** rely on LocalStorage for permission checks (Admin access). Always verify permissions against the auth provider (Supabase) server-side or via RLS.
4. **MARKDOWN RENDERING**: Do **NOT** use `ReactMarkdown` directly in any component. Always use the `SafeMarkdown` component to ensure XSS protection (protocol whitelisting) and consistent styling.
5. **TESTING MANDATE**: Any new logic added to `services/` or `utils/` MUST have a corresponding `.test.ts` file. **Complex Custom Hooks (e.g., Engines) MUST have integration tests.**
6. **AUDIO STABILITY**: Changes to `audioUtils.ts` MUST be verified against the unit test suite to prevent breaking the Live API PCM stream format.

## Architecture Decisions
- **Live API Integration**: 
  - Uses `gemini-2.5-flash-native-audio-preview-09-2025` for low-latency conversational roleplay ("Pitch Practice").
  - Implements **raw PCM streaming** via WebSocket (`ai.live.connect`).
  - **Audio Pipeline**: Browser MediaStream -> Float32 -> Int16 -> Base64 -> Gemini.
  - **Personas**: The system supports multiple configurable personas (VC, Customer, CTO). The system instruction is dynamically injected based on user selection.
- **Cache-First Strategy**: Check Supabase for existing blueprints before querying AI.
- **Affiliate Injection (Hybrid)**: 
  - We do *not* ask the AI to invent affiliate products (hallucination risk).
  - Instead, we use a deterministic **Keyword Matching** system (`affiliateService`).
- **Resilience**: A `retryOperation` utility handles all AI calls.
- **Voting System**:
  - Implemented as a simple counter in Supabase.
  - No auth requirement (Low friction), uses LocalStorage to prevent multi-voting from the same browser.
- **Authentication**:
  - Uses Supabase Auth for user management.
  - Implements a hybrid storage model: `saved_projects` (Cloud) vs LocalStorage (Local).
  - UI adapts to show "Cloud Saves" tab only when logged in.
- **Security (Admin)**:
  - Moved from hardcoded password to **Identity-Based Access**.
  - Uses a "First-Claim" model: The first authenticated user to access `/admin` on a device sets their email as the Owner (in LocalStorage).
  - Subsequent access requires matching that email.
- **Multi-Modal Generation**:
  - The system now supports **Image Generation** (`gemini-2.5-flash-image` and DALL-E) to create brand concepts/logos.
  - Images are stored as Base64 within the Blueprint JSON to ensure portability, with safety checks for storage quotas.

## Current State (Phase 14)
The application is a comprehensive **AI-Powered Market Intelligence Suite** with advanced features across all phases:

### Core Features
- **Admin Panel**: Accessible at `/admin`. Secured via Supabase Auth with Identity-Based Access.
- **Monetization**: Blueprints automatically recommend tools via deterministic keyword matching (`affiliateService`).
- **Pitch Mode**: Real-time voice roleplay with AI personas (VC, Customer, CTO) using WebSocket PCM streaming.
- **Competitor Analysis**: Real-world competitor research with strategic positioning.
- **Strategic Analysis**: Automatic **SWOT Analysis** generation for every blueprint.
- **Directory**: SEO-optimized public showcase of generated blueprints with voting system.
- **User Accounts**: Cloud sync via Supabase with hybrid LocalStorage + IndexedDB storage.

### Advanced Features (Phases 7-14)
- **Interactive Roadmap**: Track task completion with automatic progress saving.
- **Revenue Simulator**: Interactive financial modeling with growth scenarios.
- **One-Click Pivot**: Apply audit suggestions to automatically rewrite blueprints.
- **Presentation Mode**: Auto-generated slide decks for investor pitching.
- **Content Calendar**: 30-day AI-generated marketing plan with platform-specific posts.
- **Brand Studio**: AI-powered business names, slogans, color palettes, and brand tone generation.
- **Customer Personas**: Deep-dive ICP profiles with avatars, pain points, and goals.
- **Prototype Coder**: Generate React/Tailwind code for landing pages.
- **Professional Print Engine**: High-fidelity PDF exports (A4/Letter) with cover pages.
- **Visual Branding**: AI-generated logos and brand identities (Gemini + DALL-E).

## Next Steps
- **Security Hardening**: Migrate AI Service calls to Supabase Edge Functions.
- **Advanced Analytics**: Track click-through rate (CTR) or source of clicks.
- **Open Graph**: Improve social sharing previews.

## Known Constraints
- **Cloud Storage**: Relying on `saved_projects` table. If the user hosting this app has not created this table in Supabase, the feature will gracefully degrade (show error message) while keeping local storage functional.
- **Admin Security**: The current Admin Owner check relies on LocalStorage for the "Authorized Email" configuration. Clearing browser data will reset the owner, allowing a new claim. In a production environment, this authorized email list should be stored in a secured Supabase table with RLS.
- **LocalStorage Limits**: Storing multiple Base64 images may hit the 5MB LocalStorage limit. The app has a try-catch block to warn users, but heavy usage requires Cloud saving.

## Audit Updates (Phase 2)
- **Compliance**: Added Hook Testing mandate.
- **Action**: `useTrendEngine.test.tsx` implemented.
