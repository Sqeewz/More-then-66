import { NextRequest, NextResponse } from 'next/server';
import { updateGame } from '../../store';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateGame(params.id, body, session.user.email);

    if (!updated) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไขเกมนี้ หรือไม่พบเกม' }, { status: 403 });
    }

    return NextResponse.json({ message: 'อัพเดทเกมเรียบร้อยแล้ว', game: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Edit failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
