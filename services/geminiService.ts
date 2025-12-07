import { GoogleGenAI, Type } from "@google/genai";
import { Category, ClothingItem, GeneratedOutfitRaw, UserTraits } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Analyzes an uploaded image to detect one or more clothing items.
 */
export const analyzeImageForClothing = async (base64Image: string): Promise<Array<{ category: Category; description: string }>> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          {
            text: `
            TASK:
            Detect ALL distinct clothing items in the input image. 
            Multiple items may appear in a single photo (e.g., a pile or a full outfit).

            For each item:
            - Categorize into one of: ["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories"]
            - Generate a short human-readable description (e.g., "Blue denim jacket", "White sneakers").

            Return strictly valid JSON array.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                enum: [Category.TOPS, Category.BOTTOMS, Category.OUTERWEAR, Category.FOOTWEAR, Category.ACCESSORIES]
              },
              description: { type: Type.STRING }
            },
            required: ["category", "description"]
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error("Error analyzing image:", error);
    return [{ category: Category.UNKNOWN, description: "Unidentified Item" }];
  }
};

/**
 * Analyzes a user profile photo to extract physical traits.
 */
export const analyzeUserProfile = async (base64Image: string): Promise<UserTraits> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    {
                        text: `
                        Analyze the person in this photo to assist with personal styling.
                        Extract the following physical traits:
                        1. Skin Tone (e.g., Fair, Medium, Deep, Olive)
                        2. Hair Color
                        3. Body Type (approximate, e.g., Athletic, Curvy, Slim, Tall)
                        
                        Return strictly valid JSON.
                        `
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skinTone: { type: Type.STRING },
                        hairColor: { type: Type.STRING },
                        bodyType: { type: Type.STRING }
                    },
                    required: ["skinTone", "hairColor", "bodyType"]
                }
            }
        });

        const json = JSON.parse(response.text || "{}");
        return json as UserTraits;

    } catch (error) {
        console.error("Error analyzing profile:", error);
        return { skinTone: "Unknown", hairColor: "Unknown", bodyType: "Unknown" };
    }
};

/**
 * Generates outfit recommendations based on wardrobe and profile.
 */
export const generateOutfitsFromWardrobe = async (
    wardrobe: ClothingItem[], 
    userPhoto?: string, 
    userTraits?: UserTraits,
    userCriteria?: string
): Promise<GeneratedOutfitRaw[]> => {
  if (wardrobe.length === 0) return [];

  const wardrobeSummary = wardrobe.map(item => ({
    id: item.id,
    category: item.category,
    description: item.description,
    tags: item.tags || []
  }));

  const parts: any[] = [];
  
  if (userPhoto) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: userPhoto } });
  }

  let prompt = `
    You are StyleMate, an AI personal stylist.

    INPUT DATA:
    1. Wardrobe (JSON): ${JSON.stringify(wardrobeSummary)}
    ${userTraits ? `2. User Profile Traits: Skin Tone: ${userTraits.skinTone}, Hair: ${userTraits.hairColor}, Body Type: ${userTraits.bodyType}` : ''}
    ${userPhoto ? `3. User Photo: Provided.` : ''}
    ${userCriteria ? `4. User Request: ${userCriteria}` : ''}

    TASK:
    Generate EXACTLY 3 distinct, complete outfit combinations using ONLY the itemIds provided in the wardrobe.
    
    GUIDELINES:
    - Ensure color coordination matches the user's skin tone and hair color if provided.
    - Suggest outfits that flatter the user's body type if provided.
    - Create valid combinations (e.g. Top + Bottom + Shoes).
    - Strongly follow the user's request if provided (occasion, style, color, budget, weather).

    For each outfit return:
    - Name (e.g., “Urban Casual Layers”)
    - Style Tags (e.g., ["casual", "warm weather"]) 
    - Reasoning (Why this works for this specific user)
    - ItemIds (Array of IDs used)

    Return strictly valid JSON.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              styleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasoning: { type: Type.STRING },
              itemIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "styleTags", "reasoning", "itemIds"]
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json as GeneratedOutfitRaw[];
  } catch (error) {
    console.error("Error generating outfits:", error);
    return [];
  }
};
