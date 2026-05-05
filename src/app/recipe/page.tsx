'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { Recipe, RecipeStatus } from '@/lib/types';
import { getRecipeById } from '@/lib/storage';
import { RecipeDetail } from '@/components/RecipeDetail';

function RecipeContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);

  useEffect(() => {
    if (id && typeof window !== 'undefined') {
      const found = getRecipeById(id);
      if (found) {
        // Safe: Initializing client-side state from localStorage
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecipe(found);
      }
    }
  }, [id]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
        <main className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">Receta no encontrada</p>
            <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
              ← Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/recipes" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <RecipeDetail recipe={recipe} />
      </main>
    </div>
  );
}

export default function RecipePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <RecipeContent />
    </Suspense>
  );
}