
import { GoogleGenAI } from "@google/genai";
import { Language } from "../../types";

export const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing or undefined. Please verify your environment configuration.");
  }

  // Always return a new instance to ensure we capture the latest API_KEY if it changes in the session
  return new GoogleGenAI({ apiKey });
};

export const getLanguageInstruction = (lang: Language) => {
  return lang === 'id' 
    ? "Provide all content values (descriptions, titles, summaries) in Indonesian language (Bahasa Indonesia). However, KEEP THE JSON KEYS in English exactly as defined in the schema."
    : "Provide all content in English.";
};
