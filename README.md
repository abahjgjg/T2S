# TrendVentures AI

An AI-powered market intelligence suite that generates business blueprints from real-time news and trends.

## Features

- **AI-Powered Market Intelligence**: Leverages Gemini and OpenAI to analyze real-time trends
- **Business Blueprint Generation**: Creates comprehensive business plans with roadmaps, revenue models, and SWOT analysis
- **Live Pitch Practice**: Real-time voice roleplay with AI personas (VC, Customer, CTO)
- **Visual Branding Tools**: AI-generated logos, brand identities, and color palettes
- **Competitor Analysis**: Real-world competitor research and strategic positioning
- **Content Calendar**: 30-day marketing plan generation
- **Cloud Sync**: Save and manage projects with Supabase integration
- **Community Directory**: Public showcase of generated blueprints

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query) + React Context
- **Database/Auth**: Supabase (PostgreSQL, GoTrue, Storage)
- **AI Providers**: 
  - Google Gemini (via @google/genai)
  - OpenAI (via REST API)
- **Visualization**: Recharts
- **Testing**: Vitest

## Prerequisites

- Node.js 22+ (specified in `.node-version`)
- npm or yarn

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:

   The project uses two environment files:

   **`.env`** - Public configuration (committed, safe to share)
   - Contains only `VITE_` prefixed variables (SEO, URLs, theme colors)
   - These are injected at build time and visible in browser
   - Already configured with sensible defaults

   **`.env.local`** - Private secrets (NEVER commit, create this file):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run test` - Run Vitest tests
- `npm run lint` - ESLint checking
- `npm run typecheck` - TypeScript type checking

## Documentation

- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Architecture, setup, and development guidelines
- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [Agent Context](AGENTS.md) - AI agent operational rules and decisions
- [Blueprint](docs/blueprint.md) - Technical architecture overview
- [Roadmap](docs/roadmap.md) - Feature roadmap and completed phases

## Project Structure

```
├── components/       # React components (organized by feature)
│   ├── admin/       # Admin panel components
│   ├── blueprint/   # Blueprint-specific components
│   └── ui/          # Shared UI components
├── constants/       # Configuration and system prompts
├── contexts/        # React context providers
├── docs/           # Documentation
├── hooks/          # Custom React hooks (engines)
├── services/       # API services
│   ├── gemini/     # Gemini-specific implementation
│   ├── openai/     # OpenAI-specific implementation
│   └── supabase/   # Supabase service modules
├── utils/          # Utility functions
├── src/            # CSS assets only
├── types.ts        # TypeScript type definitions
├── App.tsx         # Main application component
├── index.tsx       # Application entry point
├── vite.config.ts  # Vite configuration
└── viteBuildConfig.ts  # Build optimization settings
```

## Testing

Run the test suite:
```bash
npm run test
```

Key test files:
- `utils/securityUtils.test.ts` - Input sanitization
- `services/promptService.test.ts` - Prompt interpolation
- `hooks/*.test.tsx` - Engine integration tests

## Deployment

The app is built as a static SPA:
```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host. Ensure environment variables are configured in your hosting provider.

## Security Notes

- All user inputs are sanitized via `utils/securityUtils.ts`
- Markdown is rendered through `SafeMarkdown` component with XSS protection
- Supabase tables use Row Level Security (RLS) policies
- Client-side API calls are planned to migrate to Supabase Edge Functions (see roadmap)

## License

Private - See repository owner for licensing information.
