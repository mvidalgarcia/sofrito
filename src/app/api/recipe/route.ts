import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY not configured");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.LLM_BASE_URL || "https://opencode.ai/zen/v1",
  });
}

const LANG_CONFIG = {
  es: {
    instruction: "ALWAYS respond in Spanish",
    exampleName: "Nombre de la receta",
    exampleItem: "ingrediente",
    exampleStep: "paso 1",
  },
  en: {
    instruction: "ALWAYS respond in English",
    exampleName: "Recipe Name",
    exampleItem: "ingredient",
    exampleStep: "step 1",
  },
};

function buildPrompt(locale: string) {
  const lang = LANG_CONFIG[locale as keyof typeof LANG_CONFIG] || LANG_CONFIG.es;

  return `You are an expert chef specializing in international cuisine.
Find recipes based on the given ingredients.

IMPORTANT: 
- ${lang.instruction}
- Return ONLY valid JSON object. No additional text, markdown, or comments.
Use this exact structure:
{"name":"${lang.exampleName}","ingredients":[{"item":"${lang.exampleItem}","amount":"amount"}],"steps":["${lang.exampleStep}"],"servings":4,"prepTime":"15 min","cookTime":"30 min"}

Strict rules:
1. ${lang.instruction}
2. Return ONLY valid JSON - no text before or after
3. ingredients is an array of objects with item and amount
4. steps is an array of strings
5. servings is a number
6. DO NOT use commas in string values
7. DO NOT use special characters except normal spaces`;
}

export async function POST(request: NextRequest) {
  const { query, locale = "es" } = await request.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const safeLocale = locale === "en" ? "en" : "es";
  const prompt = buildPrompt(safeLocale);
  const model = process.env.LLM_MODEL || "big-pickle";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: query },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      const content = response.choices[0].message.content?.trim();
      if (!content || content === "") {
        continue;
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        continue;
      }

      const recipe = JSON.parse(jsonMatch[0]);
      return NextResponse.json(recipe);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Attempt ${attempt}/3 failed:`, msg);

      if (msg.includes("API key") || msg.includes("apiKey")) {
        return NextResponse.json(
          {
            error: "API not configured. Please add LLM_API_KEY in Vercel settings.",
          },
          { status: 500 },
        );
      }

      if (attempt === 3) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: "Max retries reached" }, { status: 500 });
}
