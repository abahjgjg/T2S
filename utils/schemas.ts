
import { z } from 'zod';

// --- Trend Schemas ---
export const TrendSchema = z.object({
  title: z.string(),
  description: z.string(),
  relevanceScore: z.number(),
  growthScore: z.number().optional(),
  impactScore: z.number().optional(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']).or(z.string().transform(s => s as any)).optional(), 
  triggerEvent: z.string(),
  date: z.string().optional(), // New field
});

export const TrendListSchema = z.array(TrendSchema);

export const TrendDeepDiveSchema = z.object({
  summary: z.string(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']).or(z.string().transform(s => s as 'Positive' | 'Negative' | 'Neutral')),
  keyEvents: z.array(z.object({
    date: z.string(),
    title: z.string(),
    url: z.string().optional()
  })),
  futureOutlook: z.string(),
  actionableTips: z.array(z.string()),
  suggestedQuestions: z.array(z.string()).optional(),
  keyPlayers: z.array(z.string()).optional(), // New field
  provider: z.enum(['gemini', 'openai']).optional() // Added field
});

// --- Idea Schemas ---
export const BusinessIdeaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['SaaS', 'Agency', 'Content', 'E-commerce', 'Platform']).or(z.string().transform(s => s as any)),
  description: z.string(),
  monetizationModel: z.string(),
  difficulty: z.enum(['Low', 'Medium', 'High']).or(z.string().transform(s => s as any)),
  potentialRevenue: z.string(),
  rationale: z.string(),
  competitors: z.array(z.string()).optional(),
});

export const BusinessIdeaListSchema = z.array(BusinessIdeaSchema);

// --- Blueprint Schemas ---
export const BlueprintSchema = z.object({
  executiveSummary: z.string(),
  targetAudience: z.string(),
  technicalStack: z.array(z.string()),
  marketingStrategy: z.array(z.string()),
  revenueStreams: z.array(z.object({
    name: z.string(),
    projected: z.number()
  })),
  roadmap: z.array(z.object({
    phase: z.string(),
    tasks: z.array(z.string())
  })),
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string())
  }),
  fullContentMarkdown: z.string(),
  roadmapProgress: z.record(z.string(), z.boolean()).optional(),
});

// --- Audit Schemas ---
export const ViabilityAuditSchema = z.object({
  overallScore: z.number(),
  dimensions: z.array(z.object({
    name: z.string(),
    score: z.number(),
    comment: z.string()
  })),
  hardTruths: z.array(z.string()),
  pivotSuggestions: z.array(z.string())
});

// --- Agent Schemas ---
export const AgentProfileSchema = z.object({
  role: z.string(),
  name: z.string(),
  objective: z.string(),
  systemPrompt: z.string(),
  recommendedTools: z.array(z.string()),
  suggestedTasks: z.array(z.string()).optional()
});

export const AgentProfileListSchema = z.array(AgentProfileSchema);