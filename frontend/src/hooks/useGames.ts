'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGames } from '@/lib/api';
import { GameDocument } from '@/types/game';
import { LOCAL_STORAGE_GAMES_KEY } from '@/lib/constants';

// ---------------------------------------------------------------------------
// useGames — Custom Hook (Single Responsibility Principle)
//
// Responsible for ONE thing only: providing a list of games that have been
// fetched from the API, merged with the user's local-storage submissions,
// and filtered by the supplied tag / search query.
//
// page.tsx no longer needs to know HOW data is loaded — it only consumes
// the resulting games array and the helper functions returned here.
// ---------------------------------------------------------------------------

interface UseGamesResult {
  games: GameDocument[];
  setGames: React.Dispatch<React.SetStateAction<GameDocument[]>>;
  loading: boolean;
  refetch: () => void;
}

/**
 * Merge games from the API with games stored in LocalStorage.
 * LocalStorage entries that already exist in the API response are skipped
 * to avoid duplicates.
 */
function mergeWithLocalStorage(apiGames: GameDocument[]): GameDocument[] {
  const merged = [...apiGames];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GAMES_KEY);
    if (raw) {
      const localGames: GameDocument[] = JSON.parse(raw);
      for (const lg of localGames) {
        if (!merged.some((g) => g.id === lg.id)) {
          merged.unshift(lg);
        }
      }
    }
  } catch {
    // LocalStorage unavailable (SSR, private browsing) — ignore silently
  }
  return merged;
}

/** Apply tag and full-text search filters to a list of games */
function applyFilters(games: GameDocument[], tag: string, query: string): GameDocument[] {
  let result = games;

  if (tag) {
    const tagLower = tag.toLowerCase();
    result = result.filter((g) => g.tags?.some((t) => t.toLowerCase() === tagLower));
  }

  if (query) {
    const queryLower = query.toLowerCase();
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(queryLower) ||
        g.description.toLowerCase().includes(queryLower) ||
        (g.creator_id && g.creator_id.toLowerCase().includes(queryLower))
    );
  }

  return result;
}

export function useGames(activeTag: string, searchQuery: string): UseGamesResult {
  const [games, setGames] = useState<GameDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGames(activeTag, searchQuery);
      const merged = mergeWithLocalStorage(res.games);
      const filtered = applyFilters(merged, activeTag, searchQuery);
      setGames(filtered);
    } catch (err) {
      console.error('[useGames] Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTag, searchQuery]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, setGames, loading, refetch: fetchGames };
}
