
import { BusinessIdea, Blueprint, Language, ChatMessage, AgentProfile, Trend, LaunchAssets, ViabilityAudit, BMC, ContentWeek, BrandIdentity, CustomerPersona, PitchAnalysis } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { callOpenAI, OpenAIToolDefinition } from "./shared";
import { getLanguageInstruction } from "../../utils/promptUtils";
import { OPENAI_MODELS } from "../../constants/aiConfig";
import { promptService } from "../promptService";
import { 
  BusinessIdeaListSchema, 
  BlueprintSchema, 
  AgentProfileListSchema, 
  LaunchAssetsSchema, 
  ViabilityAuditSchema, 
  BMCSchema, 
  ContentCalendarSchema, 
  BrandIdentitySchema, 
  CustomerPersonaListSchema, 
  PitchAnalysisSchema 
} from "../../utils/schemas";

// OpenAI Tool Definition
const updateBlueprintToolDefinition: OpenAIToolDefinition = {
  type: "function",
  function: {
    name: "update_blueprint",
    description: "Update the business blueprint structure. Use this when the user asks to modify specific sections like marketing strategy, revenue streams, or the executive summary.",
    parameters: {
      type: "object",
      properties: {
        executiveSummary: { type: "string", description: "Updated Executive Summary text" },
        targetAudience: { type: "string", description: "Updated Target Audience description" },
        technicalStack: { type: "array", items: { type: "string" }, description: "Updated list of technologies" },
        marketingStrategy: { type: "array", items: { type: "string" }, description: "Updated list of marketing strategies" },
        revenueStreams: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              projected: { type: "number" }
            },
            required: ["name", "projected"]
          },
          description: "Updated list of revenue streams"
        }
      },
      additionalProperties: false
    }
  }
};

export const generateBusinessIdeas = async (niche: string, trends: any[], lang: Language): Promise<BusinessIdea[]> => {
  const langInstruction = getLanguageInstruction(lang);
  const trendsContext = trends.map(t => `${t.title} (${t.triggerEvent}): ${t.description}`).join("\n");
  
  const prompt = promptService.build('OPENAI_GENERATE_IDEAS', {
    niche,
    trendsContext,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }]);
  return BusinessIdeaListSchema.parse(JSON.parse(cleanJsonOutput(response.content || "[]"))) as BusinessIdea[];
};

export const generateSystemBlueprint = async (idea: BusinessIdea, lang: Language): Promise<Blueprint> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('OPENAI_GENERATE_BLUEPRINT', {
    name: idea.name,
    type: idea.type,
    description: idea.description,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.COMPLEX);
  const rawBlueprint = JSON.parse(cleanJsonOutput(response.content || "{}"));
  const validatedBlueprint = BlueprintSchema.parse(rawBlueprint);
  
  // Return validated blueprint; Orchestrator will handle Affiliate Injection
  return validatedBlueprint as Blueprint;
};

export const sendBlueprintChat = async (history: ChatMessage[], newMessage: string, context: Blueprint, lang: Language): Promise<{ text: string; updates?: Partial<Blueprint> }> => {
  const langInstruction = lang === 'id' ? "Reply in Indonesian." : "Reply in English.";
  
  const systemPrompt = promptService.build('CHAT_SYSTEM', {
    executiveSummary: context.executiveSummary,
    techStack: context.technicalStack.join(', '),
    revenueStreams: context.revenueStreams.map(r => r.name).join(', '),
    langInstruction
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: newMessage }
  ];

  const response = await callOpenAI(messages, OPENAI_MODELS.BASIC, {
    tools: [updateBlueprintToolDefinition]
  });

  let updates: Partial<Blueprint> | undefined;
  let responseText = response.content || "";

  if (response.tool_calls && response.tool_calls.length > 0) {
    const call = response.tool_calls[0];
    if (call.function.name === 'update_blueprint') {
      try {
        updates = JSON.parse(call.function.arguments);
        if (!responseText) {
          responseText = lang === 'id' 
            ? "Saya telah memperbarui blueprint sesuai permintaan Anda." 
            : "I have updated the blueprint with your changes.";
        }
      } catch (e) {
        console.error("Failed to parse tool arguments", e);
      }
    }
  }

  return { text: responseText, updates };
};

export const chatWithAgent = async (history: ChatMessage[], newMessage: string, agent: AgentProfile, lang: Language): Promise<string> => {
  const messages = [
    { role: "system", content: agent.systemPrompt },
    ...history,
    { role: "user", content: newMessage }
  ];

  const response = await callOpenAI(messages, OPENAI_MODELS.BASIC);
  return response.content || "";
};

export const chatWithResearchAnalyst = async (history: ChatMessage[], newMessage: string, niche: string, trends: Trend[], lang: Language): Promise<string> => {
  const langInstruction = getLanguageInstruction(lang);
  const trendsContext = trends.map(t => `- ${t.title} (${t.relevanceScore}% match): ${t.description}`).join("\n");
  
  const systemInstruction = promptService.build('RESEARCH_ANALYST', {
    niche,
    trendsContext,
    langInstruction
  });

  const messages = [
    { role: "system", content: systemInstruction },
    ...history,
    { role: "user", content: newMessage }
  ];

  const response = await callOpenAI(messages, OPENAI_MODELS.BASIC);
  return response.content || "";
};

export const generateTeamOfAgents = async (blueprint: Blueprint, lang: Language): Promise<AgentProfile[]> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = promptService.build('GENERATE_AGENTS', {
    executiveSummary: blueprint.executiveSummary,
    techStack: blueprint.technicalStack.join(', '),
    roadmap: JSON.stringify(blueprint.roadmap.slice(0, 3)),
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return AgentProfileListSchema.parse(JSON.parse(cleanJsonOutput(response.content || "[]"))) as AgentProfile[];
};

export const generateLaunchAssets = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<LaunchAssets> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = promptService.build('GENERATE_LAUNCH_ASSETS', {
    name: idea.name,
    type: idea.type,
    audience: blueprint.targetAudience,
    summary: blueprint.executiveSummary,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return LaunchAssetsSchema.parse(JSON.parse(cleanJsonOutput(response.content || "{}"))) as LaunchAssets;
};

export const conductViabilityAudit = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<ViabilityAudit> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = promptService.build('VIABILITY_AUDIT', {
    name: idea.name,
    type: idea.type,
    summary: blueprint.executiveSummary,
    techStack: blueprint.technicalStack.join(', '),
    revenue: blueprint.revenueStreams.map(r => r.name).join(', '),
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.COMPLEX);
  return ViabilityAuditSchema.parse(JSON.parse(cleanJsonOutput(response.content || "{}"))) as ViabilityAudit;
};

export const generateBMC = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BMC> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('GENERATE_BMC', {
    name: idea.name,
    summary: blueprint.executiveSummary,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return BMCSchema.parse(JSON.parse(cleanJsonOutput(response.content || "{}"))) as BMC;
};

export const generateLandingPageCode = async (idea: BusinessIdea, assets: LaunchAssets, lang: Language): Promise<string> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('GENERATE_CODE', {
    name: idea.name,
    type: idea.type,
    headline: assets.landingPage.headline,
    subheadline: assets.landingPage.subheadline,
    cta: assets.landingPage.cta,
    benefits: JSON.stringify(assets.landingPage.benefits),
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.COMPLEX);
  const text = response.content || "";
  return text.replace(/^```tsx?\s*/, '').replace(/\s*```$/, '');
};

export const generateContentCalendar = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<ContentWeek[]> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = promptService.build('GENERATE_CONTENT_CALENDAR', {
    name: idea.name,
    audience: blueprint.targetAudience,
    market: idea.type,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return ContentCalendarSchema.parse(JSON.parse(cleanJsonOutput(response.content || "[]"))) as ContentWeek[];
};

export const generateBrandIdentity = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BrandIdentity> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('GENERATE_BRAND_IDENTITY', {
    name: idea.name,
    type: idea.type,
    audience: blueprint.targetAudience,
    summary: blueprint.executiveSummary,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return BrandIdentitySchema.parse(JSON.parse(cleanJsonOutput(response.content || "{}"))) as BrandIdentity;
};

export const generatePersonas = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<CustomerPersona[]> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = promptService.build('GENERATE_PERSONAS', {
    name: idea.name,
    audience: blueprint.targetAudience,
    summary: blueprint.executiveSummary,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return CustomerPersonaListSchema.parse(JSON.parse(cleanJsonOutput(response.content || "[]"))) as CustomerPersona[];
};

export const analyzePitchTranscript = async (transcript: string, idea: BusinessIdea, blueprint: Blueprint, personaRole: string, lang: Language): Promise<PitchAnalysis> => {
  const langInstruction = getLanguageInstruction(lang);
  
  const prompt = promptService.build('ANALYZE_PITCH', {
    transcript,
    name: idea.name,
    summary: blueprint.executiveSummary,
    role: personaRole,
    langInstruction
  });

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.COMPLEX);
  return PitchAnalysisSchema.parse(JSON.parse(cleanJsonOutput(response.content || "{}"))) as PitchAnalysis;
};
