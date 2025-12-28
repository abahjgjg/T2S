
export interface Trend {
  title: string;
  description: string;
  relevanceScore: number;
  triggerEvent: string; // Specific news headline or event
  date?: string; // New: Date of the event or news
  sources: { title: string; url: string }[];
  growthScore?: number; // Velocity/Hype (0-100)
  impactScore?: number; // Market Size/Potential (0-100)
  sentiment?: 'Positive' | 'Negative' | 'Neutral'; // New: Top-level sentiment
  deepDive?: TrendDeepDive; // Cached deep dive analysis
}

export interface TrendDeepDive {
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  keyEvents: { date: string; title: string; url?: string }[];
  futureOutlook: string; // Prediction for next 3-6 months
  actionableTips: string[]; // Strategic moves for entrepreneurs
  suggestedQuestions?: string[]; // New: AI-suggested follow-up questions for the chat
  keyPlayers?: string[]; // New: Companies or Figures involved
  provider?: 'gemini' | 'openai'; // New: Source attribution
}

export interface CompetitorAnalysis {
  name: string;
  website?: string;
  marketPosition: string; // e.g. "Premium Incumbent", "Low-cost disruptor"
  pricingStrategy: string;
  strengths: string[];
  weaknesses: string[];
}

export interface PlaceInfo {
  title: string;
  address: string;
  uri: string;
}

export interface LocationAnalysis {
  summary: string;
  places: PlaceInfo[];
}

export interface BusinessIdea {
  id: string;
  name: string;
  type: 'SaaS' | 'Agency' | 'Content' | 'E-commerce' | 'Platform';
  description: string;
  monetizationModel: string;
  difficulty: 'Low' | 'Medium' | 'High';
  potentialRevenue: string;
  rationale: string;
  competitors?: string[]; // New field: List of existing players in this space
  cachedBlueprint?: Blueprint; // If present, no AI generation needed
}

export interface AffiliateProduct {
  id: string;
  name: string;
  affiliateUrl: string;
  description: string;
  keywords: string[]; // e.g. ["hosting", "vps", "database"]
  clicks?: number; // Analytics tracking
}

export interface AgentProfile {
  role: string; // e.g. "SEO Specialist"
  name: string; // e.g. "Atlas"
  objective: string; // Short description of responsibility
  systemPrompt: string; // The actual prompt to copy-paste into an LLM
  recommendedTools: string[]; // e.g. "Google Search Console", "Python"
  suggestedTasks?: string[]; // New: Specific tasks this agent can execute immediately
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ContentPost {
  platform: 'LinkedIn' | 'Twitter' | 'Blog' | 'TikTok' | 'Instagram';
  content: string;
  type: 'Educational' | 'Promotional' | 'Personal' | 'Curated';
}

export interface ContentWeek {
  weekNumber: number;
  theme: string;
  posts: ContentPost[];
}

export interface LaunchAssets {
  landingPage: {
    headline: string;
    subheadline: string;
    cta: string;
    benefits: string[];
  };
  socialPost: string;
  emailPitch: string;
  landingPageCode?: string; // New: Generated React/Tailwind code
  contentCalendar?: ContentWeek[]; // New: 4-Week Plan
}

export interface ViabilityAudit {
  overallScore: number;
  dimensions: { name: string; score: number; comment: string }[];
  hardTruths: string[];
  pivotSuggestions: string[];
}

export interface BMC {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface BrandIdentity {
  names: string[];
  slogans: string[];
  colors: { name: string; hex: string }[];
  tone: string;
  brandValues: string[];
}

export interface CustomerPersona {
  name: string;
  age: string; // Range or specific number
  occupation: string;
  bio: string;
  painPoints: string[];
  goals: string[];
  channels: string[]; // e.g. Reddit, LinkedIn
  quote: string; // A representative quote
  avatarUrl?: string; // Optional generated image
}

export interface Blueprint {
  executiveSummary: string;
  targetAudience: string;
  technicalStack: string[];
  marketingStrategy: string[];
  revenueStreams: Array<{ name: string; projected: number }>;
  roadmap: Array<{ phase: string; tasks: string[] }>;
  fullContentMarkdown: string;
  affiliateRecommendations?: AffiliateProduct[]; // Injected by system
  agents?: AgentProfile[]; // AI Workforce
  brandImageUrl?: string; // New: Generated Logo/Brand Concept
  marketingVideoUrl?: string; // New: Generated Veo Video
  swot?: SWOTAnalysis; // New: Strategic analysis
  launchAssets?: LaunchAssets; // New: GTM Assets
  viabilityAudit?: ViabilityAudit; // New: VC-style audit
  roadmapProgress?: Record<string, boolean>; // New: Track completed tasks { "Task Name": true }
  bmc?: BMC; // New: Business Model Canvas
  brandIdentity?: BrandIdentity; // New: Brand Studio Data
  personas?: CustomerPersona[]; // New: Target Audience Profiles
}

export interface SavedProject {
  id: string;
  timestamp: number;
  niche: string;
  idea: BusinessIdea;
  blueprint: Blueprint;
  user_id?: string; // Optional for cloud saves
}

export interface PublishedBlueprint {
  id: string;
  created_at: string;
  niche: string;
  title: string;
  summary: string;
  full_data: {
    idea: BusinessIdea;
    blueprint: Blueprint;
  };
  votes?: number; // Added field for community upvotes
  user_id?: string; // ID of the user who published this
}

export interface Lead {
  id: string;
  blueprintId: string;
  email: string;
  createdAt: string;
  sourceTitle?: string; // Optional: title of the idea they subscribed to
}

export interface Comment {
  id: string;
  blueprint_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface UserProfile {
  id: string;
  email: string;
}

export type AppState = 'IDLE' | 'RESEARCHING' | 'ANALYZING' | 'BLUEPRINTING' | 'VIEWING' | 'VIEWING_PUBLIC' | 'DIRECTORY' | 'ADMIN' | 'DASHBOARD';

export interface SearchState {
  niche: string;
  trends: Trend[];
  ideas: BusinessIdea[];
  selectedIdea: BusinessIdea | null;
  currentBlueprint: Blueprint | null;
  error: string | null;
}

export type Language = 'id' | 'en';

export type AIProvider = 'gemini' | 'openai';

export type SearchRegion = 'Global' | 'Indonesia' | 'USA' | 'Europe' | 'Asia';

export type SearchTimeframe = '24h' | '7d' | '30d' | '90d';

export interface AIService {
  fetchMarketTrends(niche: string, lang: Language, region?: SearchRegion, timeframe?: SearchTimeframe): Promise<Trend[]>;
  getTrendDeepDive(trend: string, niche: string, lang: Language): Promise<TrendDeepDive>;
  generateBusinessIdeas(niche: string, trends: Trend[], lang: Language): Promise<BusinessIdea[]>;
  generateSystemBlueprint(idea: BusinessIdea, lang: Language): Promise<Blueprint>;
  generateVoiceSummary(text: string, lang: Language): Promise<string | null>; // Returns Base64 string or null if not supported
  sendBlueprintChat(history: ChatMessage[], newMessage: string, context: Blueprint, lang: Language): Promise<{ text: string; updates?: Partial<Blueprint> }>;
  generateTeamOfAgents(blueprint: Blueprint, lang: Language): Promise<AgentProfile[]>;
  chatWithAgent(history: ChatMessage[], newMessage: string, agent: AgentProfile, lang: Language): Promise<string>;
  chatWithResearchAnalyst(history: ChatMessage[], newMessage: string, niche: string, trends: Trend[], lang: Language): Promise<string>; 
  generateBrandImage(ideaName: string, description: string, style: string): Promise<string | null>; // Returns Base64 string of image
  generateMarketingVideo(ideaName: string, description: string, lang: Language): Promise<Blob | null>; // Returns Blob (for persistence) or null
  analyzeCompetitor(name: string, niche: string, lang: Language): Promise<CompetitorAnalysis>;
  scoutLocation(businessType: string, location: string, lang: Language): Promise<LocationAnalysis>;
  generateLaunchAssets(idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<LaunchAssets>; 
  conductViabilityAudit(idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<ViabilityAudit>;
  generateBMC(idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BMC>;
  generateLandingPageCode(idea: BusinessIdea, assets: LaunchAssets, lang: Language): Promise<string>;
  generateContentCalendar(idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<ContentWeek[]>;
  generateBrandIdentity(idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BrandIdentity>; 
  generatePersonas(idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<CustomerPersona[]>; // New
}