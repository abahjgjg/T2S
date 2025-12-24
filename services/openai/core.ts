

import { BusinessIdea, Blueprint, Language, ChatMessage, AgentProfile, Trend } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { affiliateService } from "../affiliateService";
import { callOpenAI, getLanguageInstruction } from "./shared";
import { OPENAI_MODELS } from "../../constants/aiConfig";
import { promptService } from "../promptService";

// OpenAI Tool Definition
const updateBlueprintToolDefinition = {
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
  const prompt = `
    Analyze this Business Blueprint: ${blueprint.executiveSummary}
    
    Identify 3 autonomous AI Agent roles (e.g. "Content Manager", "DevOps") needed to execute this.
    For each, write a detailed System Prompt for an LLM.

    ${langInstruction}

    Output strictly valid JSON:
    [
      {
        "role": "Role Title",
        "name": "Creative Name",
        "objective": "Goal",
        "systemPrompt": "Detailed instruction...",
        "recommendedTools": ["Tool1"]
      }
    ]
  `;

  const response = await callOpenAI([{ role: "user", content: prompt }], OPENAI_MODELS.BASIC);
  return JSON.parse(cleanJsonOutput(response.content || "[]"));
};
