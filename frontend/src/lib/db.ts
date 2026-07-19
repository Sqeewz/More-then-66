import { GameDocument } from '@/types/game';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

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
  return SEED_GAMES;
}

export async function saveCloudGames(games: GameDocument[]): Promise<boolean> {
  if (KV_URL && KV_TOKEN) {
    const res = await kvFetch(['SET', 'cs67_games', JSON.stringify(games)]);
    return res === 'OK';
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
