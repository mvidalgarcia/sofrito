import { NextResponse } from "next/server";
import { getRecipeRepository, isMemoryRepository } from "@/lib/repositories";

export async function DELETE() {
  if (process.env.E2E_TEST !== "true" || !isMemoryRepository()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const repository = getRecipeRepository();
  if (!repository.reset) {
    return NextResponse.json({ error: "Reset unavailable" }, { status: 409 });
  }

  await repository.reset();
  return new NextResponse(null, { status: 204 });
}
