'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
  placeholder?: string;
  buttonText?: string;
}

export function SearchBar({ onSearch, loading, placeholder, buttonText }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Ej: arroz con marisco"}
          className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : (buttonText || 'Buscar')}
        </button>
      </div>
    </form>
  );
}