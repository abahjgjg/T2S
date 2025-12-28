


import { BusinessIdea, Blueprint, Language, ChatMessage, AgentProfile, Trend, LaunchAssets, ViabilityAudit, BMC, ContentWeek, BrandIdentity, CustomerPersona } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { affiliateService } from "../affiliateService";
import { callOpenAI, getLanguageInstruction, OpenAIToolDefinition } from "./shared";
import { OPENAI_MODELS } from "../../constants/aiConfig";
import { promptService } from "../promptService";

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
  
  const prompt = `
    Context: User interested in "${niche}".
    Trends:
    ${trendsContext}

    Task: Generate 3 business system ideas.
    Also identify 2-3 real-world competitors for each idea.

    ${langInstruction}

    Return strictly valid JSON:
    [
      {
        "id": "unique_id",
        "name": "Name",
        "type": "SaaS",
        "description": "Pitch",
        "monetizationModel": "Model",
        "difficulty": "Medium",
        "potentialRevenue": "Revenue",
        "rationale": "Why",
        "competitors": ["Comp1", "Comp2"]
      }
    ]
  `;

  // Uses OPENAI_MODELS.BASIC default
  const response = await callOpenAI([{ role: "user", content: prompt }]);
  return JSON.parse(cleanJsonOutput(response.content || "[]"));
};

export const generateSystemBlueprint = async (idea: BusinessIdea, lang: Language): Promise<Blueprint> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    Create a comprehensive execution blueprint for:
    Name: ${idea.name}
    Type: ${idea.type}
    Description: ${idea.description}
    
    ${langInstruction}
    
    Output strictly valid JSON:
    {
      "executiveSummary": "Overview",
      "targetAudience": "Personas",
      "technicalStack": ["Tech1", "Tech2"],
      "marketingStrategy": ["Channel1"],
      "revenueStreams": [ { "name": "Source", "projected": 5000 } ],
      "roadmap": [ { "phase": "Phase 1", "tasks": ["Task1"] } ],
      "swot": {
        "strengths": ["Item 1"],
        "weaknesses": ["Item 1"],
        "opportunities": ["Item 1"],
        "threats": ["Item 1"]
      },
      "fullContentMarkdown": "Detailed markdown guide..."
    }
  `;

  // Use a smarter model for the blueprint
  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.COMPLEX);
  const rawBlueprint = JSON.parse(cleanJsonOutput(response.content || "{}"));
  
  // INJECT AFFILIATE LINKS HERE (Parity with Gemini)
  return await affiliateService.enrichBlueprint(rawBlueprint);
};

export const sendBlueprintChat = async (history: ChatMessage[], newMessage: string, context: Blueprint, lang: Language): Promise<{ text: string; updates?: Partial<Blueprint> }> => {
  const langInstruction = lang === 'id' ? "Reply in Indonesian." : "Reply in English.";
  
  const systemPrompt = `
    You are an expert business consultant and technical architect.
    You are discussing a specific Business Blueprint with the user.
    
    BLUEPRINT CONTEXT:
    Summary: ${context.executiveSummary}
    Tech Stack: ${context.technicalStack.join(', ')}
    Revenue Models: ${context.revenueStreams.map(r => r.name).join(', ')}
    
    Your goal is to help the user implement this specific blueprint.
    Answer technical questions, provide marketing advice, or expand on the roadmap.
    
    CAPABILITY:
    You have access to a tool called "update_blueprint".
    If the user explicitly asks to change/modify/update any part of the plan (e.g., "Change the revenue model to Subscription", "Add SEO to marketing"), YOU MUST USE THIS TOOL to apply the changes.
    
    Keep answers concise, actionable, and formatted in Markdown.
    ${langInstruction}
  `;

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
  return JSON.parse(cleanJsonOutput(response.content || "[]"));
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
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
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

  // Use COMPLEX model for reasoning
  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.COMPLEX);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
};

export const generateBMC = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BMC> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    Analyze the business idea "${idea.name}" and its blueprint summary: "${blueprint.executiveSummary}".
    Generate a strictly structured Business Model Canvas (BMC).
    Populate each of the 9 blocks with 3-5 short, bullet-point style items.
    ${langInstruction}

    Output strictly valid JSON:
    {
      "keyPartners": ["Item 1", "Item 2"],
      "keyActivities": ["Item 1", "Item 2"],
      "keyResources": ["Item 1", "Item 2"],
      "valuePropositions": ["Item 1", "Item 2"],
      "customerRelationships": ["Item 1", "Item 2"],
      "channels": ["Item 1", "Item 2"],
      "customerSegments": ["Item 1", "Item 2"],
      "costStructure": ["Item 1", "Item 2"],
      "revenueStreams": ["Item 1", "Item 2"]
    }
  `;

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
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
  return JSON.parse(cleanJsonOutput(response.content || "[]")) as ContentWeek[];
};

export const generateBrandIdentity = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BrandIdentity> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    Act as a professional Brand Strategist.
    Create a Brand Identity for:
    Business: ${idea.name}
    Audience: ${blueprint.targetAudience}

    Task:
    1. Generate 5 creative alternative names.
    2. Generate 5 slogans.
    3. Define 5 color palette with hex codes.
    4. Define Brand Tone and Values.

    ${langInstruction}

    Output strictly valid JSON:
    {
      "names": ["Name 1", "Name 2"],
      "slogans": ["Slogan 1", "Slogan 2"],
      "colors": [ { "name": "Ocean Blue", "hex": "#0077be" } ],
      "tone": "Professional",
      "brandValues": ["Trust", "Innovation"]
    }
  `;

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "{}"));
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
  return JSON.parse(cleanJsonOutput(response.content || "[]"));
};