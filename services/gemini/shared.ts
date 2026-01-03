
import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing or undefined. Please verify your environment configuration.");
  }

  // Always return a new instance to ensure we capture the latest API_KEY if it changes in the session
  return new GoogleGenAI({ apiKey });
};
