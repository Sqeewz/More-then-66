import { NextRequest, NextResponse } from 'next/server';
import { addGame, scrapeUrl } from '../store';
import { GameDocument } from '@/types/game';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const scraped = await scrapeUrl(body.url);

    const newGame: GameDocument = {
      id: `user-${Date.now()}`,
      title: body.custom_title || scraped.title,
      description: body.custom_description || scraped.description,
      original_url: body.url,
      thumbnail_url: body.custom_thumbnail_url || scraped.thumbnail_url,
      creator_id: body.creator_id || 'นิสิต CS 67',
      display_mode: scraped.display_mode,
      metrics: { views: 0, likes: 0, rating: 5.0 },
      tags: body.custom_tags || scraped.tags,
      created_at: new Date().toISOString(),
    };

    addGame(newGame);

    return NextResponse.json({
      message: 'Game submitted successfully',
      game: newGame,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Submission failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
