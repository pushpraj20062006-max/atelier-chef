import { GoogleGenerativeAI } from "@google/generative-ai";

const keys = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY, 
 
].filter(Boolean) as string[];

let currentKeyIndex = 0;

// 'gemini-1.5-flash-latest' is the most stable alias to avoid 404s
const MODEL_NAME = "gemini-2.5-flash";


const getModelInstance = () => {
  if (keys.length === 0) {
    throw new Error("API Keys are missing. Check your .env.local file.");
  }
  // Initialize with the current rotating key
  const genAI = new GoogleGenerativeAI(keys[currentKeyIndex]);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
};

export const getRecipe = async (ingredients: string[], foodType: string, allergies: string) => {
  try {
    const model = getModelInstance();
    
    const prompt = `
      Suggest a creative recipe using: ${ingredients.join(", ")}. 
      Food Style: ${foodType || "any style"}. 
      Allergies/Dislikes: ${allergies || "none"}.
      
      Format with Markdown:
      - Title
      - Prep/Cook Time
      - Ingredients
      - Instructions
      - A small nutritional table at the very end.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    // 1. Handle Quota (429) - Switch to next key and retry
    if (error.message.includes("429") && keys.length > 1) {
      console.warn(`🔄 Key ${currentKeyIndex + 1} exhausted. Rotating...`);
      currentKeyIndex = (currentKeyIndex + 1) % keys.length;
      return getRecipe(ingredients, foodType, allergies); 
    }

    // 2. Handle Model Not Found (404)
    if (error.message.includes("404")) {
      console.error("404 Error: The API doesn't recognize the model name. Try 'gemini-1.5-flash'.");
    }

    throw error;
  }
};

export const getNutrition = async (recipeText: string) => {
  // Since we merged nutrition into getRecipe to save quota, 
  // we'll just return a note or a fallback call.
  const model = getModelInstance();
  const prompt = `Analyze nutrition for: ${recipeText}. Format as Markdown table.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const startChatSession = (history: any[]) => {
  const model = getModelInstance();
  return model.startChat({
    history,
    generationConfig: { maxOutputTokens: 1000 },
  });
};