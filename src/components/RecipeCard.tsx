'use client';

import { useState } from 'react';
import { Recipe, RecipeStatus } from '@/lib/types';
import { deleteRecipe } from '@/lib/storage';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe & { status?: RecipeStatus };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [deleted, setDeleted] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleted(true);
    setTimeout(() => deleteRecipe(recipe.id), 200);
  };

  if (deleted) return null;

  const statusLabel = {
    'saved': 'Guardada',
    'made': 'Hecha',
  }[recipe.status || 'saved'];

  return (
    <Link
      href={`/recipe?id=${recipe.id}`}
      className="block bg-white dark:bg-zinc-900 rounded-xl shadow p-4 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
              {statusLabel}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {recipe.servings} 🍽️ · {recipe.prepTime} · {recipe.cookTime}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
          title="Eliminar"
        >
          ✕
        </button>
      </div>
    </Link>
  );
}