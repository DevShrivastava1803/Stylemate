import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { getUserFromAuthHeader } from './_auth';

const MODEL_NAME = 'gemini-2.5-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  const ai = new GoogleGenAI({ apiKey });

  const { wardrobe, userPhoto, userTraits, userCriteria } = req.body || {};
  if (!Array.isArray(wardrobe) || wardrobe.length === 0) {
    return res.status(400).json({ error: 'wardrobe array required' });
  }

  const wardrobeSummary = wardrobe.map((item: any) => ({
    id: item.id,
    category: item.category,
    description: item.description,
    tags: item.tags || [],
  }));

  const parts: any[] = [];
  if (userPhoto) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: userPhoto } });
  }

  const prompt = `
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
    - Name
    - Style Tags (array)
    - Reasoning
    - ItemIds (Array of IDs used)
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              styleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasoning: { type: Type.STRING },
              itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name', 'styleTags', 'reasoning', 'itemIds'],
          },
        },
      },
    });
    const json = JSON.parse(response.text || '[]');
    return res.status(200).json(json);
  } catch (e: any) {
    console.error('Error generating outfits:', e);
    return res.status(500).json({ error: 'Gemini generation failed' });
  }
}