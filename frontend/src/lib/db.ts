import { GameDocument } from '@/types/game';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Default Seed Games for CS67
export const SEED_GAMES: GameDocument[] = [
  {
    id: 'seed-2048',
    title: '2048 Web Edition',
    description: 'เกมพัซเซิลคณิตศาสตร์ผสมตัวเลขเพื่อพิชิตไทล์ 2048 ผลงานเกมเว็บแนวคลาสสิกสำหรับชาว CS 67',
    original_url: 'https://play2048.co/',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    creator_id: 'นิสิต CS67 Team',
    display_mode: 'EMBEDDED',
    metrics: { views: 45, likes: 18, rating: 4.9 },
    tags: ['cs67', 'puzzle', 'math', 'casual', 'html5'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-hextris',
    title: 'Hextris HTML5',
    description: 'เกมพัซเซิลหมุนตารางหกเหลี่ยมความเร็วสูง ได้รับแรงบันดาลใจจาก Tetris สำหรับทดสอบ WebGL & Canvas',
    original_url: 'https://hextris.io/',
    thumbnail_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    creator_id: 'ทีมพัฒนา CS67',
    display_mode: 'EMBEDDED',
    metrics: { views: 82, likes: 34, rating: 4.8 },
    tags: ['cs67', 'arcade', 'action', 'webgl', 'puzzle'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-itch-demo',
    title: 'Cyber Samurai Arcade',
    description: 'เกมวิ่งแอ็กชันสไตล์นีออนไซเบอร์พังก์ ตัวอย่างผลงานเกมภายนอกที่ทดสอบระบบกรอบ iframe',
    original_url: 'https://itch.io/',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    creator_id: 'นิสิต CS67 Dev',
    display_mode: 'EMBEDDED',
    metrics: { views: 29, likes: 12, rating: 4.7 },
    tags: ['cs67', 'cyberpunk', 'itch-io', 'action'],
    created_at: new Date().toISOString(),
  },
];

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
        if (Array.isArray(parsed) && parsed.length > 0) {
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
