import { GoogleGenAI } from "@google/genai";
import { ScanResult, WasteItem, WasteCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an expert waste management assistant. Your goal is to identify ALL distinct waste objects in the provided image.
For EACH item identified, provide the following details:

1. itemName: A short, descriptive name (e.g., "Plastic Water Bottle", "Apple Core").
2. material: The primary material (e.g., Plastic, Paper, Glass, Metal, Organic, Electronic).
3. category: Must be one of [Biodegradable, Recyclable, Non-Recyclable, Hazardous, E-Waste].
4. confidence: A number between 0 and 1.
5. disposalInstruction: A concise sentence on proper disposal.
6. recyclingTips: A list of 2 short tips.
7. funFact: A short interesting fact.

RETURN ONLY RAW JSON. The JSON must have a root property "items" which is an array.
Structure:
{
  "items": [
    {
      "itemName": "string",
      "material": "string",
      "category": "string",
      "confidence": number,
      "disposalInstruction": "string",
      "recyclingTips": ["string"],
      "funFact": "string"
    }
  ]
}
`;

export const analyzeWasteImage = async (base64Image: string): Promise<Omit<ScanResult, 'id' | 'timestamp'>> => {
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
            text: SYSTEM_PROMPT,
          },
        ],
      },
    });

    const text = response.text || "{}";
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    if (!parsed.items || !Array.isArray(parsed.items)) {
       // Fallback if model returns single object instead of array structure
       if (parsed.itemName) {
           parsed.items = [parsed];
       } else {
           throw new Error("Invalid response structure");
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
    throw new Error("Failed to analyze the image. Please try again.");
  }
};