import { NextResponse } from "next/server";
import { getRecipeOwnerEmail } from "@/lib/recipe-owner";
import { getRecipeRepository } from "@/lib/repositories";
import { createSavedRecipeSchema } from "@/lib/recipe-validation";
import type { RecipeStatus } from "@/lib/types";

const VALID_STATUSES = new Set<RecipeStatus>(["saved", "made"]);

export async function GET(request: Request) {
  const ownerEmail = await getRecipeOwnerEmail(request);
  if (!ownerEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusParam = new URL(request.url).searchParams.get("status");
  if (statusParam && !VALID_STATUSES.has(statusParam as RecipeStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const recipes = await getRecipeRepository().list(
      ownerEmail,
      statusParam ? (statusParam as RecipeStatus) : undefined,
    );
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to list saved recipes:", error);
    return NextResponse.json({ error: "Failed to load recipes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ownerEmail = await getRecipeOwnerEmail(request);
  if (!ownerEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSavedRecipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid recipe", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const recipe = await getRecipeRepository().create(ownerEmail, parsed.data);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Failed to save recipe:", error);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  }
}
