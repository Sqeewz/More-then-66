import { NextRequest, NextResponse } from 'next/server';
import { updateGameMetrics } from '../../store';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Require login to prevent like-bombing
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  }

  const updated = await updateGameMetrics(params.id, 0, 1);
  if (!updated) {
    return NextResponse.json({ error: 'ไม่พบเกม' }, { status: 404 });
  }
  return NextResponse.json({ game: updated });
}
