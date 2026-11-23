"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { PencilLine, Trash2 } from "lucide-react";
import { Recipe, RecipeStatus } from "@/lib/types";
import { deleteSavedRecipe, getSavedRecipe, RecipeApiError } from "@/lib/recipe-api";
import { RecipeDetail, recipeToolClasses } from "@/components/RecipeDetail";
import { AppShell, BackButton, PageHeader } from "@/components/PageHeader";
import { RecipeLoadError, RecipeNotFound } from "@/components/RecipeStates";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { PageLoading, Spinner } from "@/components/ui/States";

function RecipeContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      await deleteSavedRecipe(id);
      router.push("/recipes");
    } catch {
      setDeleting(false);
      setDeleteError(true);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoading(false);
      setLoadError(false);
      setRecipe(null);
      return;
    }

    setLoading(true);
    setLoadError(false);
    setRecipe(null);

    getSavedRecipe(id)
      .then((found) => {
        if (!cancelled) setRecipe(found);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof RecipeApiError && err.status === 404) {
          setLoadError(false);
          return;
        }
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  let body;
  if (loading) {
    body = <PageLoading label={t("loadingRecipe")} />;
  } else if (loadError) {
    body = <RecipeLoadError onRetry={() => setReloadKey((key) => key + 1)} />;
  } else if (!recipe) {
    body = <RecipeNotFound />;
  } else {
    body = (
      <RecipeDetail
        recipe={recipe}
        wide
        showSource
        tools={
          <>
            <ButtonLink
              href={`/recipe/edit?id=${id}`}
              variant="ghost"
              className={`${recipeToolClasses} text-ink-muted`}
              aria-label={t("editNamed")}
            >
              <Icon icon={PencilLine} />
              <span aria-hidden="true" className="hidden lg:inline">
                {t("edit")}
              </span>
            </ButtonLink>
            <Button
              variant="ghost"
              icon
              className="text-ink-muted"
              aria-label={t("deleteNamed", { name: recipe.name })}
              aria-expanded={confirming}
              onClick={() => setConfirming(true)}
            >
              <Icon icon={Trash2} />
            </Button>
          </>
        }
        notice={
          confirming ? (
            <div className="border-line-strong bg-paper-raised flex flex-col gap-3 rounded-md border p-4">
              <p className="text-[15px] leading-[22px]">{t("confirmDelete")}</p>
              {deleteError ? <FieldError>{t("recipeDeleteError")}</FieldError> : null}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                  {t("keepIt")}
                </Button>
                <Button className="text-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Spinner /> : <Icon icon={Trash2} />}
                  {t("delete")}
                </Button>
              </div>
            </div>
          ) : null
        }
      />
    );
  }

  return (
    <AppShell wide header={<PageHeader wide left={<BackButton href="/recipes" />} />}>
      {body}
    </AppShell>
  );
}

export default function RecipePage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-screen" />}>
      <RecipeContent />
    </Suspense>
  );
}
