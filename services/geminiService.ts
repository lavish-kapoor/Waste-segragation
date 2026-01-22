import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, WasteItem, WasteCategory } from "../types";

const PROMPT = `
You are an expert waste management assistant. Your goal is to identify ALL distinct waste objects in the provided image.
For EACH item identified, provide the details as per the schema.
Category must be one of: Biodegradable, Recyclable, Non-Recyclable, Hazardous, E-Waste.
`;

export const analyzeWasteImage = async (base64Image: string): Promise<Omit<ScanResult, 'id' | 'timestamp'>> => {
  // Access the key safely inside the function.
  // This ensures the app can load even if the key is missing (e.g. during first deploy).
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your Vercel Environment Variables.");
  }

  // Initialize the client here to prevent module-level crashes
  const ai = new GoogleGenAI({ apiKey });

  try {
    const modelId = 'gemini-3-flash-preview';
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: PROMPT,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  material: { type: Type.STRING },
                  category: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  disposalInstruction: { type: Type.STRING },
                  recyclingTips: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  funFact: { type: Type.STRING }
                },
                required: ['itemName', 'material', 'category', 'confidence', 'disposalInstruction', 'recyclingTips']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(text);

    if (!parsed.items || !Array.isArray(parsed.items)) {
       // Fallback if model returns unexpected structure
       if (parsed.itemName) {
           parsed.items = [parsed];
       } else {
           return { items: [] };
       }
    }

    const items: WasteItem[] = parsed.items.map((item: any) => {
      let category = WasteCategory.UNKNOWN;
      const catStr = item.category?.toLowerCase() || '';
      
      if (catStr.includes('bio') || catStr.includes('organic') || catStr.includes('compost')) category = WasteCategory.BIODEGRADABLE;
      else if (catStr.includes('non-recyclable') || catStr.includes('residual') || catStr.includes('landfill')) category = WasteCategory.NON_RECYCLABLE;
      else if (catStr.includes('recyclable') || catStr.includes('paper') || catStr.includes('plastic') || catStr.includes('glass') || catStr.includes('metal')) category = WasteCategory.RECYCLABLE;
      else if (catStr.includes('hazard') || catStr.includes('toxic')) category = WasteCategory.HAZARDOUS;
      else if (catStr.includes('e-waste') || catStr.includes('electronic')) category = WasteCategory.E_WASTE;

      return {
        itemName: item.itemName || "Unknown Item",
        material: item.material || "Unknown Material",
        category: category,
        confidence: item.confidence || 0,
        disposalInstruction: item.disposalInstruction || "Dispose of carefully.",
        recyclingTips: item.recyclingTips || [],
        funFact: item.funFact
      };
    });

    return { items };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};