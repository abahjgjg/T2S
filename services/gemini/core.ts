

import { Type, FunctionDeclaration } from "@google/genai";
import { BusinessIdea, Blueprint, Language, ChatMessage, AgentProfile, Trend } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { affiliateService } from "../affiliateService";
import { getGeminiClient, getLanguageInstruction } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";
import { BusinessIdeaListSchema, BlueprintSchema, AgentProfileListSchema } from "../../utils/schemas";
import { promptService } from "../promptService";

// Tool Definition for Blueprint Updates
const updateBlueprintTool: FunctionDeclaration = {
  name: 'update_blueprint',
  description: 'Update the business blueprint structure. Use this when the user asks to modify specific sections like marketing strategy, revenue streams, or the executive summary.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING, description: 'Updated Executive Summary text' },
      targetAudience: { type: Type.STRING, description: 'Updated Target Audience description' },
      technicalStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Updated list of technologies' },
      marketingStrategy: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Updated list of marketing strategies' },
      revenueStreams: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            projected: { type: Type.NUMBER }
          },
          required: ["name", "projected"]
        },
        description: 'Updated list of revenue streams'
      }
    }
  }
};

export const generateBusinessIdeas = async (niche: string, trends: any[], lang: Language): Promise<BusinessIdea[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      const trendsContext = trends.map(t => `${t.title} (News: ${t.triggerEvent}): ${t.description}`).join("\n");
      
      const prompt = promptService.build('GENERATE_IDEAS', {
        niche,
        trendsContext,
        langInstruction
      });

      const ideaSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            type: { type: Type.STRING, description: "SaaS, Agency, Content, E-commerce, or Platform" },
            description: { type: Type.STRING },
            monetizationModel: { type: Type.STRING },
            difficulty: { type: Type.STRING, description: "Low, Medium, or High" },
            potentialRevenue: { type: Type.STRING },
            rationale: { type: Type.STRING },
            competitors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 2-3 existing real-world competitors or similar solutions" 
            }
          },
          required: ["id", "name", "type", "description", "monetizationModel", "difficulty", "potentialRevenue", "rationale", "competitors"]
        }
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ideaSchema,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No ideas generated");

      // Validate with Zod
      const rawData = JSON.parse(cleanJsonOutput(text));
      return BusinessIdeaListSchema.parse(rawData) as BusinessIdea[];

    } catch (error) {
      console.error("Error inside generateBusinessIdeas attempt:", error);
      throw error;
    }
  });
};

export const generateSystemBlueprint = async (idea: BusinessIdea, lang: Language): Promise<Blueprint> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('GENERATE_BLUEPRINT', {
        name: idea.name,
        type: idea.type,
        description: idea.description,
        monetizationModel: idea.monetizationModel,
        langInstruction
      });

      const blueprintSchema = {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          technicalStack: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketingStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
          revenueStreams: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                projected: { type: Type.NUMBER, description: "Monthly projected revenue in USD" }
              },
              required: ["name", "projected"]
            }
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phase", "tasks"]
            }
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
          },
          fullContentMarkdown: { type: Type.STRING, description: "A detailed Markdown string containing the full, in-depth guide, including 'How to build', 'Go-to-market', and 'Risk Mitigation'." }
        },
        required: ["executiveSummary", "targetAudience", "technicalStack", "marketingStrategy", "revenueStreams", "roadmap", "swot", "fullContentMarkdown"]
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.COMPLEX,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: blueprintSchema,
          // Set both maxOutputTokens and thinkingBudget to ensure space for the large JSON response
          maxOutputTokens: 32768, 
          thinkingConfig: { thinkingBudget: 10240 }, 
        },
      });

      const text = response.text;
      if (!text) throw new Error("No blueprint generated");

      // Validate with Zod
      const rawData = JSON.parse(cleanJsonOutput(text));
      const validatedBlueprint = BlueprintSchema.parse(rawData);

      // INJECT AFFILIATE LINKS HERE
      const enrichedBlueprint = await affiliateService.enrichBlueprint(validatedBlueprint as Blueprint);
      
      return enrichedBlueprint;

    } catch (error) {
      console.error("Error inside generateSystemBlueprint attempt:", error);
      throw error;
    }
  }, 3, 2000); 
};

export const sendBlueprintChat = async (history: ChatMessage[], newMessage: string, context: Blueprint, lang: Language): Promise<{ text: string; updates?: Partial<Blueprint> }> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = lang === 'id' ? "Reply in Indonesian." : "Reply in English.";
      
      const systemInstruction = promptService.build('CHAT_SYSTEM', {
        executiveSummary: context.executiveSummary,
        techStack: context.technicalStack.join(', '),
        revenueStreams: context.revenueStreams.map(r => r.name).join(', '),
        langInstruction
      });

      const chat = ai.chats.create({
        model: GEMINI_MODELS.BASIC,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [updateBlueprintTool] }]
        },
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      });

      const response = await chat.sendMessage({ message: newMessage });
      const functionCalls = response.functionCalls;
      
      let updates: Partial<Blueprint> | undefined;
      let responseText = response.text || "";

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'update_blueprint') {
          updates = call.args as Partial<Blueprint>;
          if (!responseText) {
             responseText = lang === 'id' 
               ? "Saya telah memperbarui blueprint sesuai permintaan Anda." 
               : "I have updated the blueprint with your changes.";
          }
        }
      }
      
      if (!responseText && !updates) throw new Error("No response from Chat AI");
      
      return { text: responseText, updates };
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  });
};

export const chatWithAgent = async (history: ChatMessage[], newMessage: string, agent: AgentProfile, lang: Language): Promise<string> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      
      const chat = ai.chats.create({
        model: GEMINI_MODELS.BASIC,
        config: {
          // Use the specific agent's prompt as the system instruction
          systemInstruction: agent.systemPrompt,
        },
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      });

      const response = await chat.sendMessage({ message: newMessage });
      return response.text || "";

    } catch (error) {
      console.error("Error in agent chat:", error);
      throw error;
    }
  });
};

export const chatWithResearchAnalyst = async (history: ChatMessage[], newMessage: string, niche: string, trends: Trend[], lang: Language): Promise<string> => {
   return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      const trendsContext = trends.map(t => `- ${t.title} (${t.relevanceScore}% match): ${t.description}`).join("\n");
      
      const systemInstruction = promptService.build('RESEARCH_ANALYST', {
        niche,
        trendsContext,
        langInstruction
      });

      const chat = ai.chats.create({
        model: GEMINI_MODELS.BASIC,
        config: { systemInstruction },
        history: history.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }))
      });

      const response = await chat.sendMessage({ message: newMessage });
      return response.text || "";
    } catch (e) {
      console.error("Research chat error", e);
      throw e;
    }
   });
}

export const generateTeamOfAgents = async (blueprint: Blueprint, lang: Language): Promise<AgentProfile[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('GENERATE_AGENTS', {
        executiveSummary: blueprint.executiveSummary,
        techStack: blueprint.technicalStack.join(', '),
        roadmap: JSON.stringify(blueprint.roadmap.slice(0, 3)),
        langInstruction
      });

      const agentSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            name: { type: Type.STRING, description: "A creative name for the agent, e.g. 'Atlas' or 'Pixel'" },
            objective: { type: Type.STRING, description: "One sentence goal of this agent" },
            systemPrompt: { type: Type.STRING, description: "The full, detailed instruction prompt for the LLM" },
            recommendedTools: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 tools this agent might need (e.g. Python, Browser)" }
          },
          required: ["role", "name", "objective", "systemPrompt", "recommendedTools"]
        }
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: agentSchema,
          temperature: 0.8
        },
      });

      const text = response.text;
      if (!text) throw new Error("No agents generated");

      // Validate with Zod
      const rawData = JSON.parse(cleanJsonOutput(text));
      return AgentProfileListSchema.parse(rawData);

    } catch (error) {
      console.error("Error generating agents:", error);
      throw error;
    }
  });
};
