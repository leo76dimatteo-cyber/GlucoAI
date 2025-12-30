
// Fix: Always use GoogleGenAI and Type from @google/genai as per guidelines.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GlucoseLog, AIInsight, MealItem, InsulinType, MealType } from "../types";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeGlucoseTrends = async (logs: GlucoseLog[], lang: Language): Promise<AIInsight | null> => {
  if (logs.length === 0) return null;

  const logsSummary = logs.map(l => ({
    time: l.timestamp,
    level: l.sensorLevel || l.stickLevel || 0,
    carbs: l.carbs,
    insulin: l.insulinUnits,
    meal: l.mealType
  })).slice(-20);

  const langMap: Record<Language, string> = {
    it: 'ITALIANO (Italian)',
    en: 'ENGLISH',
    es: 'SPANISH (Español)',
    fr: 'FRENCH (Français)',
    zh: 'CHINESE MANDARIN (简体中文)',
    hi: 'HINDI (हिन्दी)'
  };

  const selectedLangName = langMap[lang];
  const langPrompt = `IMPORTANT: Your entire response must be written exclusively in ${selectedLangName}. Use professional medical terminology appropriate for the target language.`;

  try {
    // Fix: Using contents with the correct { parts: [...] } structure.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Analyze these blood glucose logs and provide health insights in ${selectedLangName}. 
      Target range is 80-130 mg/dL. Hypo is <70, Hyper is >180.
      Logs: ${JSON.stringify(logsSummary)}` }] },
      config: {
        systemInstruction: `You are a specialized endocrinology assistant. ${langPrompt} Analyze patterns and provide actionable insights. ALWAYS include a medical disclaimer in ${selectedLangName} stating that you are an AI and not a doctor. Use JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief overview of recent control" },
            patterns: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key patterns detected"
            },
            suggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Actionable lifestyle suggestions"
            },
            warning: { type: Type.STRING, description: "Critical warnings if dangerous levels detected" }
          },
          required: ["summary", "patterns", "suggestions"]
        }
      }
    });

    // Fix: Access response.text directly (property, not a method).
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const estimateMealCarbs = async (description: string, lang: Language): Promise<MealItem[]> => {
  const langMap: Record<Language, string> = {
    it: 'ITALIAN', en: 'ENGLISH', es: 'SPANISH', fr: 'FRENCH', zh: 'CHINESE', hi: 'HINDI'
  };

  try {
    // Fix: Using contents with the correct { parts: [...] } structure.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Estimate carbohydrate content for: "${description}". Output in ${langMap[lang]}.` }] },
      config: {
        systemInstruction: `You are a nutrition expert. Break down the meal into components. Estimate portion size and carb content (grams). Provide component names in ${langMap[lang]}. Use JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              portion: { type: Type.STRING },
              carbs: { type: Type.NUMBER }
            },
            required: ["name", "portion", "carbs"]
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Meal estimation error:", error);
    return [];
  }
};

export const extractSensorDataFromImage = async (base64Image: string): Promise<Partial<GlucoseLog>[]> => {
  try {
    // Fix: Correct parts structure for multimodal input.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Extract blood glucose data points from this sensor screenshot or report. Return a JSON array of objects with 'timestamp' (ISO string) and 'sensorLevel' (number)."
          }
        ]
      },
      config: {
        systemInstruction: "You are a medical data extraction tool. Analyze images of Dexcom, Libre, or Guardian sensors and extract glucose levels with timestamps. If the year is not visible, assume 2024. Use JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timestamp: { type: Type.STRING },
              sensorLevel: { type: Type.NUMBER }
            },
            required: ["timestamp", "sensorLevel"]
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Sensor extraction error:", error);
    return [];
  }
};
