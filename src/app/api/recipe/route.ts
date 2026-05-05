import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getClient() {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY not configured');
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.LLM_BASE_URL || 'https://opencode.ai/zen/v1',
  });
}

const RECIPE_PROMPT = `You are an expert chef specializing in international cuisine.
Find recipes based on the given ingredients.

IMPORTANT: 
- ALWAYS respond in Spanish
- Return ONLY valid JSON object. No additional text, markdown, or comments.
Use this exact structure:
{"name":"Nombre","ingredients":[{"item":"ingrediente","amount":"cantidad"}],"steps":["paso 1"],"servings":4,"prepTime":"15 min","cookTime":"30 min"}

Strict rules:
1. Always respond in Spanish
2. Return ONLY valid JSON - no text before or after
3. ingredients is an array of objects with item and amount
4. steps is an array of strings
5. servings is a number
6. DO NOT use commas in string values
7. DO NOT use special characters except normal spaces`;

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const model = process.env.LLM_MODEL || 'big-pickle';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: RECIPE_PROMPT },
          { role: 'user', content: query },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      const content = response.choices[0].message.content?.trim();
      if (!content || content === '') {
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
      
      // Don't retry if API key is missing
      if (msg.includes('API key') || msg.includes('apiKey')) {
        return NextResponse.json({ error: 'API not configured. Please add LLM_API_KEY in Vercel settings.' }, { status: 500 });
      }
      
      if (attempt === 3) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: 'Max retries reached' }, { status: 500 });
}