import { NextResponse } from "next/server";
import { z } from "zod";
import { getRecipeOwnerEmail } from "@/lib/recipe-owner";
import { getRecipeRepository } from "@/lib/repositories";
import { updateSavedRecipeSchema } from "@/lib/recipe-validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const recipeIdSchema = z.string().uuid();

async function getAuthorizedId(request: Request, context: RouteContext) {
  const ownerEmail = await getRecipeOwnerEmail(request);
  if (!ownerEmail) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const parsedId = recipeIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) {
    return { response: NextResponse.json({ error: "Recipe not found" }, { status: 404 }) };
  }

  return { ownerEmail, id: parsedId.data };
}

export async function GET(request: Request, context: RouteContext) {
  const authorization = await getAuthorizedId(request, context);
  if ("response" in authorization) return authorization.response;

  try {
    const recipe = await getRecipeRepository().getById(authorization.ownerEmail, authorization.id);
    return recipe
      ? NextResponse.json(recipe)
      : NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to load recipe:", error);
    return NextResponse.json({ error: "Failed to load recipe" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await getAuthorizedId(request, context);
  if ("response" in authorization) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSavedRecipeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid recipe update", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const recipe = await getRecipeRepository().update(
      authorization.ownerEmail,
      authorization.id,
      parsed.data,
    );
    return recipe
      ? NextResponse.json(recipe)
      : NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const authorization = await getAuthorizedId(request, context);
  if ("response" in authorization) return authorization.response;

  try {
    const deleted = await getRecipeRepository().delete(authorization.ownerEmail, authorization.id);
    return deleted
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
