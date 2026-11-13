import "server-only";

import { auth } from "@/lib/auth";
import { isMemoryRepository } from "@/lib/repositories";

const DEFAULT_E2E_EMAIL = "e2e@sofrito.test";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isE2eMemoryMode(): boolean {
  return process.env.E2E_TEST === "true" && isMemoryRepository();
}

export async function getRecipeOwnerEmail(request?: Request): Promise<string | null> {
  if (isE2eMemoryMode()) {
    if (request?.headers.get("x-e2e-unauthenticated") === "true") return null;

    const email =
      request?.headers.get("x-e2e-user-email") ?? process.env.E2E_USER_EMAIL ?? DEFAULT_E2E_EMAIL;
    return normalizeEmail(email);
  }

  const session = await auth();
  return session?.user?.email ? normalizeEmail(session.user.email) : null;
}
