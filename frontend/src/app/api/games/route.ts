import { NextRequest, NextResponse } from 'next/server';
import { getStore } from './store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag')?.toLowerCase();
  const search = searchParams.get('search')?.toLowerCase();

  let games = [...getStore()];

  if (tag) {
    games = games.filter((g) => g.tags.some((t) => t.toLowerCase() === tag));
  }

  if (search) {
    games = games.filter(
      (g) => g.title.toLowerCase().includes(search) || g.description.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    count: games.length,
    games,
  });
}
