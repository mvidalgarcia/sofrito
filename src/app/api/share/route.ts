import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { cyrb53 } from "@/lib/id";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "KV not configured" }, { status: 500 });
  }

  const recipe = await request.json();
  const id = cyrb53(recipe.name).slice(0, 6);

  const existing = await redis.get(`share:${id}`);
  if (!existing) {
    await redis.set(`share:${id}`, JSON.stringify(recipe), { ex: 2592000 });
  }

  return NextResponse.json({ id });
}

export async function GET(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "KV not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const data = await redis.get(`share:${id}`);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const recipe = typeof data === "string" ? JSON.parse(data) : data;
  return NextResponse.json(recipe);
}
