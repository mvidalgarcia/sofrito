'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Recipe } from '@/lib/types';
import { saveRecipe } from '@/lib/storage';
import { RecipeDetail } from '@/components/RecipeDetail';

function decodeRecipe(encoded: string): Recipe {
  const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
  return {
    id: crypto.randomUUID(),
    name: decoded.n,
    ingredients: decoded.i.split('|').map((pair: string) => {
      const [item, amount] = pair.split(':');
      return { item, amount };
    }),
    steps: decoded.s,
    servings: decoded.v,
    prepTime: decoded.p,
    cookTime: decoded.c,
  };
}

function ShareContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const encoded = searchParams.get('r');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (encoded) {
      try {
        const decoded = decodeRecipe(encoded);
        setRecipe(decoded);
      } catch (e) {
        console.error('Failed to decode recipe:', e);
      }
    }
  }, [encoded]);

  const handleSave = () => {
    if (recipe) {
      saveRecipe(recipe, 'saved');
      setSaved(true);
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
        <main className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">{t('notFound')}</p>
            <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
              ← {t('back')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
            ← {t('back')}
          </Link>
          {!saved && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('save')}
            </button>
          )}
          {saved && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ {t('saved')}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <RecipeDetail recipe={recipe} showShareButton={false} />
      </main>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <ShareContent />
    </Suspense>
  );
}