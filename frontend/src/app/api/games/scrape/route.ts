import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '../store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const scraped = await scrapeUrl(body.url);
    return NextResponse.json(scraped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scraping failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
