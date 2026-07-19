import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '../store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const game = getStore().find((g) => g.id === params.id);
  if (!game) {
    return NextResponse.json({ error: `Game with id '${params.id}' not found` }, { status: 404 });
  }
  return NextResponse.json({ game });
}
