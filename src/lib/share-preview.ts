import "server-only";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { getShareStore } from "@/lib/share-store";
import type { routing } from "@/routing";

/** The parts of a shared recipe a link preview shows. Stored shares are unvalidated input. */
const previewSchema = z.object({
  name: z.string().trim().min(1),
  servings: z.number().int().positive().optional().catch(undefined),
  prepTime: z.string().trim().optional().catch(undefined),
  cookTime: z.string().trim().optional().catch(undefined),
});

export type SharePreview = z.infer<typeof previewSchema>;

/** Never throws: a preview falls back to the generic one rather than breaking the page. */
export async function getSharePreview(id: string | null | undefined): Promise<SharePreview | null> {
  if (!id) return null;
  try {
    const result = previewSchema.safeParse(await getShareStore()?.get(id));
    return result.success ? result.data : null;
  } catch (e) {
    console.error("Share preview failed:", e);
    return null;
  }
}

/** "20 min prep" and "1 h cook", skipping whichever the recipe lacks. */
export async function getPreviewTimes(
  { prepTime, cookTime }: SharePreview,
  locale: (typeof routing.locales)[number],
): Promise<string[]> {
  const t = await getTranslations({ locale });
  return [
    prepTime ? t("prepShort", { time: prepTime }) : null,
    cookTime ? t("cookShort", { time: cookTime }) : null,
  ].filter((part) => part !== null);
}
