import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  DEFAULT_LOCALE,
  DEFAULT_SERVINGS,
  DEFAULT_MODEL,
  LLM_TEMPERATURE,
  NAME_SEARCH_MAX_TOKENS,
  MAX_RETRIES,
  DEFAULT_LLM_BASE_URL,
} from "@/lib/constants";

function getClient() {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY not configured");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.LLM_BASE_URL || DEFAULT_LLM_BASE_URL,
  });
}

const LANG_CONFIG = {
  es: {
    instruction: "ALWAYS respond in Spanish",
    exampleName: "Nombre de la receta",
    exampleItem: "ingrediente",
    exampleAmount: "cantidad",
    exampleStep: "paso 1",
    examplePrepTime: "15 min",
    exampleCookTime: "30 min",
  },
  en: {
    instruction: "ALWAYS respond in English",
    exampleName: "Recipe Name",
    exampleItem: "ingredient",
    exampleAmount: "amount",
    exampleStep: "step 1",
    examplePrepTime: "15 min",
    exampleCookTime: "30 min",
  },
};

function buildPrompt(locale: string, servings: number) {
  const lang = LANG_CONFIG[locale as keyof typeof LANG_CONFIG] || LANG_CONFIG.es;

  return `You are an expert chef specializing in international cuisine.
Find recipes based on the given ingredients. Scale all ingredient amounts for ${servings} servings.

IMPORTANT: 
- ${lang.instruction}
- Return ONLY valid JSON object. No additional text, markdown, or comments.
Use this exact structure:
{"name":"${lang.exampleName}","ingredients":[{"item":"${lang.exampleItem}","amount":"${lang.exampleAmount}"}],"steps":["${lang.exampleStep}"],"servings":${servings},"prepTime":"${lang.examplePrepTime}","cookTime":"${lang.exampleCookTime}"}

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
  const { query, locale = DEFAULT_LOCALE, servings = DEFAULT_SERVINGS } = await request.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const safeLocale = locale === "en" ? "en" : "es";
  const prompt = buildPrompt(safeLocale, servings);
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: query },
        ],
        temperature: LLM_TEMPERATURE,
        max_tokens: NAME_SEARCH_MAX_TOKENS,
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
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed:`, msg);

      if (msg.includes("API key") || msg.includes("apiKey")) {
        return NextResponse.json(
          {
            error: "API not configured. Please add LLM_API_KEY in Vercel settings.",
          },
          { status: 500 },
        );
      }

      if (attempt === MAX_RETRIES) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: "Max retries reached" }, { status: 500 });
}
