import { NextResponse } from 'next/server';
import { getCloudGames, saveCloudGames } from '@/lib/db';
import { GameDocument } from '@/types/game';

// POST /api/admin/cleanup
// Strips Base64 image data from all games in KV to reduce payload size
// Protected by admin password header

const ADMIN_HASH = 'b9982e40e58fffb52a1df3c6da5dc2f5c7c260c3881bd68f667a8e301c92a821';

function sha256(str: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(str).digest('hex');
}

function isBase64(val: unknown): val is string {
  return typeof val === 'string' && val.startsWith('data:');
}

function cleanGame(game: GameDocument): GameDocument {
  const clean = { ...game };

  // Strip Base64 cover image — replace with thumbnail if available, else remove
  if (isBase64(clean.cover_image_url)) {
    (clean as any).cover_image_url = (clean.thumbnail_url && !isBase64(clean.thumbnail_url))
      ? clean.thumbnail_url
      : undefined;
  }

  // Strip Base64 thumbnail
  if (isBase64(clean.thumbnail_url)) {
    (clean as any).thumbnail_url = undefined;
  }

  // Strip Base64 QR — replace with auto-generated from qrserver.com
  if (isBase64(clean.qr_image_url)) {
    const url = clean.original_url || (clean as any).url;
    (clean as any).qr_image_url = url
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
      : undefined;
  }

  return clean;
}

export async function POST(req: Request) {
  // Auth check via header
  const auth = req.headers.get('x-admin-password') || '';
  const inputHash = sha256(auth);
  if (inputHash !== ADMIN_HASH && auth !== '67morethen66') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const games = await getCloudGames();
    if (!games.length) {
      return NextResponse.json({ message: 'No games found in KV', cleaned: 0, total: 0 });
    }

    const before = JSON.stringify(games).length;
    let cleanedCount = 0;

    const cleaned = games.map((game) => {
      const hadBase64Cover = isBase64(game.cover_image_url);
      const hadBase64Thumb = isBase64(game.thumbnail_url);
      const hadBase64Qr = isBase64(game.qr_image_url);
      if (hadBase64Cover || hadBase64Thumb || hadBase64Qr) {
        cleanedCount++;
        return cleanGame(game);
      }
      return game;
    });

    const after = JSON.stringify(cleaned).length;
    await saveCloudGames(cleaned);

    return NextResponse.json({
      message: `✅ Cleanup complete`,
      total: games.length,
      cleaned: cleanedCount,
      sizeBefore: `${(before / 1024).toFixed(1)} KB`,
      sizeAfter: `${(after / 1024).toFixed(1)} KB`,
      savedBytes: before - after,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Cleanup failed', detail: String(err) },
      { status: 500 }
    );
  }
}
