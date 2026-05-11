'use client';

import { useTranslations } from 'next-intl';
import { Recipe } from '@/lib/types';
import { ActionButtons } from './ActionButtons';
import { useState } from 'react';

interface RecipeDetailProps {
  recipe: Recipe;
  showShareButton?: boolean;
}

function encodeRecipe(recipe: Recipe): string {
  const minified = {
    n: recipe.name,
    i: recipe.ingredients.map((ing) => `${ing.item}:${ing.amount}`).join('|'),
    s: recipe.steps,
    v: recipe.servings,
    p: recipe.prepTime,
    c: recipe.cookTime,
  };
  return btoa(encodeURIComponent(JSON.stringify(minified)));
}

export function RecipeDetail({ recipe, showShareButton = true }: RecipeDetailProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const encoded = encodeRecipe(recipe);
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const locale = pathParts[0] || 'es';
    const url = `${window.location.origin}/${locale}/share?r=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {recipe.name}
      </h2>

      <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        <span>🍽️ {recipe.servings} {t('servings')}</span>
        <span>⏱️ {t('prepTime')}: {recipe.prepTime}</span>
        <span>🔥 {t('cookTime')}: {recipe.cookTime}</span>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          {t('ingredients')}
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="text-zinc-700 dark:text-zinc-300">
              • {ing.amount} {ing.item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          {t('steps')}
        </h3>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-zinc-700 dark:text-zinc-300">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center text-sm font-medium">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <ActionButtons recipe={recipe} />

      {showShareButton && (
        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors text-sm"
          >
            {copied ? '✓ ' + t('copied') : '🔗 ' + t('share')}
          </button>
        </div>
      )}
    </div>
  );
}