'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Recipe, RecipeStatus } from '@/lib/types';
import { getAllRecipes } from '@/lib/storage';
import { RecipeCard } from '@/components/RecipeCard';
import { LangSwitcher } from '@/components/LangSwitcher';

function getCounts(recipes: (Recipe & { status: RecipeStatus })[]) {
  return {
    all: recipes.length,
    saved: recipes.filter(r => r.status === 'saved').length,
    made: recipes.filter(r => r.status === 'made').length,
  };
}

export default function RecipesPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<RecipeStatus | 'all'>('all');
  const [recipes, setRecipes] = useState<(Recipe & { status: RecipeStatus })[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRecipes(getAllRecipes());
    }
  }, [activeTab]);

  const counts = getCounts(recipes);
  const filtered = activeTab === 'all' ? recipes : recipes.filter(r => r.status === activeTab);

  const tabs: { key: string; label: string }[] = [
    { key: 'all', label: `${t('tabs.all')} (${counts.all})` },
    { key: 'saved', label: `${t('tabs.saved')} (${counts.saved})` },
    { key: 'made', label: `${t('tabs.made')} (${counts.made})` },
  ].filter(tab => counts[tab.key as keyof typeof counts] > 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-amber-600">
            {t('title')}
          </Link>
          <LangSwitcher />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {t('empty')}
            </p>
            <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
              {t('goHome')}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as RecipeStatus | 'all')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {filtered.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}