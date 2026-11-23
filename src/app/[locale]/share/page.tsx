"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bookmark, LogIn } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { FullPageLoading } from "@/components/FullPageLoading";
import { useTranslations, useLocale } from "next-intl";
import { Recipe } from "@/lib/types";
import { generateId } from "@/lib/id";
import { toShareableRecipe } from "@/lib/recipe-share";
import { RecipeDetail } from "@/components/RecipeDetail";
import { AppShell, PageHeader } from "@/components/PageHeader";
import { RecipeNotFound } from "@/components/RecipeStates";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PageLoading } from "@/components/ui/States";

/** Shown to signed-out visitors in place of the save buttons. */
function KeepRecipe({ signInHref }: { signInHref: string }) {
  const t = useTranslations();
  return (
    <section
      aria-labelledby="keep-recipe-title"
      className="border-line bg-paper-raised flex flex-col gap-3 rounded-md border p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="keep-recipe-title" className="font-display text-card-title">
          {t("keepRecipeTitle")}
        </h2>
        <p className="text-ink-muted text-[15px] leading-[22px]">{t("keepRecipeText")}</p>
      </div>
      <ButtonLink href={signInHref} variant="primary" className="shrink-0">
        <Icon icon={Bookmark} />
        {t("keepRecipeButton")}
      </ButtonLink>
    </section>
  );
}

function ShareContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const pathname = usePathname();
  const { status } = useSession();
  const signedOut = status === "unauthenticated";
  const query = searchParams.toString();
  // Bring the visitor straight back to this recipe after signing in.
  const signInHref = `/login?callbackUrl=${encodeURIComponent(
    query ? `${pathname}?${query}` : pathname,
  )}`;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch(`/api/share?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        const shared = toShareableRecipe({ ...data, locale });
        setRecipe({ ...shared, id: generateId(data.name) });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id, locale]);

  return (
    <AppShell
      wide
      header={
        <PageHeader
          wide
          guest={
            signedOut ? (
              <ButtonLink href={signInHref} variant="ghost">
                <Icon icon={LogIn} />
                {t("signIn")}
              </ButtonLink>
            ) : undefined
          }
        />
      }
    >
      {loading ? (
        <PageLoading label={t("loadingRecipe")} />
      ) : error || !recipe ? (
        <RecipeNotFound />
      ) : (
        <RecipeDetail
          recipe={recipe}
          wide
          showShareButton={false}
          eyebrow={t("sharedWithYou")}
          // Hide the save buttons until we know who's looking; guests get the sign-in box.
          actions={status === "authenticated" ? undefined : null}
          notice={signedOut ? <KeepRecipe signInHref={signInHref} /> : undefined}
        />
      )}
    </AppShell>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <ShareContent />
    </Suspense>
  );
}
