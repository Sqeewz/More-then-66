import { GameDocument } from '@/types/game';
import { put, list } from '@vercel/blob';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Default Seed Games for CS67 (Empty so only user submitted games appear)
export const SEED_GAMES: GameDocument[] = [];

// Helper to query Upstash / Vercel KV REST API
async function kvFetch(command: string[]): Promise<any> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error('KV Storage Error:', err);
    return null;
  }
}

export async function getCloudGames(): Promise<GameDocument[]> {
  // 1. Try Upstash / Vercel KV
  if (KV_URL && KV_TOKEN) {
    const raw = await kvFetch(['GET', 'cs67_games']);
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Fallback to Vercel Blob Storage JSON persistence
  if (BLOB_TOKEN) {
    try {
      const blobs = await list({ prefix: 'data/cs67_games.json', token: BLOB_TOKEN });
      if (blobs.blobs.length > 0) {
        // Fetch the newest blob
        const latestBlob = blobs.blobs[0];
        const res = await fetch(latestBlob.url, { cache: 'no-store' });
        if (res.ok) {
          const parsed = await res.json();
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Vercel Blob Storage Load Error:', e);
    }
  }

  return SEED_GAMES;
}

export async function saveCloudGames(games: GameDocument[]): Promise<boolean> {
  // 1. Try Upstash / Vercel KV
  if (KV_URL && KV_TOKEN) {
    const res = await kvFetch(['SET', 'cs67_games', JSON.stringify(games)]);
    if (res === 'OK') return true;
  }

  // 2. Fallback to Vercel Blob Storage JSON persistence
  if (BLOB_TOKEN) {
    try {
      await put('data/cs67_games.json', JSON.stringify(games), {
        access: 'public',
        addRandomSuffix: false,
        token: BLOB_TOKEN,
      });
      return true;
    } catch (e) {
      console.error('Vercel Blob Storage Save Error:', e);
    }
  }

  return false;
}

export async function addCloudGame(game: GameDocument): Promise<GameDocument[]> {
  const current = await getCloudGames();
  const updated = [game, ...current.filter((g) => g.id !== game.id)];
  await saveCloudGames(updated);
  return updated;
}

export async function deleteCloudGame(id: string): Promise<GameDocument[]> {
  const current = await getCloudGames();
  const updated = current.filter((g) => g.id !== id);
  await saveCloudGames(updated);
  return updated;
}

