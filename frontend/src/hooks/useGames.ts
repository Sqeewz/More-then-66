'use client';

import { useState, useEffect, useCallback } from 'react';
import { getGames } from '@/lib/api';
import { GameDocument } from '@/types/game';
import { LOCAL_STORAGE_GAMES_KEY } from '@/lib/constants';
import { getSupabaseClient } from '@/lib/supabase-client';

interface UseGamesResult {
  games: GameDocument[];
  setGames: React.Dispatch<React.SetStateAction<GameDocument[]>>;
  loading: boolean;
  refetch: () => void;
}

// Convert Supabase row format to GameDocument if needed
function parseSupabaseRow(row: any): GameDocument {
  if (row.metrics) return row as GameDocument;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    original_url: row.original_url,
    url: row.url || undefined,
    embed_code: row.embed_code || undefined,
    thumbnail_url: row.thumbnail_url || '',
    creator_id: row.creator_id || '',
    creator_email: row.creator_email || undefined,
    creator_name: row.creator_name || undefined,
    display_mode: row.display_mode || 'EMBEDDED',
    metrics: {
      views: row.views ?? 0,
      likes: row.likes ?? 0,
      rating: row.rating ?? 5.0,
    },
    tags: row.tags || [],
    created_at: row.created_at || new Date().toISOString(),
    qr_image_url: row.qr_image_url || undefined,
    cover_image_url: row.cover_image_url || undefined,
    pdf_drive_url: row.pdf_drive_url || undefined,
    pdf_title: row.pdf_title || undefined,
  };
}


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

  const fetchGames = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent && games.length === 0) setLoading(true);
      const res = await getGames(activeTag, searchQuery);
      const filtered = applyFilters(res.games || [], activeTag, searchQuery);
      setGames(filtered);
    } catch (err) {
      console.error('[useGames] Failed to load games from API/Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTag, searchQuery, games.length]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // ⚡ Supabase Realtime Subscription + Background Polling for 100% Real-Time Zero-Lag Sync
  useEffect(() => {
    const sb = getSupabaseClient();
    let channel: any = null;

    if (sb) {
      channel = sb
        .channel('public:games')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'games' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newGame = parseSupabaseRow(payload.new);
              setGames((prev) => {
                const exists = prev.some((g) => g.id === newGame.id);
                if (exists) return prev;
                return applyFilters([newGame, ...prev], activeTag, searchQuery);
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedGame = parseSupabaseRow(payload.new);
              setGames((prev) => {
                const updatedList = prev.map((g) =>
                  g.id === updatedGame.id ? { ...g, ...updatedGame } : g
                );
                return applyFilters(updatedList, activeTag, searchQuery);
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setGames((prev) => {
                const filtered = prev.filter((g) => g.id !== deletedId);
                return applyFilters(filtered, activeTag, searchQuery);
              });
            }
          }
        )
        .subscribe();
    }

    // Polling fallback every 10 seconds as backup
    const interval = setInterval(() => {
      fetchGames(true);
    }, 10000);

    return () => {
      if (sb && channel) {
        sb.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, [activeTag, searchQuery, fetchGames]);

  return { games, setGames, loading, refetch: () => fetchGames(false) };
}
