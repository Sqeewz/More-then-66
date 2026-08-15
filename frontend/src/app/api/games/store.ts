import { GameDocument, DisplayMode, ScrapedMetadata } from '@/types/game';
import { getCloudGames, addCloudGame, deleteCloudGame, updateCloudGame, incrementGameMetrics } from '@/lib/db';

const BLOCKED_KEYWORDS = [
  // Gambling / Casino keywords
  'casino', 'slot', 'baccarat', 'pgslot', 'pg-slot', 'bet', 'gambling', 'poker', 'hilo',
  'แทงบอล', 'สล็อต', 'คาสิโน', 'บาคาร่า', 'หวย', 'ufabet', '777', '888', 'vipbet', 'bk8',
  'w88', 'fun88', 'm88', 'sa gaming', 'sexy baccarat', 'เว็บพนัน', 'แทงหวย', 'พนัน',
  // Adult / NSFW keywords
  'porn', 'xxx', 'adult', 'hentai', 'nsfw', 'sex', 'erotic', 'xvideos', 'pornhub', 'xnxx', '18+'
];

export function checkUrlSafety(url: string, htmlContent?: string): { safe: boolean; reason?: string } {
  const lowerUrl = url.toLowerCase();

  for (const kw of BLOCKED_KEYWORDS) {
    if (lowerUrl.includes(kw)) {
      return {
        safe: false,
        reason: `⚠️ ระบบปฏิเสธ URL นี้: ตรวจพบคำต้องห้าม "${kw}" (ไม่อนุญาตเว็บพนัน สล็อต หรือสื่อไม่เหมาะสม)`,
      };
    }
  }

  if (htmlContent) {
    const lowerHtml = htmlContent.toLowerCase();
    for (const kw of BLOCKED_KEYWORDS) {
      if (lowerHtml.includes(` ${kw} `) || lowerHtml.includes(`"${kw}"`) || lowerHtml.includes(`>${kw}<`)) {
        return {
          safe: false,
          reason: `⚠️ ระบบปฏิเสธ URL นี้: ตรวจพบเนื้อหาเว็บพนันหรือสื่อไม่เหมาะสมในเว็บไซต์ ("${kw}")`,
        };
      }
    }
  }

  return { safe: true };
}

export async function getStore(): Promise<GameDocument[]> {
  try {
    return await getCloudGames();
  } catch (e) {
    return [];
  }
}

export async function addGame(game: GameDocument): Promise<GameDocument> {
  game.display_mode = 'EMBEDDED';
  try {
    await addCloudGame(game);
  } catch (e) {
    console.error('[addGame] Failed to save to Supabase:', e);
  }
  return game;
}

export async function updateGame(
  id: string,
  updates: Partial<GameDocument>,
  requesterEmail?: string
): Promise<GameDocument | null> {
  if (!id || id === 'undefined') return null;

  const games = await getStore();
  let gameIndex = games.findIndex((g) => g.id === id);

  if (gameIndex === -1) {
    const newEntry: GameDocument = {
      id,
      title: updates.title || 'CS67 Game',
      description: updates.description || '',
      original_url: updates.original_url || (updates as any).url || '',
      url: updates.original_url || (updates as any).url || '',
      thumbnail_url: updates.cover_image_url || '',
      creator_id: requesterEmail || 'CS 67',
      display_mode: 'EMBEDDED',
      metrics: { views: 0, likes: 0, rating: 5.0 },
      tags: updates.tags || ['cs67'],
      created_at: new Date().toISOString(),
    };
    games.unshift(newEntry);
    gameIndex = 0;
  }

  const game = games[gameIndex];

  // Permission check: owner email or logged-in user
  const isOwner = !!(requesterEmail && game.creator_email && game.creator_email.toLowerCase() === requesterEmail.toLowerCase());
  const canEdit = isOwner || !!requesterEmail;

  if (!canEdit) return null;

  const allowedUpdates: Partial<GameDocument> = {
    title: updates.title ?? game.title,
    description: updates.description ?? game.description,
    original_url: updates.original_url ?? (updates as any).url ?? game.original_url,
    url: updates.original_url ?? (updates as any).url ?? (game as any).url ?? game.original_url,
    cover_image_url: updates.cover_image_url ?? game.cover_image_url,
    qr_image_url: updates.qr_image_url ?? game.qr_image_url,
    pdf_drive_url: updates.pdf_drive_url ?? game.pdf_drive_url,
    pdf_title: updates.pdf_title ?? game.pdf_title,
    tags: updates.tags ?? game.tags,
    thumbnail_url: updates.thumbnail_url ?? (updates.cover_image_url ? updates.cover_image_url : game.thumbnail_url),
  };

  const merged = { ...game, ...allowedUpdates };

  try {
    const updated = await updateCloudGame(id, allowedUpdates);
    return updated || merged;
  } catch (e) {
    return merged;
  }
}

export async function deleteGameByEmail(
  id: string,
  requesterEmail: string
): Promise<boolean> {
  const games = await getStore();
  const game = games.find((g) => g.id === id);
  if (!game) return false;

  const canDelete =
    game.creator_email && game.creator_email.toLowerCase() === requesterEmail.toLowerCase();

  if (!canDelete) return false;

  try {
    await deleteCloudGame(id);
  } catch (e) {}

  return true;
}

export async function updateGameMetrics(id: string, viewInc = 0, likeInc = 0): Promise<GameDocument | null> {
  try {
    return await incrementGameMetrics(id, viewInc, likeInc);
  } catch (e) {
    return null;
  }
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedMetadata> {
  const urlCheck = checkUrlSafety(targetUrl);
  if (!urlCheck.safe) {
    throw new Error(urlCheck.reason || 'URL ไม่อนุญาต');
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebGameAggregator/1.0',
      },
    });

    const html = await res.text();

    const htmlCheck = checkUrlSafety(targetUrl, html);
    if (!htmlCheck.safe) {
      throw new Error(htmlCheck.reason || 'เนื้อหาเว็บไซต์ไม่ผ่านเกณฑ์ความปลอดภัย');
    }

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitleMatch?.[1] || titleTagMatch?.[1] || 'ผลงานเกม CS67';

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = ogDescMatch?.[1] || metaDescMatch?.[1] || 'เล่นผลงานเว็บเกมนี้บนแพลตฟอร์ม More Then 66 (CS67)';

    const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    let thumbnail_url = ogImgMatch?.[1] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';

    if (thumbnail_url.startsWith('/')) {
      const u = new URL(targetUrl);
      thumbnail_url = `${u.origin}${thumbnail_url}`;
    }

    const tags: string[] = ['cs67', 'arcade'];
    if (targetUrl.includes('itch.io')) tags.push('itch-io');
    if (targetUrl.includes('gamejolt')) tags.push('game-jolt');
    if (html.toLowerCase().includes('webgl')) tags.push('webgl');
    if (html.toLowerCase().includes('canvas')) tags.push('html5');

    return {
      title: title.trim(),
      description: description.trim(),
      thumbnail_url,
      display_mode: 'EMBEDDED' as DisplayMode,
      tags: Array.from(new Set(tags)),
      original_url: targetUrl,
      embed_code: undefined,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('⚠️')) {
      throw err;
    }
    return {
      title: 'ผลงานเว็บเกม CS 67',
      description: 'เล่นผลงานเว็บเกมสดผ่านระบบ Sandboxed Player 16:9',
      thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      display_mode: 'EMBEDDED' as DisplayMode,
      tags: ['cs67', 'arcade', 'webgl'],
      original_url: targetUrl,
      embed_code: undefined,
    };
  }
}
