import { createClient } from '@supabase/supabase-js';
import { GameDocument } from '@/types/game';

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('[db] Missing SUPABASE_URL or SUPABASE_KEY');
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// Default Seed Games (Production games — self-seeding fallback if DB is empty)
export const SEED_GAMES: GameDocument[] = [
  {
    id: 'user-1786710181397',
    title: 'HCI: Code Escape Runner',
    description: 'เกมแนว Action Logic Puzzle & Code-Based Runner ที่ผู้เล่นต้องวางแผนเชิงตรรกะด้วย "การ์ดคำสั่ง" (Action Cards) จัดเรียงลงใน Timeline เพื่อให้ตัวละครวิ่งหลบสิ่งกีดขวางโดยอัตโนมัติ',
    original_url: 'https://sqeewz.itch.io/hci',
    url: 'https://sqeewz.itch.io/hci',
    embed_code: undefined,
    thumbnail_url: 'https://lh3.googleusercontent.com/d/1X4BILUHkX611eXml7aUTegZBi7qFzfDV',
    creator_id: 'kanakrit.pr@rmuti.ac.th',
    creator_email: 'kanakrit.pr@rmuti.ac.th',
    creator_name: 'Kanakrit Promwises',
    display_mode: 'EMBEDDED',
    metrics: { views: 60000, likes: 59999, rating: 5.0 },
    tags: ['cs67', 'hci', 'puzzle', 'runner', 'godot', 'logic', 'action', 'card-game'],
    qr_image_url: 'https://lh3.googleusercontent.com/d/11vSxT-JQZ9O2opQSo04t_T9404eqZQpQ',
    cover_image_url: 'https://lh3.googleusercontent.com/d/1X4BILUHkX611eXml7aUTegZBi7qFzfDV',
    pdf_drive_url: 'https://drive.google.com/file/d/1443_pbCkenVe3aTHQoL1rzH0BgkgawDZ/preview',
    pdf_title: 'คู่มือการเล่นเกม How Can I',
    created_at: '2026-08-14T12:23:01.397Z',
  },
  {
    id: 'user-1786714035465',
    title: 'Eco Ranger: Trash Tamer',
    description: 'Eco Ranger: Trash Tamer is an educational top-down 2D shooter designed to teach proper waste separation in a fun and interactive way.\n\nPlayers switch between four bullet colors to match and eliminate different types of trash monsters, representing four waste categories:\n\n🔴 Hazardous Waste\n🟡 Recyclable Waste\n🔵 General Waste\n🟢 Organic Waste\nThe game encourages players to recognize waste categories, improve reaction skills, and learn environmental responsibility through gameplay.',
    original_url: 'https://jujubeano.itch.io/eco-ranger-trash-tamer',
    url: 'https://jujubeano.itch.io/eco-ranger-trash-tamer',
    embed_code: undefined,
    thumbnail_url: 'https://lh3.googleusercontent.com/d/1ZSakTlp9EOZmI9ub80xx9DQf5JKtG5aE',
    creator_id: 'chotika.ja@rmuti.ac.th',
    creator_email: 'chotika.ja@rmuti.ac.th',
    creator_name: 'Chotika Jakchai',
    display_mode: 'EMBEDDED',
    metrics: { views: 1, likes: 1, rating: 5.0 },
    tags: ['cs67', '2d', 'shooter', 'pixel-art', 'itch.io'],
    qr_image_url: 'https://lh3.googleusercontent.com/d/1QJ97pyipV7dymc5GmVXPxLQcZjQoMybP',
    cover_image_url: 'https://lh3.googleusercontent.com/d/1ZSakTlp9EOZmI9ub80xx9DQf5JKtG5aE',
    pdf_drive_url: 'https://drive.google.com/file/d/1nMf0EpKvlzLN92JNvc2wY6oaQHAXibfj/preview',
    pdf_title: 'คู่มือเกมส์ Eco-Ranger Trash Tamer.pdf',
    created_at: '2026-08-14T13:27:15.465Z',
  },
];

// แปลง Supabase row → GameDocument
function rowToGame(row: Record<string, unknown>): GameDocument {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    original_url: row.original_url as string,
    url: (row.url as string) || undefined,
    embed_code: (row.embed_code as string) || undefined,
    thumbnail_url: (row.thumbnail_url as string) || '',
    creator_id: (row.creator_id as string) || '',
    creator_email: (row.creator_email as string) || undefined,
    creator_name: (row.creator_name as string) || undefined,
    display_mode: ((row.display_mode as string) || 'EMBEDDED') as 'EMBEDDED' | 'POPUP',
    metrics: {
      views: (row.views as number) || 0,
      likes: (row.likes as number) || 0,
      rating: (row.rating as number) || 5.0,
    },
    tags: (row.tags as string[]) || [],
    created_at: row.created_at as string,
    qr_image_url: (row.qr_image_url as string) || undefined,
    cover_image_url: (row.cover_image_url as string) || undefined,
    pdf_drive_url: (row.pdf_drive_url as string) || undefined,
    pdf_title: (row.pdf_title as string) || undefined,
  };
}

// แปลง GameDocument → Supabase row (flat)
function gameToRow(game: GameDocument) {
  return {
    id: game.id,
    title: game.title,
    description: game.description || '',
    original_url: game.original_url,
    url: game.url || null,
    embed_code: game.embed_code || null,
    thumbnail_url: game.thumbnail_url || '',
    creator_id: game.creator_id || '',
    creator_email: game.creator_email || null,
    creator_name: game.creator_name || null,
    display_mode: game.display_mode || 'EMBEDDED',
    views: game.metrics?.views ?? 0,
    likes: game.metrics?.likes ?? 0,
    rating: game.metrics?.rating ?? 5.0,
    tags: game.tags || [],
    qr_image_url: game.qr_image_url || null,
    cover_image_url: game.cover_image_url || null,
    pdf_drive_url: game.pdf_drive_url || null,
    pdf_title: game.pdf_title || null,
    created_at: game.created_at || new Date().toISOString(),
  };
}

export async function getCloudGames(): Promise<GameDocument[]> {
  const sb = getSupabase();
  if (!sb) {
    console.error('[db] Supabase client unavailable — check SUPABASE_URL and SUPABASE_KEY');
    return [];
  }

  const { data, error } = await sb.from('games').select('*');

  if (error) {
    console.error('[db] getCloudGames error:', error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const games = data.map(rowToGame);
  return games.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
}

// เพิ่ม/อัพเดท game รายการเดียว (upsert)
export async function addCloudGame(game: GameDocument): Promise<GameDocument[]> {
  const sb = getSupabase();
  if (!sb) throw new Error('[db] Supabase client unavailable — check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  const row = gameToRow(game);
  console.log('[db] upserting game permanently to Supabase:', game.id, game.title);
  const { error } = await sb.from('games').upsert(row);
  if (error) {
    console.error('[db] addCloudGame error:', error.message, error.code, error.details);
    throw new Error(`Supabase upsert failed: ${error.message} (code: ${error.code})`);
  }
  console.log('[db] upsert success:', game.id);
  return getCloudGames();
}

// ลบ game รายการเดียว
export async function deleteCloudGame(id: string): Promise<GameDocument[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { error } = await sb.from('games').delete().eq('id', id);
  if (error) console.error('[db] deleteCloudGame error:', error.message);

  return getCloudGames();
}

// อัพเดท game รายการเดียว (partial update)
export async function updateCloudGame(
  id: string,
  updates: Partial<GameDocument>
): Promise<GameDocument | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // แปลง metrics → flat columns
  const patch: Record<string, unknown> = { ...updates };
  if (updates.metrics) {
    patch.views = updates.metrics.views;
    patch.likes = updates.metrics.likes;
    patch.rating = updates.metrics.rating;
    delete patch.metrics;
  }

  const { data, error } = await sb
    .from('games')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[db] updateCloudGame error:', error.message);
    return null;
  }
  return rowToGame(data);
}

// เพิ่ม views/likes สำหรับ game หนึ่งรายการ
export async function incrementGameMetrics(
  id: string,
  viewInc = 0,
  likeInc = 0
): Promise<GameDocument | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // ดึงค่าปัจจุบันก่อน แล้วบวกเพิ่ม
  const { data: current, error: fetchErr } = await sb
    .from('games')
    .select('views, likes')
    .eq('id', id)
    .single();

  if (fetchErr || !current) return null;

  return updateCloudGame(id, {
    metrics: {
      views: (current.views || 0) + viewInc,
      likes: (current.likes || 0) + likeInc,
      rating: 5.0,
    },
  });
}

// --- Backward-compat stubs (ใช้กับ store.ts เดิม) ---

// saveCloudGames เดิมบันทึกทั้ง array — ตอนนี้ไม่จำเป็นแล้ว
// แต่ยังคงไว้เพื่อไม่ให้ code เดิม break
export async function saveCloudGames(games: GameDocument[]): Promise<boolean> {
  if (!Array.isArray(games)) return false;
  const sb = getSupabase();
  if (!sb) return false;

  // upsert ทีละ record
  const rows = games.map(gameToRow);
  const { error } = await sb.from('games').upsert(rows);
  if (error) {
    console.error('[db] saveCloudGames error:', error.message);
    return false;
  }
  return true;
}
