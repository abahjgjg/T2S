


import { Type, FunctionDeclaration } from "@google/genai";
import { BusinessIdea, Blueprint, Language, ChatMessage, AgentProfile, Trend, LaunchAssets, ViabilityAudit, BMC, ContentWeek, BrandIdentity, CustomerPersona } from "../../types";
import { cleanJsonOutput } from "../../utils/textUtils";
import { retryOperation } from "../../utils/retryUtils";
import { affiliateService } from "../affiliateService";
import { getGeminiClient, getLanguageInstruction } from "./shared";
import { GEMINI_MODELS } from "../../constants/aiConfig";
import { BusinessIdeaListSchema, BlueprintSchema, AgentProfileListSchema, ViabilityAuditSchema } from "../../utils/schemas";
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
            recommendedTools: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 tools this agent might need (e.g. Python, Browser)" },
            suggestedTasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-4 specific tasks this agent can execute immediately" }
          },
          required: ["role", "name", "objective", "systemPrompt", "recommendedTools", "suggestedTasks"]
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

export const generateLaunchAssets = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<LaunchAssets> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('GENERATE_LAUNCH_ASSETS', {
        name: idea.name,
        type: idea.type,
        audience: blueprint.targetAudience,
        summary: blueprint.executiveSummary,
        langInstruction
      });

      const assetsSchema = {
        type: Type.OBJECT,
        properties: {
          landingPage: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subheadline: { type: Type.STRING },
              cta: { type: Type.STRING },
              benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["headline", "subheadline", "cta", "benefits"]
          },
          socialPost: { type: Type.STRING },
          emailPitch: { type: Type.STRING }
        },
        required: ["landingPage", "socialPost", "emailPitch"]
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: assetsSchema,
          temperature: 0.8
        },
      });

      const text = response.text;
      if (!text) throw new Error("No launch assets generated");

      return JSON.parse(cleanJsonOutput(text)) as LaunchAssets;

    } catch (error) {
      console.error("Error generating launch assets:", error);
      throw error;
    }
  });
};

export const conductViabilityAudit = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<ViabilityAudit> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('VIABILITY_AUDIT', {
        name: idea.name,
        type: idea.type,
        summary: blueprint.executiveSummary,
        techStack: blueprint.technicalStack.join(', '),
        revenue: blueprint.revenueStreams.map(r => r.name).join(', '),
        langInstruction
      });

      const auditSchema = {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          dimensions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                comment: { type: Type.STRING }
              },
              required: ["name", "score", "comment"]
            }
          },
          hardTruths: { type: Type.ARRAY, items: { type: Type.STRING } },
          pivotSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["overallScore", "dimensions", "hardTruths", "pivotSuggestions"]
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.COMPLEX, // Use Smarter Model for Critique
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: auditSchema,
          thinkingConfig: { thinkingBudget: 2048 }, 
        },
      });

      const text = response.text;
      if (!text) throw new Error("No audit generated");

      return ViabilityAuditSchema.parse(JSON.parse(cleanJsonOutput(text)));

    } catch (error) {
      console.error("Error conducting viability audit:", error);
      throw error;
    }
  });
};

export const generateBMC = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BMC> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = `
        Analyze the business idea "${idea.name}" and its blueprint summary: "${blueprint.executiveSummary}".
        Generate a strictly structured Business Model Canvas (BMC).
        Populate each of the 9 blocks with 3-5 short, bullet-point style items.
        ${langInstruction}
      `;

      const bmcSchema = {
        type: Type.OBJECT,
        properties: {
          keyPartners: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyResources: { type: Type.ARRAY, items: { type: Type.STRING } },
          valuePropositions: { type: Type.ARRAY, items: { type: Type.STRING } },
          customerRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
          channels: { type: Type.ARRAY, items: { type: Type.STRING } },
          customerSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
          costStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
          revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["keyPartners", "keyActivities", "keyResources", "valuePropositions", "customerRelationships", "channels", "customerSegments", "costStructure", "revenueStreams"]
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: bmcSchema,
          temperature: 0.5,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No BMC generated");

      return JSON.parse(cleanJsonOutput(text)) as BMC;

    } catch (error) {
      console.error("Error generating BMC:", error);
      throw error;
    }
  });
};

export const generateLandingPageCode = async (idea: BusinessIdea, assets: LaunchAssets, lang: Language): Promise<string> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
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

      // Use Code-capable model
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.COMPLEX, 
        contents: prompt,
        config: {
          // No schema, we want raw text (TSX)
          temperature: 0.2,
        },
      });

      const text = response.text || "";
      // Strip markdown code blocks if present
      return text.replace(/^```tsx?\s*/, '').replace(/\s*```$/, '');

    } catch (error) {
      console.error("Error generating landing page code:", error);
      throw error;
    }
  });
};

export const generateContentCalendar = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<ContentWeek[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('GENERATE_CONTENT_CALENDAR', {
        name: idea.name,
        audience: blueprint.targetAudience,
        market: idea.type,
        langInstruction
      });

      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            weekNumber: { type: Type.NUMBER },
            theme: { type: Type.STRING },
            posts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["platform", "type", "content"]
              }
            }
          },
          required: ["weekNumber", "theme", "posts"]
        }
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        },
      });

      const text = response.text;
      if (!text) throw new Error("No calendar generated");

      return JSON.parse(cleanJsonOutput(text)) as ContentWeek[];

    } catch (error) {
      console.error("Error generating content calendar:", error);
      throw error;
    }
  });
};

export const generateBrandIdentity = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<BrandIdentity> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = `
        Act as a professional Brand Strategist and Creative Director.
        Create a comprehensive Brand Identity for:
        Business Name: ${idea.name}
        Type: ${idea.type}
        Target Audience: ${blueprint.targetAudience}
        Executive Summary: ${blueprint.executiveSummary}

        Task:
        1. Generate 5 creative alternative business names.
        2. Generate 5 catchy slogans/taglines.
        3. Define a cohesive Color Palette (5 colors) with Hex codes and names.
        4. Describe the Brand Tone (e.g., Professional, Playful, Futuristic).
        5. List 3 core Brand Values.

        ${langInstruction}
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          names: { type: Type.ARRAY, items: { type: Type.STRING } },
          slogans: { type: Type.ARRAY, items: { type: Type.STRING } },
          colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING }
              },
              required: ["name", "hex"]
            }
          },
          tone: { type: Type.STRING },
          brandValues: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["names", "slogans", "colors", "tone", "brandValues"]
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.8
        },
      });

      const text = response.text;
      if (!text) throw new Error("No brand identity generated");

      return JSON.parse(cleanJsonOutput(text)) as BrandIdentity;

    } catch (error) {
      console.error("Error generating brand identity:", error);
      throw error;
    }
  });
};

export const generatePersonas = async (idea: BusinessIdea, blueprint: Blueprint, lang: Language): Promise<CustomerPersona[]> => {
  return retryOperation(async () => {
    try {
      const ai = getGeminiClient();
      const langInstruction = getLanguageInstruction(lang);
      
      const prompt = promptService.build('GENERATE_PERSONAS', {
        name: idea.name,
        audience: blueprint.targetAudience,
        summary: blueprint.executiveSummary,
        langInstruction
      });

      const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            age: { type: Type.STRING },
            occupation: { type: Type.STRING },
            bio: { type: Type.STRING },
            painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            channels: { type: Type.ARRAY, items: { type: Type.STRING } },
            quote: { type: Type.STRING }
          },
          required: ["name", "age", "occupation", "bio", "painPoints", "goals", "channels", "quote"]
        }
      };

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.BASIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.8
        },
      });

      const text = response.text;
      if (!text) throw new Error("No personas generated");

      return JSON.parse(cleanJsonOutput(text)) as CustomerPersona[];

    } catch (error) {
      console.error("Error generating personas:", error);
      throw error;
    }
  });
};