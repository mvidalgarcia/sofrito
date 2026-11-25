import { NextRequest, NextResponse } from "next/server";
import { getShareStore, toShareId } from "@/lib/share-store";

export async function POST(request: NextRequest) {
  const store = getShareStore();
  if (!store) {
    return NextResponse.json({ error: "KV not configured" }, { status: 500 });
  }

  const recipe = await request.json();
  const id = toShareId(recipe.name);
  await store.add(id, recipe);

  return NextResponse.json({ id });
}

export async function GET(request: NextRequest) {
  const store = getShareStore();
  if (!store) {
    return NextResponse.json({ error: "KV not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const recipe = await store.get(id);
  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(recipe);
}
