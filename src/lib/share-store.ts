import "server-only";

import { Redis } from "@upstash/redis";
import { cyrb53 } from "@/lib/id";
import { isMemoryRepository } from "@/lib/repositories";

const SHARE_TTL_SECONDS = 2592000;

interface ShareStore {
  get(id: string): Promise<unknown>;
  /** Keeps the first recipe stored under an id. */
  add(id: string, recipe: unknown): Promise<void>;
}

const globalMemory = globalThis as typeof globalThis & {
  sofritoMemoryShares?: Map<string, unknown>;
};

function memoryShareStore(): ShareStore {
  const shares = (globalMemory.sofritoMemoryShares ??= new Map());
  return {
    async get(id) {
      return shares.get(id) ?? null;
    },
    async add(id, recipe) {
      if (!shares.has(id)) shares.set(id, recipe);
    },
  };
}

function redisShareStore(url: string, token: string): ShareStore {
  const redis = new Redis({ url, token });
  return {
    async get(id) {
      const data = await redis.get(`share:${id}`);
      return typeof data === "string" ? JSON.parse(data) : data;
    },
    async add(id, recipe) {
      await redis.set(`share:${id}`, JSON.stringify(recipe), { ex: SHARE_TTL_SECONDS, nx: true });
    },
  };
}

/** Redis in real deployments, memory under E2E tests, null when sharing isn't configured. */
export function getShareStore(): ShareStore | null {
  if (process.env.E2E_TEST === "true" && isMemoryRepository()) return memoryShareStore();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? redisShareStore(url, token) : null;
}

export function toShareId(name: string): string {
  return cyrb53(name).slice(0, 6);
}
