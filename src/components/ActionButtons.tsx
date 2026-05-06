'use client';

import { useTranslations } from 'next-intl';
import { Recipe, RecipeStatus } from '@/lib/types';
import { saveRecipe, isNameSaved } from '@/lib/storage';
import { useState, useEffect } from 'react';

interface ActionButtonsProps {
  recipe: Recipe;
}

export function ActionButtons({ recipe }: ActionButtonsProps) {
  const t = useTranslations();
  const [, setRefresh] = useState(0);

  useEffect(() => {
    window.addEventListener('storage', () => setRefresh(r => r + 1));
  }, []);

  const savedStatus = isNameSaved(recipe.name) as RecipeStatus | null;

  const handleSave = (status: RecipeStatus) => {
    saveRecipe(recipe, status);
    setRefresh(r => r + 1);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
      <button
        onClick={() => handleSave('saved')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          savedStatus === 'saved'
            ? 'bg-amber-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        {savedStatus === 'saved' ? `✓ ${t('saved')}` : t('save')}
      </button>
      <button
        onClick={() => handleSave('made')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          savedStatus === 'made'
            ? 'bg-amber-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        {savedStatus === 'made' ? `✓ ${t('made')}` : t('markAsMade')}
      </button>
    </div>
  );
}