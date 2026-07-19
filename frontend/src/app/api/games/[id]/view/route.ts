import { NextRequest, NextResponse } from 'next/server';
import { updateGameMetrics } from '../../store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const updated = updateGameMetrics(params.id, 1, 0);
  if (!updated) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json({ game: updated });
}
