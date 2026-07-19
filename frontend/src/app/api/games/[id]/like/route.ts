import { NextRequest, NextResponse } from 'next/server';
import { updateGameMetrics } from '../../store';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const updated = updateGameMetrics(params.id, 0, 1);
  if (!updated) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json({ game: updated });
}
